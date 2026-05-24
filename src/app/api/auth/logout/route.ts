import { NextRequest, NextResponse } from "next/server";
import { logger } from "src/lib/logger";

/**
 * Общая вспомогательная функция для удаления сессионной куки из ответа.
 * 
 * @param response Объект ответа NextResponse, в котором нужно очистить куку
 * @returns Модифицированный объект ответа
 */
function handleLogout(response: NextResponse) {
  response.cookies.set("khavych_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  logger.info("Пользователь успешно вышел из системы (кука удалена)");
  return response;
}

/**
 * Обработчик POST запроса на выход из системы.
 * Полезен для асинхронных запросов на клиенте.
 * 
 * @returns JSON ответ об успешном выходе
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Выход выполнен успешно",
    });
    return handleLogout(response);
  } catch (error) {
    logger.error({ error }, "Ошибка при POST выходе из системы");
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

/**
 * Обработчик GET запроса на выход из системы.
 * Автоматически срабатывает при клике на стандартную ссылку <a>.
 * Очищает куку сессии и выполняет редирект на страницу входа (/login).
 * 
 * @param request Объект входящего запроса
 * @returns Редирект на страницу входа с очищенной кукой
 */
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.redirect(new URL("/login", request.url));
    return handleLogout(response);
  } catch (error) {
    logger.error({ error }, "Ошибка при GET выходе из системы");
    // В крайнем случае все равно перенаправляем на /login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
