import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

// Отключаем кэширование и принудительно делаем роут динамическим
export const dynamic = "force-dynamic";

const createCourseSchema = z.object({
  title: z.string().min(1, "Название курса не должно быть пустым"),
  titleDe: z.string().optional().nullable(),
  description: z.string().min(1, "Описание курса не должно быть пустым"),
  descriptionDe: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imageUrlDe: z.string().optional().nullable(),
});

/**
 * Создание нового курса администратором (POST)
 * Путь: /api/admin/courses
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Создаем курс в базе данных
    const newCourse = await db.course.create({
      data: {
        title: validatedData.title.trim(),
        titleDe: validatedData.titleDe?.trim() || null,
        description: validatedData.description.trim(),
        descriptionDe: validatedData.descriptionDe?.trim() || null,
        imageUrl: validatedData.imageUrl?.trim() || null,
        imageUrlDe: validatedData.imageUrlDe?.trim() || null,
        isPublished: true, // По умолчанию публикуем созданный курс
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    logger.info(
      { adminId: session.userId, courseId: newCourse.id },
      "Администратор создал новый курс"
    );

    return NextResponse.json({
      success: true,
      course: newCourse,
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

    logger.error({ error }, "Ошибка при создании курса в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать курс",
      },
      { status: 500 }
    );
  }
}
