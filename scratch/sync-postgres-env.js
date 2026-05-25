const fs = require('fs');

const content = fs.readFileSync('.env.production', 'utf8');

// Ищем строчки khavych_DATABASE_URL и khavych_POSTGRES_PRISMA_URL
const dbUrlMatch = content.match(/^khavych_DATABASE_URL="?([^"\n]+)"?/m);
const prismaUrlMatch = content.match(/^khavych_POSTGRES_PRISMA_URL="?([^"\n]+)"?/m);

if (!dbUrlMatch) {
  console.error('❌ Не удалось извлечь khavych_DATABASE_URL из .env.production с помощью RegExp!');
  process.exit(1);
}

const dbUrl = dbUrlMatch[1];
const prismaUrl = prismaUrlMatch ? prismaUrlMatch[1] : dbUrl;

console.log('✅ Успешно извлечены адреса БД!');

let localEnvContent = fs.readFileSync('.env', 'utf8');

// Удаляем старые переменные
localEnvContent = localEnvContent.replace(/^DATABASE_URL=.*$/gm, '');
localEnvContent = localEnvContent.replace(/^khavych_POSTGRES_PRISMA_URL=.*$/gm, '');
localEnvContent = localEnvContent.replace(/^khavych_DATABASE_URL=.*$/gm, '');

// Записываем новые переменные
localEnvContent += `\nDATABASE_URL="${dbUrl}"`;
localEnvContent += `\nkhavych_DATABASE_URL="${dbUrl}"`;
localEnvContent += `\nkhavych_POSTGRES_PRISMA_URL="${prismaUrl}"`;

fs.writeFileSync('.env', localEnvContent);
console.log('✅ Файл .env успешно обновлен данными новой базы Vercel Postgres!');
