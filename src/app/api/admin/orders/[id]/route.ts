import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { logger } from "src/lib/logger";
import { sendWelcomeEmail, sendOrderCancelledEmail } from "src/lib/email";

export const dynamic = "force-dynamic";

const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * Изменение статуса заказа администратором (PUT)
 * Путь: /api/admin/orders/[id]
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
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

    const { id } = await params;

    // 1. Проверяем существование заказа
    const order = await db.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: true,
          code: "NOT_FOUND",
          message: "Указанный заказ не найден",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = orderUpdateSchema.parse(body);

    const oldStatus = order.status;
    const newStatus = validatedData.status;

    // Если статус не изменился, просто отдаем успех
    if (oldStatus === newStatus) {
      return NextResponse.json({ success: true, order });
    }

    // 2. Если заказ переходит в PAID, выполняем авторегистрацию и выдачу доступов
    if (newStatus === "PAID") {
      // Безопасный парсинг товаров
      let orderItems: any[] = [];
      try {
        if (typeof order.items === "string") {
          orderItems = JSON.parse(order.items);
        } else if (Array.isArray(order.items)) {
          orderItems = order.items as any[];
        }
      } catch (e) {
        logger.error({ e, orderId: order.id }, "Ошибка парсинга items в заказе");
      }

      const emailLower = order.customerEmail.toLowerCase().trim();

      // Выполняем операции в транзакции
      await db.$transaction(async (tx) => {
        // Обновляем статус заказа
        await tx.order.update({
          where: { id },
          data: { status: "PAID" },
        });

        // Ищем существующего пользователя
        let user = await tx.user.findUnique({
          where: { email: emailLower },
        });

        let temporaryPassword = "";
        let isNewUser = false;

        // Если пользователя нет, создаем его (авторегистрация)
        if (!user) {
          isNewUser = true;
          // Генерируем премиальный пароль вида welcome1234
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
              additionalInfo: `Создан автоматически при покупке заказа #${order.id.substring(0, 8)}`,
            },
          });

          // Связываем заказ с созданным пользователем
          await tx.order.update({
            where: { id },
            data: { userId: user.id },
          });
        }

        // Для каждого товара-курса выдаем доступ
        for (const item of orderItems) {
          if (item.category === "COURSE") {
            // Находим товар в БД, чтобы взять courseId
            const product = await tx.product.findUnique({
              where: { id: item.id },
              select: { courseId: true },
            });

            if (product && product.courseId) {
              // Проверяем, есть ли уже доступ к этому курсу у юзера
              const existingAccess = await tx.userAccess.findUnique({
                where: {
                  userId_courseId: {
                    userId: user.id,
                    courseId: product.courseId,
                  },
                },
              });

              // Если доступа нет, создаем бессрочный доступ
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

        // Отправка Email-письма ученику
        // Ссылка на личный кабинет
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://khavich.com"}/cabinet`;

        sendWelcomeEmail({
          toEmail: emailLower,
          customerName: order.customerName,
          temporaryPassword: isNewUser ? temporaryPassword : undefined,
          loginUrl,
        }).catch((err) => {
          logger.error({ err, email: emailLower }, "Ошибка при отправке приветственного письма клиенту");
        });
      });

      // Отправляем Telegram-уведомление администратору о ручном подтверждении оплаты
      await sendTelegramStatusNotification(order, "PAID");
    } else {
      // Для остальных статусов просто обновляем статус в БД
      await db.order.update({
        where: { id },
        data: { status: newStatus },
      });

      if (newStatus === "CANCELLED") {
        await sendTelegramStatusNotification(order, "CANCELLED");

        // Отправка Email клиенту об отмене
        sendOrderCancelledEmail({
          toEmail: order.customerEmail,
          customerName: order.customerName,
          orderId: order.id,
        }).catch((err) => {
          logger.error({ err, orderId: order.id }, "Ошибка при отправке письма об отмене заказа");
        });
      }
    }

    const updatedOrder = await db.order.findUnique({
      where: { id },
    });

    logger.info(
      { adminId: session.userId, orderId: id, oldStatus, newStatus },
      "Статус заказа успешно обновлен администратором"
    );

    return NextResponse.json({ success: true, order: updatedOrder });
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

    logger.error({ error, orderId: params }, "Ошибка при обновлении статуса заказа в API");
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось обновить статус заказа",
      },
      { status: 500 }
    );
  }
}

/**
 * Вспомогательная функция отправки статусного уведомления в Telegram Ольге
 */
async function sendTelegramStatusNotification(order: any, status: "PAID" | "CANCELLED") {
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
    logger.warn({ err }, "Не удалось прочитать настройки Telegram из БД для статусного уведомления");
  }

  if (!token || !chatId || token === "your-telegram-bot-token" || chatId === "your-telegram-chat-id") {
    return;
  }

  const statusLabel = status === "PAID" ? "✅ ОПЛАЧЕН (РУЧНОЕ ПОДТВЕРЖДЕНИЕ)" : "❌ ОТМЕНЕН";
  const emoji = status === "PAID" ? "💰" : "🚫";

  const text = `${emoji} <b>СТАТУС ЗАКАЗА ИЗМЕНЕН</b>\n
🆔 <b>ID Заказа:</b> <code>${order.id}</code>
👤 <b>Клиент:</b> <b>${order.customerName}</b>
📧 <b>Email:</b> <code>${order.customerEmail}</code>
💰 <b>Сумма заказа:</b> <b>${Number(order.totalAmount).toLocaleString("de-DE")} €</b>\n
📊 <b>Новый статус:</b> <b><u>${statusLabel}</u></b>\n
${status === "PAID" ? "🎓 <i>Доступы к курсам автоматически открыты, приветственное письмо со ссылкой на Личный кабинет отправлено клиенту!</i>" : "<i>Заказ был отменен администратором сайта.</i>"}`;

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
    logger.error({ err, orderId: order.id }, "Исключение при отправке статусного уведомления в Telegram");
  }
}
