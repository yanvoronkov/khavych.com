import pino from "pino";

// Настройка форматирования логов для удобного чтения в процессе разработки
const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Экземпляр логгера pino для всего приложения.
 * Логирует структурированную информацию в консоль.
 * В режиме разработки используется красивое форматирование pino-pretty.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
