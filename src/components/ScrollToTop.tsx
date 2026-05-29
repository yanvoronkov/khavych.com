"use client";

import React, { useState, useEffect } from "react";
import styles from "./ScrollToTop.module.css";

/**
 * Стильная и аккуратная кнопка скролла вверх (Scroll To Top).
 * Появляется при прокрутке страницы вниз более чем на 300px.
 * При клике плавно скроллит страницу к самому верху.
 */
export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    
    // Сразу проверяем текущий скролл при монтировании
    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className={`${styles.scrollButton} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label="Наверх"
      title="Наверх"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className={styles.icon}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 15.75l7.5-7.5 7.5 7.5"
        />
      </svg>
    </button>
  );
};
