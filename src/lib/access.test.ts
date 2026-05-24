import { describe, test, expect } from "vitest";
import { isAccessActive } from "./access";

describe("Проверка активности временного доступа (Access Expiration Utility)", () => {
  
  test("Должен возвращать true, если срок действия доступа равен null (бессрочно)", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    
    expect(isAccessActive(null, now)).toBe(true);
  });

  test("Должен возвращать true, если срок действия доступа равен undefined (бессрочно)", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    
    expect(isAccessActive(null, now)).toBe(true);
  });

  test("Должен возвращать true, если дата окончания доступа находится в будущем (Date объект)", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    const expiresAt = new Date("2026-05-20T13:00:00.000Z"); // +1 час
    
    expect(isAccessActive(expiresAt, now)).toBe(true);
  });

  test("Должен возвращать true, если дата окончания доступа находится в будущем (ISO-строка)", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    const expiresAt = "2026-06-20T12:00:00.000Z"; // +1 месяц
    
    expect(isAccessActive(expiresAt, now)).toBe(true);
  });

  test("Должен возвращать false, если дата окончания доступа находится в прошлом (Date объект)", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    const expiresAt = new Date("2026-05-20T11:00:00.000Z"); // -1 час
    
    expect(isAccessActive(expiresAt, now)).toBe(false);
  });

  test("Должен возвращать false, если дата окончания доступа находится в прошлом (ISO-строка)", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    const expiresAt = "2026-04-20T12:00:00.000Z"; // -1 месяц
    
    expect(isAccessActive(expiresAt, now)).toBe(false);
  });

  test("Должен возвращать false, если дата окончания совпадает с текущим моментом", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    const expiresAt = new Date("2026-05-20T12:00:00.000Z");
    
    expect(isAccessActive(expiresAt, now)).toBe(false);
  });

});
