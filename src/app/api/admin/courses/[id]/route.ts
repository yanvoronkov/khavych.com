import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

// Схема валидации тела запроса
const courseUpdateSchema = z.object({
  title: z.string().min(1, "Название курса не должно быть пустым"),
  imageUrl: z.string().optional().nullable(),
});

/**
 * Редактирование параметров курса администратором (PUT)
 * Путь: /api/admin/courses/[id]
 * 
 * @param request Объект запроса
 * @param context Контекст роута, содержащий параметры пути
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: true,
          code: "BAD_REQUEST",
          message: "ID курса не передан",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = courseUpdateSchema.parse(body);

    // Проверяем, существует ли курс
    const existingCourse = await db.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Курс не найден",
        },
        { status: 404 }
      );
    }

    // Обновляем курс в БД
    const updatedCourse = await db.course.update({
      where: { id },
      data: {
        title: validatedData.title.trim(),
        imageUrl: validatedData.imageUrl?.trim() || null,
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    logger.info(
      { adminId: session.userId, courseId: id },
      "Курс успешно обновлен администратором"
    );

    return NextResponse.json({
      success: true,
      course: updatedCourse,
    });
  } catch (error: unknown) {
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

    logger.error({ error }, "Ошибка при редактировании курса в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось обновить параметры курса",
      },
      { status: 500 }
    );
  }
}
