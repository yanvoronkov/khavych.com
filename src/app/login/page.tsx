import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "src/lib/auth";
import LoginClient from "./LoginClient";

// Принудительно отключаем кэширование страницы, так как она считывает сессионные куки
export const dynamic = "force-dynamic";

/**
 * Серверный компонент страницы авторизации (/login).
 * Считывает сессию на стороне сервера: если пользователь уже авторизован,
 * мгновенно выполняет редирект (307) в личный кабинет (/cabinet) или админку (/admin),
 * минуя отрисовку формы. В противном случае рендерит клиентскую форму.
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
