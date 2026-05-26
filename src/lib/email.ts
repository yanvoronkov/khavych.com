import { logger } from "./logger";

// Получаем API ключ Resend из переменных окружения
const resendApiKey = process.env.RESEND_API_KEY;

// Почтовый ящик отправителя по умолчанию
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

/**
 * Вспомогательная функция для отправки писем через прямой REST API запрос к Resend.
 * Это гарантирует 100% стабильную отправку в Next.js без сетевых ошибок SDK.
 */
async function sendEmailViaRest({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!resendApiKey) {
    logger.warn({ to }, "RESEND_API_KEY не настроен. Отправка письма пропущена.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error({ error: data, to }, "Ошибка Resend API при отправке письма через REST");
      return false;
    }

    logger.info({ to, id: data.id }, "Письмо успешно отправлено через Resend REST API");
    return true;
  } catch (error: any) {
    logger.error({ error, to }, "Критическая ошибка при отправке письма через REST");
    return false;
  }
}

interface ISendWelcomeEmailParams {
  toEmail: string;
  customerName: string;
  temporaryPassword?: string;
  loginUrl: string;
}

/**
 * Отправка приветственного письма с учетными данными для входа в Личный кабинет.
 * 
 * @param params Параметры для формирования письма
 */
export async function sendWelcomeEmail({
  toEmail,
  customerName,
  temporaryPassword,
  loginUrl,
}: ISendWelcomeEmailParams): Promise<boolean> {
  if (!resendApiKey) {
    logger.warn(
      { toEmail },
      "Resend API Key не настроен. Отправка приветственного письма пропущена."
    );
    return false;
  }

    const isNewUser = !!temporaryPassword;
    
    // Формируем тему письма
    const subject = isNewUser 
      ? "Добро пожаловать в Личный кабинет Ольги Хавич! Доступ к курсу открыт" 
      : "Доступ к новому курсу открыт в вашем Личном кабинете!";

    // Премиальный HTML-шаблон письма в золотисто-бордовой гамме
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #fcf9f6;
              color: #2b2b2b;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #eae0db;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(107, 29, 47, 0.05);
            }
            .header {
              background-color: #6b1d2f; /* Бордовый */
              padding: 40px 20px;
              text-align: center;
              border-bottom: 3px solid #d4af37; /* Золотой */
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .content {
              padding: 40px 30px;
              line-height: 1.6;
            }
            .greeting {
              font-size: 18px;
              font-weight: 700;
              color: #6b1d2f;
              margin-bottom: 20px;
            }
            .credentials-block {
              background-color: #fbf7f5;
              border-left: 4px solid #d4af37;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .credentials-title {
              font-weight: 700;
              color: #6b1d2f;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .credential-item {
              margin: 8px 0;
              font-size: 15px;
            }
            .credential-label {
              font-weight: 600;
              color: #555555;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #6b1d2f 0%, #4a101d 100%);
              color: #ffffff !important;
              text-decoration: none;
              padding: 14px 30px;
              border-radius: 6px;
              font-weight: 700;
              font-size: 15px;
              text-align: center;
              margin: 20px 0;
              border: 1px solid #6b1d2f;
              box-shadow: 0 4px 8px rgba(107, 29, 47, 0.2);
            }
            .footer {
              background-color: #fbf7f5;
              padding: 25px;
              text-align: center;
              font-size: 12px;
              color: #888888;
              border-top: 1px solid #eae0db;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ОЛЬГА ХАВИЧ</h1>
            </div>
            <div class="content">
              <div class="greeting">Здравствуйте, ${customerName}!</div>
              <p>Мы рады сообщить, что ваш заказ успешно оплачен, и вам предоставлен доступ к обучающим материалам.</p>
              
              ${isNewUser ? `
                <p>Для вас автоматически создана учетная запись в нашей онлайн-школе. Ниже указаны ваши реквизиты для входа:</p>
                <div class="credentials-block">
                  <div class="credentials-title">Данные для авторизации</div>
                  <div class="credential-item">
                    <span class="credential-label">Ссылка для входа:</span> 
                    <a href="${loginUrl}" style="color: #6b1d2f; font-weight: 600;">${loginUrl}</a>
                  </div>
                  <div class="credential-item">
                    <span class="credential-label">Логин (Email):</span> <strong>${toEmail}</strong>
                  </div>
                  <div class="credential-item">
                    <span class="credential-label">Временный пароль:</span> <strong style="color: #c62828; font-size: 16px; font-family: monospace;">${temporaryPassword}</strong>
                  </div>
                </div>
                <p style="font-size: 13px; color: #666; font-style: italic;">Рекомендуем изменить временный пароль в профиле Личного кабинета сразу после первого входа.</p>
              ` : `
                <p>Поскольку у вас уже есть аккаунт ученика, новый курс уже добавлен в вашу учебную панель! Вы можете войти и приступить к изучению прямо сейчас:</p>
                <div class="credentials-block" style="text-align: center;">
                  <a href="${loginUrl}" class="cta-button">Перейти к обучению в Кабинет</a>
                </div>
              `}
              
              ${isNewUser ? `
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${loginUrl}" class="cta-button">Войти в Личный кабинет</a>
                </div>
              ` : ""}
              
              <p style="margin-top: 30px;">Если у вас возникнут вопросы по процессу обучения или технические трудности, просто ответьте на это письмо.</p>
              <p>Желаем вам продуктивного обучения и глубоких инсайтов!</p>
              <p style="font-weight: 600; color: #6b1d2f; margin-top: 25px;">С уважением,<br>Ольга Хавич и команда онлайн-школы</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ольга Хавич. Все права защищены.</p>
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него напрямую, если у вас нет вопросов.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmailViaRest({
      to: toEmail,
      subject,
      html,
    });
}

interface IOrderEmailItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "BRACELET" | "COURSE" | "CONSULTATION";
}

interface ISendOrderCreatedEmailParams {
  toEmail: string;
  customerName: string;
  orderId: string;
  items: IOrderEmailItem[];
  totalAmount: number;
}

/**
 * Отправка подтверждения о создании заказа клиенту на почту.
 * 
 * @param params Параметры для формирования письма
 */
export async function sendOrderCreatedEmail({
  toEmail,
  customerName,
  orderId,
  items,
  totalAmount,
}: ISendOrderCreatedEmailParams): Promise<boolean> {
  if (!resendApiKey) {
    logger.warn(
      { toEmail, orderId },
      "Resend API Key не настроен. Отправка подтверждения создания заказа пропущена."
    );
    return false;
  }

    const subject = `Ваш заказ №${orderId.substring(0, 8)} на сайте Ольги Хавич оформлен!`;

    // Формируем строки таблицы товаров
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eae0db; font-size: 14px;">
            <strong>${item.name}</strong><br>
            <span style="font-size: 12px; color: #888888;">Категория: ${
              item.category === "COURSE" ? "Онлайн-курс" : item.category === "CONSULTATION" ? "Услуга/Консультация" : "Амулет"
            }</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eae0db; text-align: center; font-size: 14px;">
            ${item.quantity} шт.
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eae0db; text-align: right; font-weight: 600; font-size: 14px;">
            ${(item.price * item.quantity).toLocaleString("de-DE")} €
          </td>
        </tr>
      `
      )
      .join("");

    // Премиальный HTML-шаблон письма в золотисто-бордовой гамме
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #fcf9f6;
              color: #2b2b2b;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #eae0db;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(107, 29, 47, 0.05);
            }
            .header {
              background-color: #6b1d2f; /* Бордовый */
              padding: 40px 20px;
              text-align: center;
              border-bottom: 3px solid #d4af37; /* Золотой */
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .content {
              padding: 40px 30px;
              line-height: 1.6;
            }
            .greeting {
              font-size: 18px;
              font-weight: 700;
              color: #6b1d2f;
              margin-bottom: 20px;
            }
            .order-details {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
            }
            .order-details th {
              background-color: #fbf7f5;
              color: #6b1d2f;
              text-align: left;
              padding: 12px;
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #eae0db;
            }
            .total-row {
              background-color: #fcf9f6;
              font-weight: 700;
              font-size: 16px;
              color: #6b1d2f;
            }
            .info-block {
              background-color: #fbf7f5;
              border-left: 4px solid #d4af37;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
              font-size: 14px;
            }
            .footer {
              background-color: #fbf7f5;
              padding: 25px;
              text-align: center;
              font-size: 12px;
              color: #888888;
              border-top: 1px solid #eae0db;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ОЛЬГА ХАВИЧ</h1>
            </div>
            <div class="content">
              <div class="greeting">Здравствуйте, ${customerName}!</div>
              <p>Благодарим вас за оформление заказа на нашем сайте. Ваш заказ успешно создан и находится в обработке.</p>
              
              <div style="font-size: 15px; margin: 20px 0; padding-bottom: 10px; border-bottom: 1px solid #eae0db;">
                <strong>Номер заказа:</strong> #${orderId.substring(0, 8)}<br>
                <strong>Дата:</strong> ${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </div>

              <table class="order-details">
                <thead>
                  <tr>
                    <th style="width: 60%;">Товар</th>
                    <th style="width: 20%; text-align: center;">Кол-во</th>
                    <th style="width: 20%; text-align: right;">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 15px 12px; text-align: right;">Итого к оплате:</td>
                    <td style="padding: 15px 12px; text-align: right; font-size: 18px;">${totalAmount.toLocaleString("de-DE")} €</td>
                  </tr>
                </tbody>
              </table>

              <div class="info-block">
                <strong>💳 Способы оплаты:</strong><br>
                1. Вы можете оплатить заказ онлайн на сайте через <strong>PayPal</strong> для мгновенной обработки заказа и мгновенного открытия доступов к обучению.<br>
                2. Если вы оплачиваете ручным переводом, администратор проверит платеж и вручную подтвердит его на бэкенде. Ссылка на обучение и личные данные будут отправлены на ваш Email сразу после подтверждения.
              </div>

              <!-- Кнопка перехода к оплате заказа -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://khavich.com"}/shop?payOrder=${orderId}" style="display: inline-block; background: linear-gradient(135deg, #6b1d2f 0%, #4a101d 100%); color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 700; font-size: 15px; border: 1px solid #6b1d2f; box-shadow: 0 4px 8px rgba(107, 29, 47, 0.2);">
                  💳 Перейти к оплате заказа
                </a>
              </div>

              <p>Если у вас возникнут вопросы или потребуется изменить детали заказа, просто ответьте на это письмо.</p>
              <p style="font-weight: 600; color: #6b1d2f; margin-top: 25px;">С уважением,<br>Ольга Хавич и команда онлайн-школы</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ольга Хавич. Все права защищены.</p>
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него напрямую, если у вас нет вопросов.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmailViaRest({
      to: toEmail,
      subject,
      html,
    });
}

interface ISendOrderCancelledEmailParams {
  toEmail: string;
  customerName: string;
  orderId: string;
}

/**
 * Отправка клиенту уведомления об отмене заказа.
 * 
 * @param params Параметры для формирования письма
 */
export async function sendOrderCancelledEmail({
  toEmail,
  customerName,
  orderId,
}: ISendOrderCancelledEmailParams): Promise<boolean> {
  if (!resendApiKey) {
    logger.warn(
      { toEmail, orderId },
      "Resend API Key не настроен. Отправка уведомления об отмене заказа пропущена."
    );
    return false;
  }

  const subject = `Заказ №${orderId.substring(0, 8)} на сайте Ольги Хавич отменен`;

    // Премиальный HTML-шаблон письма в золотисто-бордовой гамме
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #fcf9f6;
              color: #2b2b2b;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #eae0db;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(107, 29, 47, 0.05);
            }
            .header {
              background-color: #6b1d2f; /* Бордовый */
              padding: 40px 20px;
              text-align: center;
              border-bottom: 3px solid #d4af37; /* Золотой */
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .content {
              padding: 40px 30px;
              line-height: 1.6;
            }
            .greeting {
              font-size: 18px;
              font-weight: 700;
              color: #6b1d2f;
              margin-bottom: 20px;
            }
            .info-block {
              background-color: #fff8f8;
              border-left: 4px solid #ef4444;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
              font-size: 14px;
              color: #555555;
            }
            .footer {
              background-color: #fbf7f5;
              padding: 25px;
              text-align: center;
              font-size: 12px;
              color: #888888;
              border-top: 1px solid #eae0db;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ОЛЬГА ХАВИЧ</h1>
            </div>
            <div class="content">
              <div class="greeting">Здравствуйте, ${customerName}!</div>
              <p>Информируем вас о том, что статус вашего заказа был изменен.</p>
              
              <div class="info-block">
                <strong>🚫 Ваш заказ №${orderId.substring(0, 8)} был отменен.</strong><br><br>
                Если вы отменили заказ по ошибке или передумали, вы можете оформить его заново в любое время в нашем интернет-магазине.
              </div>

              <p>Если у вас остались вопросы или вы считаете, что произошла техническая ошибка, пожалуйста, просто ответьте на это письмо.</p>
              <p style="font-weight: 600; color: #6b1d2f; margin-top: 25px;">С уважением,<br>Ольга Хавич и команда онлайн-школы</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ольга Хавич. Все права защищены.</p>
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него напрямую, если у вас нет вопросов.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmailViaRest({
      to: toEmail,
      subject,
      html,
    });
}

interface ISendOrderPaidEmailParams {
  toEmail: string;
  customerName: string;
  orderId: string;
  items: IOrderEmailItem[];
  totalAmount: number;
  temporaryPassword?: string;
  loginUrl: string;
}

/**
 * Универсальная отправка подтверждения оплаты заказа.
 * В зависимости от состава заказа шлет либо приветствие в школу (для курсов),
 * либо информацию о подготовке амулета/проведении консультации.
 */
export async function sendOrderPaidEmail({
  toEmail,
  customerName,
  orderId,
  items,
  totalAmount,
  temporaryPassword,
  loginUrl,
}: ISendOrderPaidEmailParams): Promise<boolean> {
  if (!resendApiKey) {
    logger.warn(
      { toEmail, orderId },
      "Resend API Key не настроен. Отправка подтверждения оплаты заказа пропущена."
    );
    return false;
  }

  const hasCourse = items.some((item) => item.category === "COURSE");

    if (hasCourse) {
      // Если есть хотя бы один курс, используем полноценный шаблон школы с учетными данными
      return await sendWelcomeEmail({
        toEmail,
        customerName,
        temporaryPassword,
        loginUrl,
      });
    }

    // Если в заказе только браслеты и/или консультации (без курсов)
    const subject = `Ваш заказ №${orderId.substring(0, 8)} на сайте Ольги Хавич успешно оплачен!`;

    // Формируем строки таблицы товаров
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eae0db; font-size: 14px;">
            <strong>${item.name}</strong><br>
            <span style="font-size: 12px; color: #888888;">Категория: ${
              item.category === "CONSULTATION" ? "Услуга/Консультация" : "Амулет"
            }</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eae0db; text-align: center; font-size: 14px;">
            ${item.quantity} шт.
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eae0db; text-align: right; font-weight: 600; font-size: 14px;">
            ${(item.price * item.quantity).toLocaleString("de-DE")} €
          </td>
        </tr>
      `
      )
      .join("");

    // Описываем дальнейшие действия на основе категорий товаров
    const hasBracelet = items.some((item) => item.category === "BRACELET");
    const hasConsultation = items.some((item) => item.category === "CONSULTATION");

    let nextStepsHtml = "";
    if (hasBracelet && hasConsultation) {
      nextStepsHtml = `
        <strong>🔮 Что будет дальше:</strong><br>
        1. <strong>Амулетный браслет</strong>: Ольга Хавич приступит к изготовлению вашего персонального амулета и отправит его по вашему адресу в кратчайшие сроки. Трек-номер для отслеживания мы вышлем на ваш Email.<br>
        2. <strong>Консультация</strong>: Ольга свяжется с вами по указанному телефону (WhatsApp) или почте в ближайшее время, чтобы согласовать удобные дату и время вашей встречи.
      `;
    } else if (hasBracelet) {
      nextStepsHtml = `
        <strong>🔮 Что будет дальше:</strong><br>
        Ольга Хавич приступила к изготовлению вашего индивидуального амулетного браслета. После готовности мы надежно упакуем и отправим его по указанному вами адресу. На вашу электронную почту будет отправлено отдельное уведомление с трек-номером для отслеживания посылки.
      `;
    } else if (hasConsultation) {
      nextStepsHtml = `
        <strong>🔮 Что будет дальше:</strong><br>
        Оплата успешно зачислена. Ольга Хавич свяжется с вами по указанному номеру телефона (через WhatsApp) или по электронной почте в ближайшее время, чтобы согласовать удобные дату и время проведения вашей личной консультации.
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #fcf9f6;
              color: #2b2b2b;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #eae0db;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(107, 29, 47, 0.05);
            }
            .header {
              background-color: #6b1d2f; /* Бордовый */
              padding: 40px 20px;
              text-align: center;
              border-bottom: 3px solid #d4af37; /* Золотой */
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .content {
              padding: 40px 30px;
              line-height: 1.6;
            }
            .greeting {
              font-size: 18px;
              font-weight: 700;
              color: #6b1d2f;
              margin-bottom: 20px;
            }
            .order-details {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
            }
            .order-details th {
              background-color: #fbf7f5;
              color: #6b1d2f;
              text-align: left;
              padding: 12px;
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #eae0db;
            }
            .total-row {
              background-color: #fcf9f6;
              font-weight: 700;
              font-size: 16px;
              color: #6b1d2f;
            }
            .info-block {
              background-color: #fdfaf7;
              border-left: 4px solid #d4af37;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
              font-size: 14px;
            }
            .footer {
              background-color: #fbf7f5;
              padding: 25px;
              text-align: center;
              font-size: 12px;
              color: #888888;
              border-top: 1px solid #eae0db;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ОЛЬГА ХАВИЧ</h1>
            </div>
            <div class="content">
              <div class="greeting">Здравствуйте, ${customerName}!</div>
              <p>Мы рады сообщить, что ваш заказ успешно оплачен! Благодарим вас за доверие и выбор наших продуктов силы.</p>
              
              <div style="font-size: 15px; margin: 20px 0; padding-bottom: 10px; border-bottom: 1px solid #eae0db;">
                <strong>Номер заказа:</strong> #${orderId.substring(0, 8)}<br>
                <strong>Статус:</strong> <span style="color: #2e7d32; font-weight: 700;">ОПЛАЧЕН</span><br>
                <strong>Дата оплаты:</strong> ${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </div>

              <table class="order-details">
                <thead>
                  <tr>
                    <th style="width: 60%;">Товар</th>
                    <th style="width: 20%; text-align: center;">Кол-во</th>
                    <th style="width: 20%; text-align: right;">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 15px 12px; text-align: right;">Оплачено:</td>
                    <td style="padding: 15px 12px; text-align: right; font-size: 18px;">${totalAmount.toLocaleString("de-DE")} €</td>
                  </tr>
                </tbody>
              </table>

              <div class="info-block">
                ${nextStepsHtml}
              </div>

              <p style="margin-top: 30px;">Если у вас возникнут какие-либо вопросы или потребуется изменить контактные данные, просто ответьте на это письмо.</p>
              <p style="font-weight: 600; color: #6b1d2f; margin-top: 25px;">С уважением,<br>Ольга Хавич и команда онлайн-школы</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Ольга Хавич. Все права защищены.</p>
              <p>Это автоматическое письмо, пожалуйста, не отвечайте на него напрямую, если у вас нет вопросов.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmailViaRest({
      to: toEmail,
      subject,
      html,
    });
}


