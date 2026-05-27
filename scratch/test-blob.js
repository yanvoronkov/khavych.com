const { put } = require("@vercel/blob");
const dotenv = require("dotenv");
const path = require("path");

// Загружаем переменные из .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function test() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  console.log("Токен найден:", token ? `${token.substring(0, 15)}...` : "НЕТ");

  if (!token) {
    console.error("Ошибка: Токен BLOB_READ_WRITE_TOKEN не обнаружен в .env.local!");
    return;
  }

  try {
    console.log("Пробуем загрузить тестовый файл в Vercel Blob...");
    const blob = await put("test/hello.txt", "Hello World from local test script!", {
      access: "public",
      token: token
    });
    console.log("УСПЕХ! Ссылка на файл:", blob.url);
  } catch (error) {
    console.error("ОШИБКА загрузки в Vercel Blob:");
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

test();
