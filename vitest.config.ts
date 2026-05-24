import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node", // Среда тестирования по умолчанию для API и утилит
    globals: true,      // Использование глобальных функций (describe, test, expect) без явного импорта
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,      // Требуемое покрытие кода тестами не менее 80% по правилам проекта
      },
    },
  },
  resolve: {
    alias: {
      "src": path.resolve(__dirname, "./src"),
    },
  },
});
