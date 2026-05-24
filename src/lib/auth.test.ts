import { describe, test, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getServerSession, IDecodedUser } from "./auth";

// Мокаем зависимости next/headers и logger
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("./logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Функции авторизации и безопасности (Auth & Security)", () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Хеширование паролей (Bcrypt)", () => {
    
    test("Должен корректно хешировать пароль и успешно проверять его", async () => {
      const password = "my-secure-password";
      const saltRounds = 10;
      
      // Хешируем
      const hash = await bcrypt.hash(password, saltRounds);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      
      // Проверяем корректный пароль
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
      
      // Проверяем некорректный пароль
      const isInvalid = await bcrypt.compare("wrong-password", hash);
      expect(isInvalid).toBe(false);
    });

  });

  describe("Проверка сессии пользователя (getServerSession)", () => {
    
    const secret = "local-development-secret-key-change-me-in-production";
    const mockUserData: IDecodedUser = {
      userId: "user-uuid-12345",
      email: "student@example.com",
      role: "USER",
      name: "Алексей Иванов",
    };

    test("Должен возвращать null, если кука с токеном отсутствует", async () => {
      // Настраиваем мок cookies(), чтобы он возвращал пустой get
      const mockGet = vi.fn().mockReturnValue(undefined);
      vi.mocked(cookies).mockResolvedValue({
        get: mockGet,
      } as any);

      const session = await getServerSession();
      
      expect(session).toBeNull();
      expect(mockGet).toHaveBeenCalledWith("khavych_token");
    });

    test("Должен успешно верифицировать и возвращать расшифрованные данные для валидного JWT токена", async () => {
      // Генерируем тестовый валидный токен
      const token = jwt.sign(mockUserData, secret, { expiresIn: "1h" });
      
      // Настраиваем мок cookies(), чтобы он возвращал наш токен
      const mockGet = vi.fn().mockReturnValue({ value: token });
      vi.mocked(cookies).mockResolvedValue({
        get: mockGet,
      } as any);

      const session = await getServerSession();
      
      expect(session).not.toBeNull();
      expect(session?.userId).toBe(mockUserData.userId);
      expect(session?.email).toBe(mockUserData.email);
      expect(session?.name).toBe(mockUserData.name);
      expect(session?.role).toBe(mockUserData.role);
    });

    test("Должен возвращать null при передаче невалидного или просроченного JWT токена", async () => {
      // Испорченный токен
      const invalidToken = "invalid.jwt.token.string";
      
      const mockGet = vi.fn().mockReturnValue({ value: invalidToken });
      vi.mocked(cookies).mockResolvedValue({
        get: mockGet,
      } as any);

      const session = await getServerSession();
      
      expect(session).toBeNull();
    });

  });

});
