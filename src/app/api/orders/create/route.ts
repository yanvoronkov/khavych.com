import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";

// Схема валидации входящего запроса на создание заказа с помощью Zod
const orderCreateSchema = z.object({
  customerName: z.string().min(2, "Имя должно быть не менее 2 символов"),
  customerEmail: z.string().email("Неверный формат Email"),
  customerPhone: z.string().min(8, "Телефон должен быть не менее 8 цифр"),
  customerAddress: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      category: z.enum(["BRACELET", "COURSE", "CONSULTATION"]),
    })
  ).min(1, "Корзина не должна быть пустой"),
  totalAmount: z.number().positive(),
});

/**
 * Обработчик POST запроса на создание нового заказа.
 * Путь: /api/orders/create
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.info({ body }, "Получен запрос на создание нового заказа");

    // 1. Валидация входных данных через Zod
    const validatedData = orderCreateSchema.parse(body);

    // 2. Создание заказа в базе данных PostgreSQL внутри транзакции
    // Соответствует RULE[user_global] о важности транзакций для целостности данных
    const order = await db.$transaction(async (tx) => {
      // Ищем, есть ли уже зарегистрированный пользователь с таким Email
      const existingUser = await tx.user.findUnique({
        where: { email: validatedData.customerEmail },
      });

      // Создаем запись заказа в БД
      return await tx.order.create({
        data: {
          userId: existingUser ? existingUser.id : null, // Связываем с юзером, если он есть
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone,
          customerAddress: validatedData.customerAddress || null,
          items: JSON.stringify(validatedData.items), // Сохраняем перечень как JSON
          totalAmount: validatedData.totalAmount,
          status: "PENDING", // Начальный статус — ожидает оплаты
        },
      });
    });

    logger.info({ orderId: order.id }, "Заказ успешно создан в базе данных");

    // 3. Отправка уведомления в Telegram Ольге
    await sendTelegramNotification(validatedData, order.id);

    return NextResponse.json({
      success: true,
      message: "Заказ успешно создан",
      orderId: order.id,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      logger.warn({ issues: error.issues }, "Ошибка валидации входящих данных заказа");
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

    logger.error({ error }, "Критическая ошибка при создании заказа");
    return NextResponse.json(
      {
        error: true,
        code: "SERVER_ERROR",
        message: "Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже.",
      },
      { status: 500 }
    );
  }
}

/**
 * Вспомогательная функция для отправки уведомления в Telegram
 */
async function sendTelegramNotification(
  data: z.infer<typeof orderCreateSchema>,
  orderId: string
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Если ключи не настроены (например, при локальной разработке), просто логируем это
  if (!token || !chatId || token === "your-telegram-bot-token" || chatId === "your-telegram-chat-id") {
    logger.warn(
      { orderId },
      "Уведомление в Telegram не отправлено: не настроены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в .env"
    );
    return;
  }

  // Формируем красивое HTML сообщение для Telegram
  const itemsText = data.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${item.name}</b> (${item.quantity} шт.) — <code>${(
          item.price * item.quantity
        ).toLocaleString("de-DE")} €</code>`
    )
    .join("\n");

  const addressText = data.customerAddress
    ? `\n📍 <b>Адрес доставки:</b> <code>${data.customerAddress}</code>`
    : "";

  const text = `🔔 <b>НОВЫЙ ЗАКАЗ НА САЙТЕ KHAVYCH.COM</b>\n
🆔 <b>ID Заказа:</b> <code>${orderId}</code>
👤 <b>Клиент:</b> <b>${data.customerName}</b>
📞 <b>Телефон:</b> <code>${data.customerPhone}</code>
📧 <b>Email:</b> <code>${data.customerEmail}</code>${addressText}\n
📦 <b>Содержимое заказа:</b>
${itemsText}\n
💰 <b>Итого к оплате:</b> <b><u>${data.totalAmount.toLocaleString("de-DE")} €</u></b>\n
💬 <i>Ольга, свяжитесь с клиентом в WhatsApp или по почте для подтверждения заказа и выставления счета!</i>`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

    if (!response.ok) {
      const responseData = await response.json();
      logger.error({ responseData }, "Ошибка от API Telegram при отправке лога");
    } else {
      logger.info({ orderId }, "Уведомление о заказе успешно отправлено в Telegram");
    }
  } catch (err) {
    logger.error({ err, orderId }, "Исключение при отправке уведомления в Telegram");
  }
}
