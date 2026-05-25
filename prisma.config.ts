import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Конфигурация Prisma 7.
 * Выносит настройки подключения к БД и расположение схемы из schema.prisma.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("khavych_POSTGRES_PRISMA_URL") || env("khavych_DATABASE_URL") || env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
