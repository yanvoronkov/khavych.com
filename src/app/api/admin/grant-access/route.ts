import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

// Схема валидации входящего запроса через Zod
const grantAccessSchema = z.object({
  userId: z.string().uuid("Неверный формат ID пользователя"),
  courseId: z.string().min(1, "ID курса не должен быть пустым"),
  grant: z.boolean(),
  expiresAt: z.string().nullable().optional(), // ISO строка даты или null
});

/**
 * Обработчик POST запроса для ручной выдачи или отзыва доступа к курсу с возможностью ограничения по времени.
 * Доступен только для пользователей с ролью ADMIN.
 * Путь: /api/admin/grant-access
 */
export async function POST(request: Request) {
  try {
    // 1. Проверяем сессию и роль администратора
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      logger.warn({ session }, "Несанкционированная попытка управления доступами");
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    // 2. Валидация входных данных
    const body = await request.json();
    const validatedData = grantAccessSchema.parse(body);
    const { userId, courseId, grant, expiresAt } = validatedData;

    // Срок действия в формате Date или null
    const expiresDate = expiresAt ? new Date(expiresAt) : null;

    // 3. Выполняем операцию в базе данных
    if (grant) {
      // Предоставляем доступ (используем upsert для исключения дублирования)
      await db.userAccess.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        update: {
          expiresAt: expiresDate, // Обновляем срок действия, если запись уже существует
        },
        create: {
          userId,
          courseId,
          expiresAt: expiresDate,
        },
      });

      logger.info(
        { adminId: session.userId, targetUserId: userId, courseId, expiresDate },
        "Администратор предоставил доступ к курсу"
      );
    } else {
      // Отзываем доступ
      await db.userAccess.deleteMany({
        where: {
          userId,
          courseId,
        },
      });

      logger.info(
        { adminId: session.userId, targetUserId: userId, courseId },
        "Администратор отозвал доступ к курсу"
      );
    }

    return NextResponse.json({
      success: true,
      message: grant ? "Доступ успешно предоставлен" : "Доступ успешно отозван",
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: true,
          code: "VALIDATION_ERROR",
          message: "Неверные параметры запроса",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error({ error }, "Ошибка при изменении доступа к курсу в админке");
    return NextResponse.json(
      {
        error: true,
        code: "SERVER_ERROR",
        message: "Произошла внутренняя ошибка сервера",
      },
      { status: 500 }
    );
  }
}
