"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "src/context/CartContext";
import { z } from "zod";
import styles from "./CartDrawer.module.css";

declare global {
  interface Window {
    paypal?: any;
  }
}

// Схема валидации заказа с помощью Zod
const checkoutSchema = z.object({
  name: z.string().min(2, "Имя должно содержать не менее 2 символов"),
  email: z.string().email("Введите корректный адрес электронной почты"),
  phone: z.string().min(8, "Телефон должен быть не менее 8 цифр"),
  address: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

/**
 * Выдвижная боковая панель корзины (CartDrawer).
 * Позволяет просматривать корзину, менять количество браслетов,
 * удалять товары и мгновенно оформлять заказ с отправкой Ольге в Telegram.
 */
export const CartDrawer: React.FC = () => {
  const {
    items,
    total,
    count,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToCart,
  } = useCart();

  // Режимы работы: "CART" (список товаров), "CHECKOUT" (ввод данных), "PAYMENT" (выбор оплаты), "SUCCESS" (успешный заказ)
  const [mode, setMode] = useState<"CART" | "CHECKOUT" | "PAYMENT" | "SUCCESS">("CART");
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [paypalLoaded, setPaypalLoaded] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"PAYPAL" | "MANUAL" | null>(null);

  // Восстановление неоплаченного заказа при переходе по ссылке
  const restoreOrderSession = async (orderId: string) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Не удалось загрузить данные заказа");
      }

      const order = data.order;
      
      if (order.status !== "PENDING") {
        const statusText = order.status === "PAID" ? "ОПЛАЧЕН" : "ОТМЕНЕН";
        alert(`Этот заказ уже имеет статус: ${statusText}. Восстановление оплаты невозможно.`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Восстанавливаем данные покупателя
      setFormData({
        name: order.customerName,
        email: order.customerEmail,
        phone: "",
        address: "",
      });

      // Парсим товары заказа
      let orderItems: any[] = [];
      if (typeof order.items === "string") {
        orderItems = JSON.parse(order.items);
      } else if (Array.isArray(order.items)) {
        orderItems = order.items;
      }

      // Очищаем корзину и добавляем товары из заказа
      clearCart();
      
      orderItems.forEach((item) => {
        addToCart({
          id: item.id,
          name: item.name,
          description: "",
          price: item.price,
          imageUrl: null,
          category: item.category,
          isAvailable: true,
        });
      });

      setCreatedOrderId(order.id);
      loadPaypalSdk();
      setMode("PAYMENT");
      setPaymentMethod("PAYPAL");
      setIsCartOpen(true);

      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Ошибка при восстановлении сессии оплаты");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Прослушиваем query-параметр payOrder для восстановления сессии оплаты
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const payOrderId = params.get("payOrder");
      if (payOrderId) {
        restoreOrderSession(payOrderId);
      }
    }
  }, []);

  // Функция для динамической загрузки скрипта PayPal
  const loadPaypalSdk = async () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    try {
      const res = await fetch("/api/orders/paypal/config");
      const data = await res.json();
      const clientId = data.paypalClientId;

      if (!clientId) {
        console.error("PayPal Client ID не настроен на сервере");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error("Ошибка загрузки PayPal SDK:", err);
    }
  };

  // Эффект отрисовки кнопок PayPal
  useEffect(() => {
    if (mode === "PAYMENT" && paymentMethod === "PAYPAL" && paypalLoaded && createdOrderId) {
      const container = document.getElementById("paypal-button-container");
      if (container) {
        container.innerHTML = ""; // Очищаем контейнер от старых кнопок
      }

      if (window.paypal) {
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color:  'gold',
            shape:  'rect',
            label:  'paypal'
          },
          createOrder: async () => {
            try {
              const res = await fetch("/api/orders/paypal/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: createdOrderId }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Ошибка инициализации PayPal");
              return data.paypalOrderId;
            } catch (err: any) {
              alert(err.message || "Не удалось инициализировать оплату PayPal");
              throw err;
            }
          },
          onApprove: async (data: any) => {
            setIsSubmitting(true);
            try {
              const res = await fetch("/api/orders/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: createdOrderId,
                  paypalOrderId: data.orderID,
                }),
              });
              const result = await res.json();
              if (!res.ok) throw new Error(result.message || "Ошибка подтверждения оплаты");
              
              // Успех! Очищаем корзину и показываем экран успеха
              clearCart();
              setMode("SUCCESS");
              setFormData({ name: "", email: "", phone: "", address: "" });
              setPaymentMethod(null);
            } catch (err: any) {
              alert(err.message || "Ошибка при списании средств через PayPal. Свяжитесь с поддержкой.");
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: (err: any) => {
            console.error("PayPal Error:", err);
            alert("Произошла ошибка при проведении транзакции PayPal. Пожалуйста, попробуйте еще раз.");
          }
        }).render("#paypal-button-container");
      }
    }
  }, [mode, paymentMethod, paypalLoaded, createdOrderId]);

  // Проверяем, есть ли в корзине физические товары (браслеты), требующие доставки
  const hasBracelets = items.some((item) => item.product.category === "BRACELET");

  /**
   * Переключение на режим оформления заказа.
   * Очищает старые ошибки.
   */
  const handleGoToCheckout = () => {
    setErrors({});
    setMode("CHECKOUT");
  };

  /**
   * Возврат к списку товаров корзины
   */
  const handleBackToCart = () => {
    setMode("CART");
  };

  /**
   * Обработка изменения полей ввода в форме
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Сбрасываем ошибку для редактируемого поля
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Отправка заказа в базу данных и Telegram
   */
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // 1. Валидация формы через Zod
      const validationData: CheckoutFormData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      // Если в корзине есть браслеты, адрес становится обязательным
      if (hasBracelets && (!formData.address || formData.address.trim().length < 10)) {
        setErrors((prev) => ({
          ...prev,
          address: "Для доставки браслета укажите полный адрес (город, улица, дом, индекс)",
        }));
        setIsSubmitting(false);
        return;
      }

      checkoutSchema.parse(validationData);

      // 2. Отправка заказа на API роут Next.js
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: hasBracelets ? formData.address : undefined,
          items: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            category: item.product.category,
          })),
          totalAmount: total,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ошибка при создании заказа");
      }

      // Сохраняем ID созданного заказа и открываем платежную зону
      setCreatedOrderId(result.orderId);
      loadPaypalSdk();
      setMode("PAYMENT");
      setPaymentMethod("PAYPAL");
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        // Записываем ошибки валидации Zod
        const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
        err.issues.forEach((validationError) => {
          const path = validationError.path[0] as keyof CheckoutFormData;
          fieldErrors[path] = validationError.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error("Ошибка при оформлении заказа:", err);
        alert(err instanceof Error ? err.message : "Произошла непредвиденная ошибка");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Закрытие панели корзины с возвратом в режим корзины
   */
  const handleCloseDrawer = () => {
    setIsCartOpen(false);
    // Сбрасываем режим на CART после закрытия панели с задержкой (после окончания анимации)
    setTimeout(() => {
      setMode("CART");
    }, 300);
  };

  return (
    <>
      {/* Затемняющий задний фон (Overlay) */}
      <div
        className={`${styles.overlay} ${isCartOpen ? styles.overlayOpen : ""}`}
        onClick={handleCloseDrawer}
      />

      {/* Панель корзины (Drawer) */}
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ""}`}>
        {/* Хедер панели */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === "CART" && "Ваша корзина"}
            {mode === "CHECKOUT" && "Оформление заказа"}
            {mode === "PAYMENT" && "Оплата заказа"}
            {mode === "SUCCESS" && "Заказ принят!"}
          </h2>
          <button className={styles.closeBtn} onClick={handleCloseDrawer} aria-label="Закрыть">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Тело панели (Content) */}
        <div className={styles.content}>
          {mode === "SUCCESS" ? (
            /* Экран успешного оформления */
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className={styles.successTitle}>Успешно оформлено!</h3>
              <p className={styles.successDesc}>
                Благодарим за заказ! Если вы оплатили онлайн через PayPal, доступ к обучению уже выслан вам на Email. Если вы выбрали ручной перевод, Ольга свяжется с вами для подтверждения!
              </p>
              <button className="btn btn-primary" onClick={handleCloseDrawer}>
                Отлично
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Корзина пуста */
            <div className={styles.emptyState}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className={styles.emptyText}>В вашей корзине пока пусто</p>
              <button className="btn btn-secondary" onClick={handleCloseDrawer}>
                Вернуться к покупкам
              </button>
            </div>
          ) : mode === "CART" ? (
            /* Режим списка товаров в корзине */
            <div className={styles.itemList}>
              {items.map((item) => (
                <div key={item.product.id} className={styles.item}>
                  {/* Заглушка изображения товара */}
                  <div className={styles.itemImagePlaceholder}>
                    {item.product.category === "BRACELET" && "📿"}
                    {item.product.category === "COURSE" && "📖"}
                    {item.product.category === "CONSULTATION" && "🔮"}
                  </div>

                  {/* Детали товара */}
                  <div className={styles.itemDetails}>
                    <div>
                      <h4 className={styles.itemName}>{item.product.name}</h4>
                      <span className={styles.itemMeta}>
                        {item.product.category === "BRACELET" && "Браслет"}
                        {item.product.category === "COURSE" && "Курс"}
                        {item.product.category === "CONSULTATION" && "Консультация"}
                      </span>
                    </div>

                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>
                        {(item.product.price * item.quantity).toLocaleString("de-DE")} €
                      </span>

                      {/* Счетчик количества (только для браслетов) */}
                      {item.product.category === "BRACELET" ? (
                        <div className={styles.quantityControls}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Уменьшить"
                          >
                            -
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Увеличить"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className={styles.itemMeta}>1 шт.</span>
                      )}

                      {/* Кнопка удаления */}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => removeFromCart(item.product.id)}
                        aria-label="Удалить"
                      >
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
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : mode === "PAYMENT" ? (
            /* Экран выбора и совершения оплаты */
            <div className={styles.paymentContainer}>
              <div className={styles.paymentHeader}>
                <h4 style={{ fontWeight: 700, fontSize: "14px", color: "#6b1d2f", margin: 0 }}>Заказ успешно создан!</h4>
                <p style={{ fontSize: "13px", color: "var(--color-gray)", marginTop: "4px", margin: "4px 0 0 0" }}>
                  Сумма к оплате: <strong>{total.toLocaleString("de-DE")} €</strong>
                </p>
              </div>

              <div className={styles.paymentMethods}>
                <div 
                  className={`${styles.paymentMethodCard} ${paymentMethod === "PAYPAL" ? styles.paymentMethodCardActive : ""}`}
                  onClick={() => {
                    setPaymentMethod("PAYPAL");
                    loadPaypalSdk();
                  }}
                >
                  <div className={styles.paymentMethodRadio}>
                    <input type="radio" checked={paymentMethod === "PAYPAL"} readOnly />
                    <strong>Онлайн-оплата PayPal</strong>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--color-gray)", marginTop: "6px", margin: "6px 0 0 0" }}>
                    Мгновенный безопасный платеж. Доступ к онлайн-курсам открывается автоматически сразу после завершения оплаты!
                  </p>
                </div>

                <div 
                  className={`${styles.paymentMethodCard} ${paymentMethod === "MANUAL" ? styles.paymentMethodCardActive : ""}`}
                  onClick={() => setPaymentMethod("MANUAL")}
                >
                  <div className={styles.paymentMethodRadio}>
                    <input type="radio" checked={paymentMethod === "MANUAL"} readOnly />
                    <strong>Ручной перевод на карту</strong>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--color-gray)", marginTop: "6px", margin: "6px 0 0 0" }}>
                    Оплата прямым переводом. Ольга Хавич свяжется с вами по WhatsApp или почте и предоставит реквизиты перевода.
                  </p>
                </div>
              </div>

              {/* Отображение зоны оплаты в зависимости от выбранного метода */}
              {paymentMethod === "PAYPAL" && (
                <div style={{ marginTop: "20px", minHeight: "100px" }}>
                  {!paypalLoaded ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--color-primary)", fontWeight: 600 }}>
                      Загрузка кнопок PayPal...
                    </div>
                  ) : (
                    <div id="paypal-button-container" style={{ width: "100%" }}></div>
                  )}
                </div>
              )}

              {paymentMethod === "MANUAL" && (
                <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#fffcfc", border: "1px solid #f2e2e4", borderRadius: "10px" }}>
                  <p style={{ fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
                    Вы выбрали ручной перевод на карту. Ольга Хавич отправит вам реквизиты перевода в течение короткого времени. После оплаты она вручную подтвердит платеж, и вам откроется доступ к обучению!
                  </p>
                  <button 
                    type="button"
                    className="btn btn-primary" 
                    style={{ width: "100%", marginTop: "16px", background: "linear-gradient(135deg, #6b1d2f 0%, #4a101d 100%)", color: "#fff", border: "none" }}
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        await fetch("/api/orders/manual-notify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: createdOrderId }),
                        });
                      } catch (err) {
                        console.error("Ошибка при отправке уведомления о ручной оплате:", err);
                      } finally {
                        setIsSubmitting(false);
                        clearCart();
                        setMode("SUCCESS");
                        setFormData({ name: "", email: "", phone: "", address: "" });
                        setPaymentMethod(null);
                      }
                    }}
                  >
                    Я понял, ожидаю связи
                  </button>
                </div>
              )}

              <span 
                className={styles.backToCartBtn} 
                style={{ display: "block", textAlign: "center", marginTop: "16px", cursor: "pointer", textDecoration: "underline", fontSize: "13px" }}
                onClick={() => {
                  setMode("CHECKOUT");
                  setPaymentMethod(null);
                }}
              >
                Вернуться назад
              </span>
            </div>
          ) : (
            /* Режим заполнения контактных данных (Checkout) */
            <form className={styles.checkoutForm} onSubmit={handleSubmitOrder}>
              {/* Имя */}
              <div className={styles.formGroup}>
                <label htmlFor="checkout-name">Ваше имя *</label>
                <input
                  type="text"
                  id="checkout-name"
                  name="name"
                  className={styles.input}
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label htmlFor="checkout-email">Электронная почта (Email) *</label>
                <input
                  type="email"
                  id="checkout-email"
                  name="email"
                  className={styles.input}
                  placeholder="ivan@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {/* Телефон */}
              <div className={styles.formGroup}>
                <label htmlFor="checkout-phone">Номер телефона (WhatsApp / Telegram) *</label>
                <input
                  type="tel"
                  id="checkout-phone"
                  name="phone"
                  className={styles.input}
                  placeholder="+79991234567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              {/* Адрес (показывается только при наличии браслетов) */}
              {hasBracelets && (
                <div className={styles.formGroup}>
                  <label htmlFor="checkout-address">Адрес доставки (с индексом) *</label>
                  <input
                    type="text"
                    id="checkout-address"
                    name="address"
                    className={styles.input}
                    placeholder="123456, г. Москва, ул. Ленина, д. 10, кв. 25"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>
              )}

              {/* Ссылка возврата в корзину */}
              <span className={styles.backToCartBtn} onClick={handleBackToCart}>
                Вернуться к списку товаров
              </span>
            </form>
          )}
        </div>

        {/* Подвал панели (Footer - только для режимов CART и CHECKOUT) */}
        {mode !== "SUCCESS" && mode !== "PAYMENT" && items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span>Итого:</span>
              <span className={styles.summaryTotal}>{total.toLocaleString("de-DE")} €</span>
            </div>

            {mode === "CART" ? (
              <button className="btn btn-primary" onClick={handleGoToCheckout}>
                Оформить заказ
              </button>
            ) : (
              <button
                className="btn btn-primary btn-accent"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Подтвердить заказ"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
