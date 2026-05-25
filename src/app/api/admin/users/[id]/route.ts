import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

// Схема валидации входящих данных для редактирования пользователя
const userUpdateSchema = z.object({
  email: z.string().email("Неверный формат Email"),
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  phone: z.string().min(6, "Телефон должен быть не менее 6 символов"),
  additionalInfo: z.string().optional().nullable(),
});

/**
 * Редактирование параметров ученика администратором (PUT)
 * Путь: /api/admin/users/[id]
 * 
 * @param request Объект запроса
 * @param context Контекст с параметрами пути
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
          message: "ID пользователя не передан",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    const emailLower = validatedData.email.toLowerCase().trim();

    // Проверяем, существует ли редактируемый пользователь
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        },
        { status: 404 }
      );
    }

    // Проверяем, не занята ли новая почта другим пользователем
    if (existingUser.email !== emailLower) {
      const emailConflict = await db.user.findUnique({
        where: { email: emailLower },
      });

      if (emailConflict) {
        return NextResponse.json(
          {
            error: true,
            code: "EMAIL_EXISTS",
            message: "Данный Email уже занят другим пользователем",
          },
          { status: 400 }
        );
      }
    }

    // Обновляем данные пользователя
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        email: emailLower,
        name: validatedData.name.trim(),
        phone: validatedData.phone.trim(),
        additionalInfo: validatedData.additionalInfo?.trim() || null,
      },
      include: {
        accesses: true,
      },
    });

    logger.info(
      { adminId: session.userId, targetUserId: id },
      "Данные пользователя успешно обновлены администратором"
    );

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        additionalInfo: updatedUser.additionalInfo,
        accesses: updatedUser.accesses.map((a) => ({
          courseId: a.courseId,
          grantedAt: a.grantedAt.toISOString(),
          expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
        })),
      },
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

    logger.error({ error }, "Ошибка при редактировании пользователя в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось обновить данные пользователя",
      },
      { status: 500 }
    );
  }
}

/**
 * Удаление ученика администратором (DELETE)
 * Путь: /api/admin/users/[id]
 * 
 * @param request Объект запроса
 * @param context Контекст с параметрами пути
 */
export async function DELETE(
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
          message: "ID пользователя не передан",
        },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        },
        { status: 404 }
      );
    }

    // Запрещено удалять самого себя (администратора)
    if (existingUser.id === session.userId) {
      return NextResponse.json(
        {
          error: true,
          code: "FORBIDDEN",
          message: "Вы не можете удалить свой собственный аккаунт администратора",
        },
        { status: 400 }
      );
    }

    // Удаляем пользователя
    await db.user.delete({
      where: { id },
    });

    logger.info(
      { adminId: session.userId, deletedUserId: id },
      "Пользователь успешно удален из базы данных администратором"
    );

    return NextResponse.json({
      success: true,
      message: "Пользователь успешно удален",
    });
  } catch (error: unknown) {
    logger.error({ error }, "Ошибка при удалении пользователя в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось удалить пользователя из базы данных",
      },
      { status: 500 }
    );
  }
}
