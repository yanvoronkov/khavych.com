import React, { Suspense } from "react";
import { Header } from "src/components/Header";
import { db } from "src/lib/db";
import ShopClient from "./ShopClient";
import styles from "./shop.module.css";

// Делаем страницу динамической, так как она зависит от содержимого базы данных
export const dynamic = "force-dynamic";

/**
 * Серверный компонент страницы интернет-магазина Ольги Хавич (/shop).
 * Загружает активные товары из базы данных PostgreSQL на стороне сервера
 * и передает их в клиентский компонент ShopClient для плавной фильтрации.
 * Это обеспечивает великолепную SEO-оптимизацию и мгновенную скорость загрузки.
 */
export default async function ShopPage() {
  // Получаем список только активных товаров из базы данных
  const dbProducts = await db.product.findMany({
    where: {
      isAvailable: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Преобразуем decimal/даты из Prisma в простые типы для безопасной передачи на клиент
  const products = dbProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice,
    imageUrl: product.imageUrl,
    category: product.category,
    subCategory: product.subCategory,
    features: product.features,
    isAvailable: product.isAvailable,
  }));

  return (
    <div className={styles.shopPage}>
      {/* Шапка сайта */}
      <Header />

      {/* Промо-баннер (Hero) в стиле Личного кабинета с золотым градиентным заголовком */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={`${styles.heroTitle} animate-fade-up`}>
            Магазин Ольги Хавич
          </h1>
          <p className={`${styles.heroDesc} animate-fade-in`}>
            Выберите авторский амулетный браслет из натуральных камней, 
            запишитесь на нумерологическую консультацию или начните обучение на профессиональных курсах.
          </p>
        </div>
      </section>

      {/* Основная часть магазина: интерактивный клиентский каталог товаров */}
      <Suspense fallback={
        <div className="container" style={{ textAlign: "center", padding: "80px 0", color: "var(--color-gray)" }}>
          <p>Загрузка предложений каталога...</p>
        </div>
      }>
        <ShopClient products={products} />
      </Suspense>
    </div>
  );
}
