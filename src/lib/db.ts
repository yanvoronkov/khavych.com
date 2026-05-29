import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Объявляем глобальную переменную для предотвращения множественных экземпляров клиента и пула в режиме горячей перезагрузки (HMR) в Next.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.khavych_POSTGRES_PRISMA_URL || process.env.khavych_DATABASE_URL || process.env.DATABASE_URL;

if (connectionString) {
  const maskedString = connectionString.replace(/:[^:@]+@/, ":****@");
  console.log(`[Database Init] Инициализация Prisma Client со строкой подключения: ${maskedString}`);
} else {
  console.warn("[Database Init] ВНИМАНИЕ: Строка подключения к БД пуста!");
}

const pool = globalForPrisma.pool ?? new Pool({ connectionString });
const adapter = new PrismaPg(pool);

/**
 * Экземпляр PrismaClient, используемый для всех запросов к базе данных.
 * Использует драйвер-адаптер pg для прямой работы с PostgreSQL (требование Prisma 7).
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.pool = pool;
}
export default db;
