import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

// Схема валидации данных для регистрации через Zod
const registerSchema = z.object({
  email: z.string().email("Неверный формат Email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  name: z.string().min(2, "Имя должно быть не менее 2 символов"),
  phone: z.string().min(8, "Телефон должен быть не менее 8 цифр"),
});

/**
 * Обработчик POST запроса на регистрацию нового ученика.
 * Путь: /api/auth/register
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Валидация входных данных
    const validatedData = registerSchema.parse(body);

    // 2. Проверка, существует ли уже пользователь с таким email
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      logger.warn({ email: validatedData.email }, "Попытка регистрации на уже существующий email");
      return NextResponse.json(
        {
          error: true,
          code: "EMAIL_EXISTS",
          message: "Пользователь с таким Email уже зарегистрирован",
        },
        { status: 400 }
      );
    }

    // 3. Хеширование пароля (в соответствии с RULE[user_global])
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

    // 4. Определение роли (если регистрируется сама Ольга, даем роль ADMIN)
    const emailLower = validatedData.email.toLowerCase();
    const role = emailLower === "olga.k77@gmx.de" ? "ADMIN" : "USER";

    // 5. Создание записи в базе данных
    const user = await db.user.create({
      data: {
        email: emailLower,
        passwordHash,
        name: validatedData.name,
        phone: validatedData.phone,
        role: role,
      },
    });

    logger.info({ userId: user.id, role: user.role }, "Новый пользователь успешно зарегистрирован");

    return NextResponse.json({
      success: true,
      message: "Регистрация прошла успешно",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: true,
          code: "VALIDATION_ERROR",
          message: "Некоторые поля заполнены неверно",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error({ error }, "Ошибка при регистрации пользователя");
    return NextResponse.json(
      {
        error: true,
        code: "SERVER_ERROR",
        message: "Произошла внутренняя ошибка при регистрации",
      },
      { status: 500 }
    );
  }
}
