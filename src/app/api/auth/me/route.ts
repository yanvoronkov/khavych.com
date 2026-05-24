import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { logger } from "src/lib/logger";

/**
 * Обработчик GET запроса для проверки текущей сессии пользователя.
 * Путь: /api/auth/me
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("khavych_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const secret = process.env.JWT_SECRET || "local-development-secret-key-change-me-in-production";
    
    // Верифицируем токен
    try {
      const decoded = jwt.verify(token, secret) as {
        userId: string;
        email: string;
        role: string;
        name: string;
      };

      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        },
      });
    } catch (jwtError) {
      logger.warn({ jwtError }, "Недействительный или просроченный JWT токен");
      
      // Токен невалиден, очищаем куку у клиента
      const response = NextResponse.json({ authenticated: false }, { status: 200 });
      response.cookies.set("khavych_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
      return response;
    }
  } catch (error) {
    logger.error({ error }, "Ошибка при проверке сессии пользователя");
    return NextResponse.json(
      {
        error: true,
        code: "SERVER_ERROR",
        message: "Ошибка сервера при проверке авторизации",
      },
      { status: 500 }
    );
  }
}
