"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "src/components/Header";
import { useCart } from "src/context/CartContext";
import { products, IProduct, ProductCategory, ProductSubCategory } from "src/data/products";
import styles from "./shop.module.css";

// Тип для значения фильтра (включает "ALL" для сброса)
type FilterValue = "ALL" | ProductCategory;

/**
 * Внутренний компонент магазина, работающий с параметрами URL (useSearchParams).
 * Обернут в Suspense в родительском компоненте.
 */
function ShopContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  // Состояние активного основного фильтра
  const [filter, setFilter] = useState<FilterValue>("ALL");
  
  // Состояние активного подфильтра услуг
  const [subFilter, setSubFilter] = useState<ProductSubCategory | "ALL">("ALL");

  // Инициализация фильтров из query-параметров при первой загрузке
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subCategoryParam = searchParams.get("subCategory");

    if (categoryParam === "BRACELET" || categoryParam === "COURSE" || categoryParam === "CONSULTATION") {
      setFilter(categoryParam);
    }
    
    if (subCategoryParam === "NUMEROLOGY" || subCategoryParam === "TAROT" || subCategoryParam === "WAX" || subCategoryParam === "LADING") {
      setSubFilter(subCategoryParam);
    }
  }, [searchParams]);

  // Сбрасываем подфильтр при смене основной категории
  const handleMainFilterChange = (newFilter: FilterValue) => {
    setFilter(newFilter);
    setSubFilter("ALL");
  };

  // Фильтруем продукты
  const filteredProducts = products.filter((product) => {
    // 1. Фильтр по основной категории
    if (filter !== "ALL" && product.category !== filter) {
      return false;
    }
    // 2. Фильтр по подкатегории (только если выбрана категория CONSULTATION)
    if (filter === "CONSULTATION" && subFilter !== "ALL" && product.subCategory !== subFilter) {
      return false;
    }
    return true;
  });

  return (
    <main className="container">
      {/* Кнопки фильтрации основных категорий */}
      <section className={styles.filterSection}>
        <div className={styles.filterRow}>
          <button
            className={`${styles.filterBtn} ${filter === "ALL" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("ALL")}
          >
            Все предложения
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "BRACELET" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("BRACELET")}
          >
            Амулетные браслеты
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "COURSE" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("COURSE")}
          >
            Обучающие курсы
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "CONSULTATION" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("CONSULTATION")}
          >
            Услуги и Консультации
          </button>
        </div>

        {/* Горизонтальный блок подфильтров для консультаций */}
        {filter === "CONSULTATION" && (
          <div className={`${styles.subFilterRow} animate-fade-in`}>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "ALL" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("ALL")}
            >
              Все услуги
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "NUMEROLOGY" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("NUMEROLOGY")}
            >
              Нумерология
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "TAROT" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("TAROT")}
            >
              Карты Таро
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "WAX" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("WAX")}
            >
              Восковые отливки
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "LADING" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("LADING")}
            >
              Ладование
            </button>
          </div>
        )}
      </section>

      {/* Сетка товаров */}
      <section className={styles.grid}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px 0", color: "var(--color-gray)" }}>
            <p>Нет доступных предложений по выбранным фильтрам.</p>
          </div>
        ) : (
          filteredProducts.map((product: IProduct) => {
            // Определяем класс стиля для бейджа и эмодзи на основе категории и подкатегории
            let badgeClass = styles.badgeBracelet;
            let categoryLabel = "Браслет";
            let imageEmoji = "📿";

            if (product.category === "COURSE") {
              badgeClass = styles.badgeCourse;
              categoryLabel = "Курс";
              imageEmoji = "📖";
            } else if (product.category === "CONSULTATION") {
              badgeClass = styles.badgeConsultation;
              
              if (product.subCategory === "NUMEROLOGY") {
                categoryLabel = "Нумерология";
                imageEmoji = "🔢";
              } else if (product.subCategory === "TAROT") {
                categoryLabel = "Таро";
                imageEmoji = "🃏";
              } else if (product.subCategory === "WAX") {
                categoryLabel = "Отливка";
                imageEmoji = "🕯️";
              } else if (product.subCategory === "LADING") {
                categoryLabel = "Ладование";
                imageEmoji = "☀️";
              } else {
                categoryLabel = "Услуга";
                imageEmoji = "🔮";
              }
            }

            return (
              <article key={product.id} className={styles.card}>
                {/* Картинка товара (заглушка с Emoji) */}
                <div className={styles.imageWrapper}>
                  <span>{imageEmoji}</span>
                  <span className={`${styles.badge} ${badgeClass}`}>{categoryLabel}</span>
                </div>

                {/* Содержимое карточки */}
                <div className={styles.cardBody}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDesc}>{product.description}</p>

                  {/* Особенности (Features) с золотыми галочками */}
                  {product.features && product.features.length > 0 && (
                    <ul className={styles.featureList}>
                      {product.features.map((feature, idx) => (
                        <li key={idx} className={styles.featureItem}>
                          <span className={styles.featureIcon}>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Подвал карточки: цена и кнопка покупки */}
                  <div className={styles.cardFooter}>
                    <div className={styles.priceCol}>
                      <span className={styles.priceLabel}>Стоимость</span>
                      <span className={styles.price}>
                        {product.price.toLocaleString("de-DE")} €
                      </span>
                    </div>

                    <button
                      className="btn btn-primary styles.buyBtn"
                      onClick={() => addToCart(product)}
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}

/**
 * Страница интернет-магазина Ольги Хавич (/shop).
 * Предоставляет каталог браслетов, курсов и услуг с возможностью фильтрации,
 * просмотра детальных особенностей продуктов и добавления их в корзину.
 */
export default function ShopPage() {
  return (
    <div className={styles.shopPage}>
      {/* Шапка сайта */}
      <Header />

      {/* Промо-баннер (Hero) */}
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

      {/* Основная часть магазина с Suspense для считывания query-параметров */}
      <Suspense fallback={
        <div className="container" style={{ textAlign: "center", padding: "80px 0", color: "var(--color-gray)" }}>
          <p>Загрузка предложений каталога...</p>
        </div>
      }>
        <ShopContent />
      </Suspense>
    </div>
  );
}
