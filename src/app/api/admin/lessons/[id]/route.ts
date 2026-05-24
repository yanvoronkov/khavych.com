import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

const updateLessonSchema = z.object({
  title: z.string().min(1, "Название урока не должно быть пустым").optional(),
  description: z.string().optional(),
  videoUrl: z.string().nullable().optional(),
  fileUrls: z.array(z.string()).optional(),
  order: z.number().int("Порядок должен быть целым числом").optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Обработчик PUT запроса для обновления существующего урока.
 * Доступен только для роли ADMIN.
 * Путь: /api/admin/lessons/[id]
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      logger.warn({ session }, "Несанкционированная попытка изменения урока");
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Проверяем, существует ли урок
    const existingLesson = await db.lesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Урок не найден",
        },
        { status: 404 }
      );
    }

    // Валидация входящих данных
    const body = await request.json();
    const validatedData = updateLessonSchema.parse(body);

    // Обновляем урок
    const updatedLesson = await db.lesson.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        videoUrl: validatedData.videoUrl !== undefined ? (validatedData.videoUrl || null) : undefined,
        fileUrls: validatedData.fileUrls,
        order: validatedData.order,
      },
    });

    logger.info(
      { adminId: session.userId, lessonId: id },
      "Администратор успешно обновил урок"
    );

    return NextResponse.json({
      success: true,
      message: "Урок успешно обновлен",
      lesson: updatedLesson,
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

    logger.error({ error }, "Ошибка при обновлении урока в админке");
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

/**
 * Обработчик DELETE запроса для удаления урока.
 * Доступен только для роли ADMIN.
 * Путь: /api/admin/lessons/[id]
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== "ADMIN") {
      logger.warn({ session }, "Несанкционированная попытка удаления урока");
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "У вас нет прав для выполнения этого действия",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Проверяем, существует ли урок
    const existingLesson = await db.lesson.findUnique({
      where: { id },
    });

    if (!existingLesson) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Урок не найден",
        },
        { status: 404 }
      );
    }

    // Удаляем урок из БД
    await db.lesson.delete({
      where: { id },
    });

    logger.info(
      { adminId: session.userId, lessonId: id },
      "Администратор успешно удалил урок"
    );

    return NextResponse.json({
      success: true,
      message: "Урок успешно удален",
    });
  } catch (error: unknown) {
    logger.error({ error }, "Ошибка при удалении урока в админке");
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
