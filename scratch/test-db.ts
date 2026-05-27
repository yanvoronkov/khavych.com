import "dotenv/config";
import { db as prisma } from "../src/lib/db";
import bcrypt from "bcrypt";

async function main() {
  console.log("=== ПРОВЕРКА ДЕФОЛТНОГО ПАРОЛЯ ОЛЬГИ ===");
  try {
    const user = await prisma.user.findUnique({
      where: { email: "olga.k77@gmx.de" },
    });

    if (!user) {
      console.log("Пользователь olga.k77@gmx.de не найден!");
      return;
    }

    console.log("Пользователь найден. Хэш пароля:", user.passwordHash);

    // Список паролей для проверки
    const passwordsToTest = ["khavich2026", "khavich2025", "123456", "admin", "password"];
    
    for (const pwd of passwordsToTest) {
      const isValid = await bcrypt.compare(pwd, user.passwordHash);
      console.log(`Пароль "${pwd}": ${isValid ? "✓ ВЕРНЫЙ" : "✗ НЕВЕРНЫЙ"}`);
    }

  } catch (error) {
    console.error("Ошибка:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
