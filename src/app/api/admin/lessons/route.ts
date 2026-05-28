import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

const createLessonSchema = z.object({
  courseId: z.string().min(1, "ID курса не должен быть пустым"),
  title: z.string().min(1, "Название урока не должно быть пустым"),
  description: z.string(),
  videoUrl: z.string().nullable().optional(),
  videoCoverUrl: z.string().nullable().optional(),
  fileUrls: z.array(z.string()).default([]),
  order: z.number().int("Порядок должен быть целым числом").default(0),
});

/**
 * Обработчик POST запроса для создания нового урока в курсе.
 * Доступен только для роли ADMIN.
 * Путь: /api/admin/lessons
 */
export async function POST(request: Request) {
  try {
    // 1. Проверяем сессию и роль администратора
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      logger.warn({ session }, "Несанкционированная попытка создания урока");
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
    const validatedData = createLessonSchema.parse(body);
    const { courseId, title, description, videoUrl, videoCoverUrl, fileUrls, order } = validatedData;

    // 3. Создаем урок в базе данных
    const newLesson = await db.lesson.create({
      data: {
        courseId,
        title,
        description,
        videoUrl: videoUrl || null,
        videoCoverUrl: videoCoverUrl || null,
        fileUrls,
        order,
      },
    });

    logger.info(
      { adminId: session.userId, lessonId: newLesson.id, courseId },
      "Администратор создал новый урок"
    );

    return NextResponse.json({
      success: true,
      message: "Урок успешно создан",
      lesson: newLesson,
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

    logger.error({ error }, "Ошибка при создании урока в админке");
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
