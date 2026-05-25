"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "src/context/CartContext";
import styles from "./Header.module.css";

/**
 * Компонент Header (Шапка сайта).
 * Поддерживает адаптивное меню-гамбургер, автоматическую смену пунктов навигации
 * и кнопок действий в зависимости от того, на какой странице находится пользователь (главная, магазин, ЛК).
 */
export const Header: React.FC = () => {
  const pathname = usePathname();
  const { count, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Флаги определения страниц для условного рендеринга меню
  const isCabinet = pathname?.startsWith("/cabinet") || pathname?.startsWith("/admin");
  const isShop = pathname?.startsWith("/shop");

  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        {/* Кнопка мобильного меню (Гамбургер) слева на мобильных */}
        <button
          className={`${styles.mobileMenuBtn} ${isMenuOpen ? styles.mobileMenuBtnActive : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Открыть меню"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Навигация (меню слева на десктопах, раскрывающийся блок на мобильных) */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navActive : ""}`}>
          {isCabinet ? (
            <>
              <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Главная
              </Link>
              <Link href="/shop" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Магазин
              </Link>
            </>
          ) : isShop ? (
            <>
              <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Главная
              </Link>
            </>
          ) : (
            <>
              <Link href="/#about" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Обо мне
              </Link>
              <Link href="/#services" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Услуги
              </Link>
              <Link href="/shop" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Магазин
              </Link>
              <Link href="/#testimonials" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Отзывы
              </Link>
              <Link href="/#skills" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                Сертификаты
              </Link>
            </>
          )}
        </nav>

        {/* Действия справа (Корзина и Кабинет) */}
        <div className={styles.actions}>
          {/* Кнопка корзины */}
          <button
            className={styles.cartBtn}
            onClick={() => setIsCartOpen(true)}
            aria-label="Открыть корзину"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className={styles.cartBadge}>{count}</span>}
          </button>

          {/* Вход в Личный кабинет - НЕ отображается, если мы уже находимся в ЛК / админке */}
          {!isCabinet && (
            <Link href="/login" className={styles.loginBtn}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Кабинет</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
