/**
 * Вспомогательные функции для работы с правами доступа пользователей к курсам.
 */

/**
 * Проверяет, активен ли доступ к курсу на основе даты его окончания.
 * 
 * @param expiresAt Дата окончания доступа (null - бессрочно)
 * @param now Текущая дата (используется для мока времени при тестировании)
 * @returns boolean true, если доступ активен (бессрочно или срок действия еще не истек)
 */
export function isAccessActive(expiresAt: Date | string | null, now: Date = new Date()): boolean {
  if (expiresAt === null || expiresAt === undefined) {
    return true;
  }
  
  const expDate = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  
  // Доступ активен, если дата окончания строго больше текущего времени
  return expDate.getTime() > now.getTime();
}
