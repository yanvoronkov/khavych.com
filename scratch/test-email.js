const { Resend } = require("resend");
const dotenv = require("dotenv");
const path = require("path");

// Загружаем переменные из .env.production.local
const result = dotenv.config({ path: path.join(__dirname, "../.env.production.local") });

if (result.error) {
  console.error("Не удалось загрузить .env.production.local:", result.error);
}

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM;

console.log("Размер API ключа:", apiKey ? apiKey.length : 0);
console.log("Адрес отправителя (EMAIL_FROM):", fromEmail);

if (!apiKey) {
  console.error("Ошибка: RESEND_API_KEY не задан!");
  process.exit(1);
}

const resend = new Resend(apiKey);

async function test() {
  try {
    console.log("Попытка отправить тестовое письмо...");
    const response = await resend.emails.send({
      from: fromEmail || "onboarding@resend.dev",
      to: "yan.voronkov@gmail.com", // тестовый получатель
      subject: "Тестовое письмо с khavych.com",
      html: "<h1>Привет!</h1><p>Это тестовое письмо для проверки работы Resend.</p>",
    });

    console.log("Ответ от Resend API:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Критическое исключение при отправке:", error);
  }
}

test();
