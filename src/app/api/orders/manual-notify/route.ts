import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

export const dynamic = "force-dynamic";

const manualNotifySchema = z.object({
  orderId: z.string().uuid("Некорректный ID заказа"),
});

/**
 * Уведомление администратора в Telegram о том, что клиент выбрал ручную оплату.
 * Путь: /api/orders/manual-notify
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = manualNotifySchema.parse(body);

    const { orderId } = validatedData;

    // 1. Ищем заказ в БД
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Заказ не найден",
        },
        { status: 404 }
      );
    }

    // 2. Отправляем уведомление в Telegram Ольге
    await sendTelegramManualNotify(order);

    logger.info({ orderId }, "Уведомление о ручной оплате успешно обработано");

    return NextResponse.json({
      success: true,
      message: "Уведомление отправлено администратору",
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

    logger.error({ error }, "Ошибка при отправке уведомления о ручной оплате");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось отправить уведомление",
      },
      { status: 500 }
    );
  }
}

/**
 * Вспомогательная функция для отправки Telegram-уведомления о ручном переводе
 */
async function sendTelegramManualNotify(order: any) {
  let token = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    const [dbToken, dbChatId] = await Promise.all([
      db.setting.findUnique({ where: { key: "telegramBotToken" } }),
      db.setting.findUnique({ where: { key: "telegramChatId" } }),
    ]);

    if (dbToken && dbToken.value.trim()) token = dbToken.value.trim();
    if (dbChatId && dbChatId.value.trim()) chatId = dbChatId.value.trim();
  } catch (err) {
    logger.warn({ err }, "Не удалось прочитать настройки Telegram из базы данных");
  }

  if (!token || !chatId || token === "your-telegram-bot-token" || chatId === "your-telegram-chat-id") {
    return;
  }

  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  const itemsText = Array.isArray(items)
    ? items
        .map(
          (item: any, idx: number) =>
            `${idx + 1}. <b>${item.name}</b> (${item.quantity} шт.) — <code>${(
              item.price * item.quantity
            ).toLocaleString("de-DE")} €</code>`
        )
        .join("\n")
    : "";

  const text = `💳 <b>КЛИЕНТ ВЫБРАЛ ОПЛАТУ РУЧНЫМ ПЕРЕВОДОМ</b>\n
🆔 <b>ID Заказа:</b> <code>${order.id}</code>
👤 <b>Клиент:</b> <b>${order.customerName}</b>
📞 <b>Телефон:</b> <code>${order.customerPhone}</code>
📧 <b>Email:</b> <code>${order.customerEmail}</code>\n
📦 <b>Содержимое заказа:</b>
${itemsText}\n
💰 <b>Итого к оплате:</b> <b><u>${Number(order.totalAmount).toLocaleString("de-DE")} €</u></b>\n
💬 <i>Ольга, свяжитесь с клиентом в WhatsApp или Telegram для отправки реквизитов карты! Ссылка на оплату также доступна в вашей панели управления в разделе «Заказы».</i>`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    logger.error({ err, orderId: order.id }, "Исключение при отправке ручного уведомления в Telegram");
  }
}
