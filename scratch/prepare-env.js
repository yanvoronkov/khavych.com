const fs = require('fs');
const dotenv = require('dotenv');

// Считываем текущий .env
const envConfig = dotenv.parse(fs.readFileSync('.env'));

const dbUrl = envConfig.khavych_DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Переменная khavych_DATABASE_URL не найдена в .env!');
  process.exit(1);
}

// Записываем нужные для Prisma переменные в явном виде в конец файла
let envContent = fs.readFileSync('.env', 'utf8');
envContent += `\nDATABASE_URL="${dbUrl}"`;
envContent += `\nkhavych_POSTGRES_PRISMA_URL="${dbUrl}"`;

fs.writeFileSync('.env', envContent);
console.log('✅ Файл .env успешно подготовлен для Prisma!');
