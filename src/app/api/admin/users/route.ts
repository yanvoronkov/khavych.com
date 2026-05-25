import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

// Схема валидации входящих данных для создания пользователя
const userCreateSchema = z.object({
  email: z.string().email("Неверный формат Email"),
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  phone: z.string().min(6, "Телефон должен быть не менее 6 символов"),
  additionalInfo: z.string().optional().nullable(),
});

/**
 * Создание нового пользователя (ученика) администратором (POST)
 * Путь: /api/admin/users
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
    const validatedData = userCreateSchema.parse(body);

    const emailLower = validatedData.email.toLowerCase().trim();

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await db.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: true,
          code: "EMAIL_EXISTS",
          message: "Пользователь с таким Email уже зарегистрирован",
        },
        { status: 400 }
      );
    }

    // Хешируем временный пароль по умолчанию
    const defaultPassword = "khavich2026";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Создаем пользователя в БД
    const newUser = await db.user.create({
      data: {
        email: emailLower,
        name: validatedData.name.trim(),
        phone: validatedData.phone.trim(),
        passwordHash,
        role: "USER",
        additionalInfo: validatedData.additionalInfo?.trim() || null,
      },
      include: {
        accesses: true,
      },
    });

    logger.info(
      { adminId: session.userId, newUserId: newUser.id },
      "Администратор успешно создал нового ученика"
    );

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        additionalInfo: newUser.additionalInfo,
        accesses: [],
      },
      defaultPassword, // Возвращаем дефолтный пароль, чтобы показать админу
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

    logger.error({ error }, "Ошибка при создании пользователя в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать пользователя на сервере",
      },
      { status: 500 }
    );
  }
}
