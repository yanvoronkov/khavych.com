"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "src/context/CartContext";
import { useLanguage } from "src/context/LanguageContext";
import styles from "./shop.module.css";

// Тип для значения фильтра (включает "ALL" для сброса)
type FilterValue = "ALL" | "BRACELET" | "COURSE" | "CONSULTATION";

interface ShopClientProps {
  products: any[];
}

/**
 * Клиентский компонент магазина товаров и услуг.
 * Предоставляет интерфейс фильтрации продуктов по категориям и добавления их в корзину.
 * 
 * @param props Свойства компонента, содержащие список продуктов products.
 * @returns JSX элемент каталога магазина.
 */
export default function ShopClient({ products }: ShopClientProps) {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();

  // Локаль пользователя из мультиязычного контекста
  const locale = language;

  // Состояние активного основного фильтра
  const [filter, setFilter] = useState<FilterValue>("ALL");
  
  // Состояние активного подфильтра услуг
  const [subFilter, setSubFilter] = useState<string | "ALL">("ALL");

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

  // Безопасный парсинг переведенных полей на основе JSON структуры
  const getTranslation = (fieldObj: any, lang: string = "ru") => {
    if (!fieldObj) return "";
    const parsed = typeof fieldObj === "string" ? JSON.parse(fieldObj) : fieldObj;
    return parsed[lang] || parsed["ru"] || "";
  };

  // Получение переведенного массива фич
  const getFeatures = (featuresObj: any, lang: string = "ru") => {
    if (!featuresObj) return [];
    const parsed = typeof featuresObj === "string" ? JSON.parse(featuresObj) : featuresObj;
    return parsed[lang] || parsed["ru"] || [];
  };

  return (
    <main className="container">
      {/* Кнопки фильтрации основных категорий */}
      <section className={styles.filterSection}>
        <div className={styles.filterRow}>
          <button
            className={`${styles.filterBtn} ${filter === "ALL" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("ALL")}
          >
            {t("shop", "all")}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "BRACELET" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("BRACELET")}
          >
            {t("shop", "bracelets")}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "COURSE" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("COURSE")}
          >
            {t("shop", "courses")}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === "CONSULTATION" ? styles.filterBtnActive : ""}`}
            onClick={() => handleMainFilterChange("CONSULTATION")}
          >
            {t("shop", "consultations")}
          </button>
        </div>

        {/* Горизонтальный блок подфильтров для консультаций */}
        {filter === "CONSULTATION" && (
          <div className={`${styles.subFilterRow} animate-fade-in`}>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "ALL" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("ALL")}
            >
              {language === "ru" ? "Все услуги" : "Alle Dienstleistungen"}
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "NUMEROLOGY" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("NUMEROLOGY")}
            >
              {language === "ru" ? "Нумерология" : "Numerologie"}
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "TAROT" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("TAROT")}
            >
              {language === "ru" ? "Карты Таро" : "Tarot-Karten"}
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "WAX" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("WAX")}
            >
              {language === "ru" ? "Восковые отливки" : "Wachsguss"}
            </button>
            <button
              className={`${styles.subFilterBtn} ${subFilter === "LADING" ? styles.subFilterBtnActive : ""}`}
              onClick={() => setSubFilter("LADING")}
            >
              {language === "ru" ? "Ладование" : "Ladowanie"}
            </button>
          </div>
        )}
      </section>

      {/* Сетка товаров */}
      <section className={styles.grid}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px 0", color: "var(--color-gray)" }}>
            <p>{language === "ru" ? "Нет доступных предложений по выбранным фильтрам." : "Keine Angebote für die ausgewählten Filter verfügbar."}</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            // Определение локализованных данных
            const name = getTranslation(product.name, locale);
            const description = getTranslation(product.description, locale);
            const features = getFeatures(product.features, locale);

            // Определяем класс стиля для бейджа и эмодзи на основе категории
            let badgeClass = styles.badgeBracelet;
            let categoryLabel = language === "ru" ? "Браслет" : "Kraftarmband";
            let imageEmoji = "📿";

            if (product.category === "COURSE") {
              badgeClass = styles.badgeCourse;
              categoryLabel = language === "ru" ? "Курс" : "Kurs";
              imageEmoji = "📖";
            } else if (product.category === "CONSULTATION") {
              badgeClass = styles.badgeConsultation;
              
              if (product.subCategory === "NUMEROLOGY") {
                categoryLabel = language === "ru" ? "Нумерология" : "Numerologie";
                imageEmoji = "🔢";
              } else if (product.subCategory === "TAROT") {
                categoryLabel = language === "ru" ? "Таро" : "Tarot";
                imageEmoji = "🃏";
              } else if (product.subCategory === "WAX") {
                categoryLabel = language === "ru" ? "Отливка" : "Wachsguss";
                imageEmoji = "🕯️";
              } else if (product.subCategory === "LADING") {
                categoryLabel = language === "ru" ? "Ладование" : "Ladowanie";
                imageEmoji = "☀️";
              } else {
                categoryLabel = language === "ru" ? "Услуга" : "Dienstleistung";
                imageEmoji = "🔮";
              }
            }

            // Расчет скидки в процентах для бейджа
            const discountPercent = product.oldPrice 
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : 0;

            return (
              <article key={product.id} className={styles.card}>
                {/* Картинка товара с поддержкой реальных фото или заглушки */}
                <div className={styles.imageWrapper}>
                  <img 
                    src={product.imageUrl || "/images/placeholder.webp"} 
                    alt={name} 
                    className={styles.productImage} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={`${styles.badge} ${badgeClass}`}>{categoryLabel}</span>
                  
                  {/* Бейдж скидки на картинке */}
                  {discountPercent > 0 && (
                    <span 
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        backgroundColor: "var(--color-primary)",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(197, 23, 34, 0.2)"
                      }}
                    >
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Содержимое карточки */}
                <div className={styles.cardBody}>
                  <h3 className={styles.productName}>{name}</h3>
                  <p className={styles.productDesc}>{description}</p>

                  {/* Особенности (Features) с золотыми галочками */}
                  {features && features.length > 0 && (
                    <ul className={styles.featureList}>
                      {features.map((feature: string, idx: number) => (
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
                      <span className={styles.priceLabel}>{language === "ru" ? "Стоимость" : "Preis"}</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span className={styles.price}>
                          {product.price.toLocaleString("de-DE")} €
                        </span>
                        {product.oldPrice && (
                          <span style={{ textDecoration: "line-through", color: "var(--color-gray)", fontSize: "14px" }}>
                            {product.oldPrice.toLocaleString("de-DE")} €
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ padding: "10px 18px", fontSize: "13px", borderRadius: "var(--radius-md)" }}
                      onClick={() => addToCart({
                        id: product.id,
                        name: name, // Передаем плоское имя для корзины
                        price: product.price,
                        category: product.category,
                        imageUrl: product.imageUrl || ""
                      } as any)}
                    >
                      {t("shop", "addToCart")}
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
