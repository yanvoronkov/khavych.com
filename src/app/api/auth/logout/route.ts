import { NextResponse } from "next/server";
import { logger } from "src/lib/logger";

/**
 * Обработчик POST запроса на выход пользователя.
 * Путь: /api/auth/logout
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Выход выполнен успешно",
    });

    // Удаляем куку путем установки ее срока действия в прошлое
    response.cookies.set("khavych_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    logger.info("Пользователь успешно вышел из системы");
    return response;
  } catch (error) {
    logger.error({ error }, "Ошибка при выходе из системы");
    return NextResponse.json(
      {
        error: true,
        code: "SERVER_ERROR",
        message: "Ошибка сервера при выходе из системы",
      },
      { status: 500 }
    );
  }
}
