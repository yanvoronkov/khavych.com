import { NextResponse } from "next/server";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Получение списка всех заказов в админ-панели (GET)
 * Путь: /api/admin/orders
 */
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    logger.error({ error }, "Ошибка при получении списка заказов в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось загрузить список заказов",
      },
      { status: 500 }
    );
  }
}
