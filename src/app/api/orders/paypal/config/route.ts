import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Получение публичного PayPal Client ID для фронтенд-скрипта.
 * Путь: /api/orders/paypal/config
 */
export async function GET() {
  return NextResponse.json({
    paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
  });
}
