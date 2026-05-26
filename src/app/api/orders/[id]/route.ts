import { NextResponse } from "next/server";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * Публичный эндпоинт для получения базовой информации о заказе по его ID.
 * Используется для восстановления неоплаченного заказа.
 * Безопасен: возвращает только неконфиденциальные данные.
 * Путь: /api/orders/[id]
 */
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Ищем заказ в базе данных
    const order = await db.order.findUnique({
      where: { id },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        totalAmount: true,
        status: true,
        items: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Указанный заказ не найден",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    logger.error({ error, orderId: params }, "Ошибка при публичном получении информации о заказе");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось загрузить данные заказа",
      },
      { status: 500 }
    );
  }
}
