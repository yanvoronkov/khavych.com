import { logger } from "./logger";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox"; // sandbox | live

const PAYPAL_API_URL =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Получение токена авторизации OAuth2 от PayPal
 */
async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error(
      "Переменные окружения PAYPAL_CLIENT_ID или PAYPAL_SECRET не настроены."
    );
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error_description || "Ошибка получения токена PayPal");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    logger.error({ error }, "Ошибка при запросе access_token у PayPal");
    throw error;
  }
}

/**
 * Создание заказа на стороне PayPal
 * 
 * @param amount Сумма заказа (например, 150.00)
 * @param currency Валюта платежа (по умолчанию EUR)
 * @returns ID заказа в платежной системе PayPal
 */
export async function createPaypalOrder(amount: number, currency = "EUR"): Promise<string> {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Ошибка PayPal при создании транзакции");
    }

    const data = await response.json();
    return data.id; // orderID для фронтенда
  } catch (error) {
    logger.error({ error, amount }, "Ошибка в утилите createPaypalOrder");
    throw error;
  }
}

/**
 * Финализация (захват) платежа по заказу на стороне PayPal
 * 
 * @param paypalOrderId ID заказа в PayPal
 * @returns Результат захвата средств
 */
export async function capturePaypalOrder(paypalOrderId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Ошибка PayPal при завершении транзакции");
    }

    return await response.json();
  } catch (error) {
    logger.error({ error, paypalOrderId }, "Ошибка в утилите capturePaypalOrder");
    throw error;
  }
}
