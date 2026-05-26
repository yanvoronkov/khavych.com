import { NextResponse } from "next/server";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";
import { sendOrderCancelledEmail } from "src/lib/email";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * Публичный эндпоинт для отмены заказа самим клиентом в корзине.
 * Разрешено только для заказов в статусе PENDING.
 * Путь: /api/orders/[id]/cancel
 */
export async function POST(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // 1. Ищем заказ в БД
    const order = await db.order.findUnique({
      where: { id },
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

    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          error: true,
          code: "INVALID_STATUS",
          message: "Этот заказ не может быть отменен (уже оплачен или отменен)",
        },
        { status: 400 }
      );
    }

    // 2. Обновляем статус заказа в БД на CANCELLED
    await db.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // 3. Отправляем Telegram-уведомление администратору об отмене клиентом
    await sendTelegramClientCancelNotification(order);

    try {
      await sendOrderCancelledEmail({
        toEmail: order.customerEmail,
        customerName: order.customerName,
        orderId: order.id,
      });
    } catch (err) {
      logger.error({ err, orderId: order.id }, "Ошибка при отправке письма об отмене заказа клиентом");
    }

    logger.info({ orderId: id }, "Заказ успешно отменен клиентом из корзины");

    return NextResponse.json({
      success: true,
      message: "Заказ успешно отменен",
    });
  } catch (error: any) {
    logger.error({ error, orderId: params }, "Ошибка при отмене заказа клиентом");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось отменить заказ",
      },
      { status: 500 }
    );
  }
}

/**
 * Вспомогательная функция отправки Telegram-уведомления об отмене заказа клиентом
 */
async function sendTelegramClientCancelNotification(order: any) {
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
    logger.warn({ err }, "Не удалось прочитать настройки Telegram для уведомления об отмене");
  }

  if (!token || !chatId || token === "your-telegram-bot-token" || chatId === "your-telegram-chat-id") {
    return;
  }

  const text = `❌ <b>ЗАКАЗ ОТМЕНЕН КЛИЕНТОМ В КОРЗИНЕ</b>\n
🆔 <b>ID Заказа:</b> <code>${order.id}</code>
👤 <b>Клиент:</b> <b>${order.customerName}</b>
📧 <b>Email:</b> <code>${order.customerEmail}</code>
💰 <b>Сумма заказа:</b> <b>${Number(order.totalAmount).toLocaleString("de-DE")} €</b>\n
📊 <b>Статус:</b> <b><u>Отменен покупателем самостоятельно</u></b>\n
💬 <i>Заказ был отменен клиентом на шаге оплаты в корзине сайта.</i>`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    logger.error({ err, orderId: order.id }, "Исключение при отправке Telegram уведомления об отмене клиентом");
  }
}
