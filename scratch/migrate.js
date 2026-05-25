require('dotenv').config();
const { execSync } = require('child_process');

// Перекладываем Vercel-переменные в стандартные для Prisma
process.env.DATABASE_URL = process.env.khavych_DATABASE_URL;
process.env.khavych_POSTGRES_PRISMA_URL = process.env.khavych_DATABASE_URL; // для db push используем прямую ссылку без пулера

console.log('🔄 Запуск npx prisma db push на базу Vercel Postgres...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Структура базы данных успешно создана!');
  
  console.log('🌱 Запуск сидирования базы данных (заполнение товарами)...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  console.log('🎉 Сидирование успешно завершено!');
} catch (error) {
  console.error('❌ Ошибка выполнения:', error.message);
  process.exit(1);
}
