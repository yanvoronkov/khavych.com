"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../login/auth.module.css";

/**
 * Компонент страницы регистрации ученика (/register).
 * Позволяет новому пользователю создать учетную запись на сайте.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  /**
   * Обработка отправки формы регистрации.
   * Выполняет проверки на клиенте и отправляет запрос на сервер.
   * 
   * @param e Событие отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // 1. Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setIsSubmitting(false);
      return;
    }

    // 2. Проверка минимальной длины пароля
    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          website,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ошибка при регистрации");
      }

      // Регистрация успешна
      setIsSuccess(true);
      
      // Автоматический переход на страницу входа через 3 секунды
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Произошла непредвиденная ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.authPage}>
        <div className={styles.card} style={{ textAlign: "center" }}>
          <div className={styles.logoArea}>
            <Link href="/" className={styles.logoText}>
              <span className="text-gold">OLGA KHAVYCH</span>
            </Link>
            <h2 className="text-gold" style={{ marginTop: "24px", marginBottom: "12px" }}>
              Регистрация успешна!
            </h2>
            <p className={styles.subtitle}>
              Вы успешно зарегистрировались. Сейчас вы будете перенаправлены на страницу входа...
            </p>
          </div>
          <div style={{ marginTop: "24px" }}>
            <Link href="/login" className="btn btn-primary" style={{ display: "inline-block", width: "100%" }}>
              Перейти к входу вручную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        {/* Логотип и заголовок */}
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logoText}>
            <span className="text-gold">OLGA KHAVYCH</span>
          </Link>
          <p className={styles.subtitle}>Регистрация нового ученика</p>
        </div>

        {/* Сообщение об ошибке */}
        {error && <div className={styles.errorText}>{error}</div>}

        {/* Форма регистрации */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="reg-name">Ваше Имя</label>
            <input
              type="text"
              id="reg-name"
              className={styles.input}
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-email">Ваш Email</label>
            <input
              type="email"
              id="reg-email"
              className={styles.input}
              placeholder="ivan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-phone">Номер телефона</label>
            <input
              type="tel"
              id="reg-phone"
              className={styles.input}
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-password">Пароль</label>
            <input
              type="password"
              id="reg-password"
              className={styles.input}
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="reg-confirm">Подтвердите пароль</label>
            <input
              type="password"
              id="reg-confirm"
              className={styles.input}
              placeholder="••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Поле-приманка для ботов (Honeypot) */}
          <div style={{ display: "none", position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
            <label htmlFor="reg-website">Website</label>
            <input
              type="text"
              id="reg-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "8px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        {/* Ссылка на вход */}
        <p className={styles.switchText}>
          Уже есть аккаунт?{" "}
          <Link href="/login" className={styles.switchLink}>
            Войти в кабинет
          </Link>
        </p>
      </div>
    </div>
  );
}
