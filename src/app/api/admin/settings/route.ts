import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

export const dynamic = "force-dynamic";

// Схема валидации для настроек
const settingsSchema = z.object({
  action: z.enum(["save", "testTelegram"]).optional().default("save"),
  telegramBotToken: z.string().optional().nullable(),
  telegramChatId: z.string().optional().nullable(),
});

/**
 * Получение настроек администратором (GET)
 * Путь: /api/admin/settings
 */
export async function GET() {
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

    // Загружаем настройки из базы
    const dbSettings = await db.setting.findMany();
    
    // Формируем плоский объект настроек
    const settings: Record<string, string> = {};
    dbSettings.forEach((s) => {
      settings[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: {
        telegramBotToken: settings.telegramBotToken || "",
        telegramChatId: settings.telegramChatId || "",
      },
    });
  } catch (error: any) {
    logger.error({ error }, "Ошибка при получении настроек в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось загрузить настройки",
      },
      { status: 500 }
    );
  }
}

/**
 * Сохранение настроек или проверка Telegram бота (POST)
 * Путь: /api/admin/settings
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
    const validatedData = settingsSchema.parse(body);

    // --- СЦЕНАРИЙ 1: Тестовая отправка сообщения ---
    if (validatedData.action === "testTelegram") {
      const token = validatedData.telegramBotToken?.trim();
      const chatId = validatedData.telegramChatId?.trim();

      if (!token || !chatId) {
        return NextResponse.json(
          {
            error: true,
            code: "BAD_REQUEST",
            message: "Для отправки тестового сообщения необходимы и токен, и ID чата",
          },
          { status: 400 }
        );
      }

      console.log(`🤖 Отправка тестового сообщения через бот к чату ${chatId}`);

      const testMsg = `🧪 <b>ТЕСТ УВЕДОМЛЕНИЙ • KHAVYCH.COM</b>\n\n` +
                      `✅ Поздравляем! Ваш Telegram бот успешно настроен и подключен к панели управления Ольги Хавич.\n\n` +
                      `⚙️ <b>Статус:</b> Готов к приему реальных заказов.\n` +
                      `⏰ <b>Время проверки:</b> <code>${new Date().toLocaleTimeString("de-DE")}</code>`;

      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMsg,
          parse_mode: "HTML",
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.ok) {
        throw new Error(resData.description || "Telegram API вернул ошибку");
      }

      return NextResponse.json({
        success: true,
        message: "Тестовое сообщение успешно отправлено в ваш Telegram!",
      });
    }

    // --- СЦЕНАРИЙ 2: Сохранение настроек в БД ---
    const tokenVal = validatedData.telegramBotToken?.trim() || "";
    const chatIdVal = validatedData.telegramChatId?.trim() || "";

    if (!tokenVal || !chatIdVal) {
      return NextResponse.json(
        {
          error: true,
          code: "BAD_REQUEST",
          message: "Для сохранения настроек необходимо заполнить оба поля: Токен бота и ID чата",
        },
        { status: 400 }
      );
    }

    // Сохраняем токен
    await db.setting.upsert({
      where: { key: "telegramBotToken" },
      update: { value: tokenVal },
      create: { key: "telegramBotToken", value: tokenVal },
    });

    // Сохраняем chat ID
    await db.setting.upsert({
      where: { key: "telegramChatId" },
      update: { value: chatIdVal },
      create: { key: "telegramChatId", value: chatIdVal },
    });

    logger.info("Настройки уведомлений Telegram успешно сохранены в базе данных");

    return NextResponse.json({
      success: true,
      message: "Настройки успешно сохранены в базе данных!",
    });
  } catch (error: any) {
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

    logger.error({ error }, "Ошибка при сохранении настроек в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Не удалось сохранить настройки на сервере",
      },
      { status: 500 }
    );
  }
}
