"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";

/**
 * Клиентский интерактивный компонент формы входа в личный кабинет.
 * Обеспечивает ввод данных, отправку POST запроса авторизации
 * и перенаправление пользователя на основе его роли.
 */
export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Обработка отправки формы входа
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Неверный Email или пароль");
      }

      // Успешный вход: перенаправляем на основе роли пользователя
      if (result.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/cabinet");
      }
      
      // Принудительно обновляем роутер для обновления состояния кук
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Произошла непредвиденная ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        {/* Логотип и заголовок */}
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logoText}>
            <span className="text-gold">OLGA KHAVYCH</span>
          </Link>
          <p className={styles.subtitle}>Вход в личный кабинет ученика</p>
        </div>

        {/* Сообщение об ошибке */}
        {error && <div className={styles.errorText}>{error}</div>}

        {/* Форма входа */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="login-email">Ваш Email</label>
            <input
              type="email"
              id="login-email"
              className={styles.input}
              placeholder="ivan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="login-password">Пароль</label>
            <input
              type="password"
              id="login-password"
              className={styles.input}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Вход..." : "Войти в кабинет"}
          </button>
        </form>

        {/* Ссылка на регистрацию */}
        <p className={styles.switchText}>
          Еще нет кабинета?{" "}
          <Link href="/register" className={styles.switchLink}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
