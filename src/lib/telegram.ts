import { db } from "./db";
import { logger } from "./logger";

/**
 * Отправляет сообщение в Telegram на один или несколько Chat ID, указанных в настройках.
 * Поддерживает множественные адресаты через запятую, точку с запятой или пробел.
 * 
 * @param message Текст сообщения в формате HTML
 * @returns true, если хотя бы одно сообщение отправлено успешно
 */
export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    // 1. Загружаем настройки токена и Chat ID из базы данных
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ["telegramBotToken", "telegramChatId"],
        },
      },
    });

    const token = settings.find((s) => s.key === "telegramBotToken")?.value?.trim();
    const rawChatId = settings.find((s) => s.key === "telegramChatId")?.value?.trim();

    if (!token || !rawChatId) {
      logger.info("Отправка Telegram пропущена: токен или Chat ID не настроены");
      return false;
    }

    // 2. Разделяем множественные Chat ID по запятой, точке с запятой или пробелу
    const chatIds = rawChatId.split(/[\s,;]+/).filter(Boolean);

    if (chatIds.length === 0) {
      logger.info("Отправка Telegram пропущена: список Chat ID пуст");
      return false;
    }

    logger.info({ chatIdsCount: chatIds.length }, "Запуск рассылки уведомления в Telegram");

    // 3. Отправляем сообщения параллельно на все указанные Chat ID
    const sendPromises = chatIds.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        });

        const resData = await response.json();
        if (!response.ok || !resData.ok) {
          logger.error({ chatId, error: resData.description }, "Ошибка отправки в Telegram для Chat ID");
          return false;
        }

        return true;
      } catch (err) {
        logger.error({ chatId, err }, "Исключение сети при отправке в Telegram");
        return false;
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(Boolean).length;

    logger.info({ successCount, totalCount: chatIds.length }, "Рассылка в Telegram завершена");

    return successCount > 0;
  } catch (error) {
    logger.error({ error }, "Ошибка при запуске отправки Telegram-уведомления");
    return false;
  }
}
