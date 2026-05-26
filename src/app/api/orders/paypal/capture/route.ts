import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";
import { capturePaypalOrder } from "src/lib/paypal";
import { sendOrderPaidEmail } from "src/lib/email";

export const dynamic = "force-dynamic";

const paypalCaptureSchema = z.object({
  orderId: z.string().uuid("Некорректный ID заказа"),
  paypalOrderId: z.string().min(1, "ID транзакции PayPal обязателен"),
});

/**
 * Подтверждение (Capture) и финализация платежа PayPal.
 * Активирует заказ в БД, регистрирует ученика и выдает доступ к курсам.
 * Путь: /api/orders/paypal/capture
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = paypalCaptureSchema.parse(body);

    const { orderId, paypalOrderId } = validatedData;

    // 1. Проверяем существование локального заказа
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Локальный заказ не найден",
        },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        {
          error: true,
          code: "INVALID_STATUS",
          message: "Этот заказ уже обработан",
        },
        { status: 400 }
      );
    }

    // 2. Делаем Capture (захват средств) в PayPal
    logger.info({ orderId, paypalOrderId }, "Запрос Capture платежа в PayPal");
    const captureResult = await capturePaypalOrder(paypalOrderId);

    if (captureResult.status !== "COMPLETED") {
      logger.warn(
        { orderId, paypalOrderId, status: captureResult.status },
        "Транзакция PayPal не завершена"
      );
      return NextResponse.json(
        {
          error: true,
          code: "PAYMENT_NOT_COMPLETED",
          message: `Платеж не завершен. Статус: ${captureResult.status}`,
        },
        { status: 400 }
      );
    }

    // 3. Платеж успешен! Переводим заказ в статус PAID, выдаем доступы и регистрируем гостя
    let orderItems: any[] = [];
    try {
      if (typeof order.items === "string") {
        orderItems = JSON.parse(order.items);
      } else if (Array.isArray(order.items)) {
        orderItems = order.items as any[];
      }
    } catch (e) {
      logger.error({ e, orderId: order.id }, "Ошибка парсинга items в заказе при capture");
    }

    const emailLower = order.customerEmail.toLowerCase().trim();

    await db.$transaction(async (tx) => {
      // Обновляем статус на PAID
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      // Проверяем существование пользователя
      let user = await tx.user.findUnique({
        where: { email: emailLower },
      });

      let temporaryPassword = "";
      let isNewUser = false;

      // Авторегистрация гостя
      if (!user) {
        isNewUser = true;
        const randNum = Math.floor(1000 + Math.random() * 9000);
        temporaryPassword = `welcome${randNum}`;
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(temporaryPassword, saltRounds);

        user = await tx.user.create({
          data: {
            email: emailLower,
            name: order.customerName.trim(),
            phone: order.customerPhone.trim(),
            passwordHash,
            role: "USER",
            additionalInfo: `Зарегистрирован автоматически при онлайн-оплате заказа #${order.id.substring(0, 8)} через PayPal`,
          },
        });

        // Связываем заказ с созданным юзером
        await tx.order.update({
          where: { id: orderId },
          data: { userId: user.id },
        });
      }

      // Выдача доступов к курсам
      for (const item of orderItems) {
        if (item.category === "COURSE") {
          const product = await tx.product.findUnique({
            where: { id: item.id },
            select: { courseId: true },
          });

          if (product && product.courseId) {
            const existingAccess = await tx.userAccess.findUnique({
              where: {
                userId_courseId: {
                  userId: user.id,
                  courseId: product.courseId,
                },
              },
            });

            if (!existingAccess) {
              await tx.userAccess.create({
                data: {
                  userId: user.id,
                  courseId: product.courseId,
                },
              });
            }
          }
        }
      }

      // Отправка письма на почту через Resend
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://khavich.com"}/cabinet`;
      
      sendOrderPaidEmail({
        toEmail: emailLower,
        customerName: order.customerName,
        orderId: order.id,
        items: orderItems,
        totalAmount: Number(order.totalAmount),
        temporaryPassword: isNewUser ? temporaryPassword : undefined,
        loginUrl,
      }).catch((err) => {
        logger.error({ err, email: emailLower }, "Ошибка отправки письма об успешной оплате при capture");
      });
    });

    // 4. Отправляем Telegram-уведомление администратору об успешной авто-оплате PayPal
    await sendTelegramPaypalNotification(order);

    logger.info({ orderId }, "Заказ успешно оплачен через PayPal и активирован");

    return NextResponse.json({
      success: true,
      message: "Платеж успешно подтвержден, доступы выданы",
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

    logger.error({ error }, "Ошибка при capture платежа PayPal");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Произошла ошибка при финализации транзакции",
      },
      { status: 500 }
    );
  }
}

/**
 * Вспомогательная функция отправки Telegram-уведомления об оплате PayPal
 */
async function sendTelegramPaypalNotification(order: any) {
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
    logger.warn({ err }, "Не удалось прочитать настройки Telegram для PayPal уведомления");
  }

  if (!token || !chatId || token === "your-telegram-bot-token" || chatId === "your-telegram-chat-id") {
    return;
  }

  const text = `💰 <b>УСПЕШНАЯ ОНЛАЙН-ОПЛАТА PAYPAL</b>\n
🆔 <b>ID Заказа:</b> <code>${order.id}</code>
👤 <b>Клиент:</b> <b>${order.customerName}</b>
📧 <b>Email:</b> <code>${order.customerEmail}</code>
💰 <b>Сумма оплаты:</b> <b><u>${Number(order.totalAmount).toLocaleString("de-DE")} €</u></b>\n
🎓 <i>Платеж обработан автоматически! Пользователю создан аккаунт (если это новый гость) и отправлено письмо с доступами в Личный кабинет. Проверьте новые доступы в админке!</i>`;

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
    logger.error({ err, orderId: order.id }, "Ошибка при отправке Telegram сообщения об оплате PayPal");
  }
}
