"use client";

import React from "react";
import { CartProvider } from "src/context/CartContext";
import { LanguageProvider } from "src/context/LanguageContext";

import { Language } from "src/context/LanguageContext";

interface IProvidersProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

/**
 * Глобальный клиентский провайдер контекстов.
 * Используется для интеграции клиентских состояний (корзина, язык, авторизация)
 * в серверную иерархию Next.js App Router без потери SEO метаданных.
 */
export const Providers: React.FC<IProvidersProps> = ({ children, defaultLanguage }) => {
  return (
    <LanguageProvider defaultLanguage={defaultLanguage}>
      <CartProvider>{children}</CartProvider>
    </LanguageProvider>
  );
};

export default Providers;
