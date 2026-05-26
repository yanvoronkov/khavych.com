import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";
import { createPaypalOrder } from "src/lib/paypal";

export const dynamic = "force-dynamic";

const paypalCreateSchema = z.object({
  orderId: z.string().uuid("Некорректный ID заказа"),
});

/**
 * Инициация платежа PayPal на основе существующего локального заказа.
 * Предотвращает подмену суммы на стороне клиента.
 * Путь: /api/orders/paypal/create
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = paypalCreateSchema.parse(body);

    // 1. Загружаем локальный заказ из базы данных
    const order = await db.order.findUnique({
      where: { id: validatedData.orderId },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Заказ не найден в базе данных",
        },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          error: true,
          code: "INVALID_STATUS",
          message: "Этот заказ не может быть оплачен (уже оплачен или отменен)",
        },
        { status: 400 }
      );
    }

    // 2. Инициализируем платеж на стороне PayPal с точной суммой заказа
    const amount = Number(order.totalAmount);
    
    logger.info({ orderId: order.id, amount }, "Инициация платежа в PayPal для локального заказа");
    
    const paypalOrderId = await createPaypalOrder(amount, "EUR");

    return NextResponse.json({
      success: true,
      paypalOrderId, // ID транзакции для кнопок на фронтенде
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: true,
          code: "VALIDATION_ERROR",
          message: "Ошибка валидации входных данных",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    logger.error({ error }, "Ошибка при инициации платежа PayPal");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать транзакцию на стороне платежной системы",
      },
      { status: 500 }
    );
  }
}
