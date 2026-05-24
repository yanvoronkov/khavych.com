import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { logger } from "./logger";

/**
 * Интерфейс, описывающий данные пользователя, закодированные в JWT токене.
 */
export interface IDecodedUser {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  name: string;
}

/**
 * Проверяет сессию пользователя на стороне сервера.
 * Считывает безопасную HttpOnly куку `khavych_token`, расшифровывает её
 * и возвращает данные пользователя в случае успеха, либо null.
 * 
 * @returns Данные пользователя из JWT токена или null, если токен невалиден или отсутствует
 */
export async function getServerSession(): Promise<IDecodedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("khavych_token")?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET || "local-development-secret-key-change-me-in-production";
    
    // Верификация и расшифровка токена
    const decoded = jwt.verify(token, secret) as IDecodedUser;
    return decoded;
  } catch (error) {
    logger.warn({ error }, "Ошибка верификации сессии на сервере");
    return null;
  }
}
