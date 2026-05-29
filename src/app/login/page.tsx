import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "src/lib/auth";
import LoginClient from "./LoginClient";

// Принудительно отключаем кэширование страницы, так как она считывает сессионные куки и куки языка
export const dynamic = "force-dynamic";

/**
 * Динамическая генерация метаданных страницы входа в зависимости от выбранного языка.
 * 
 * @returns Объект метаданных страницы (title, description).
 */
export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("khavich_language")?.value === "de" ? "de" : "ru";

  return {
    title: language === "ru" ? "Вход в Личный кабинет | Ольга Хавич" : "Mitgliederbereich Login | Olga Khavich",
    description: language === "ru"
      ? "Авторизация в закрытой образовательной платформе нумеролога и таролога Ольги Хавич. Получите доступ к вашим оплаченным курсам и материалам уроков."
      : "Anmeldung im geschlossenen Mitgliederbereich von Numerologin und Tarot-Expertin Olga Khavich. Erhalten Sie Zugang zu Ihren erworbenen Kursen.",
  };
}

/**
 * Серверный компонент страницы авторизации (/login).
 * Считывает сессию на стороне сервера: если пользователь уже авторизован,
 * мгновенно выполняет редирект (307) в личный кабинет (/cabinet) или админку (/admin),
 * минуя отрисовку формы. В противном случае рендерит клиентскую форму.
 * 
 * @returns JSX элемент страницы авторизации.
 */
export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    // Пользователь уже вошел в систему — перенаправляем на основе роли
    if (session.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/cabinet");
    }
  }

  // Если сессии нет, показываем клиентскую интерактивную форму входа
  return <LoginClient />;
}
