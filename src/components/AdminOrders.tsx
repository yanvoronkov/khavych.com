"use client";

import React, { useState, useEffect } from "react";
import styles from "./AdminOrders.module.css";

// Интерфейс для единичного товара внутри заказа
interface IOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "BRACELET" | "COURSE" | "CONSULTATION";
}

// Интерфейс заказа
export interface IAdminOrder {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string | null;
  items: string | IOrderItem[]; // Может прийти как строка JSON или как распарсенный массив
  status: "PENDING" | "PAID" | "CANCELLED";
  totalAmount: number | string;
  createdAt: string;
  updatedAt: string;
}

interface AdminOrdersProps {
  showNotification: (msg: string, type: "success" | "error") => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ showNotification }) => {
  const [orders, setOrders] = useState<IAdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Состояния фильтрации и поиска
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID" | "CANCELLED">("ALL");

  // Детали выбранного заказа для модального окна
  const [selectedOrder, setSelectedOrder] = useState<IAdminOrder | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState<string | null>(null);

  // Загрузка заказов при монтировании
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/orders");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Не удалось загрузить список заказов");
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при загрузке заказов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Изменение статуса заказа
  const handleUpdateStatus = async (id: string, newStatus: "PENDING" | "PAID" | "CANCELLED") => {
    try {
      setIsChangingStatus(id);
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Не удалось обновить статус заказа");
      }

      // Обновляем в локальном стейте список заказов
      setOrders((prev) => prev.map((ord) => (ord.id === id ? data.order : ord)));
      
      // Если открыто модальное окно деталей, тоже обновляем его
      if (selectedOrder?.id === id) {
        setSelectedOrder(data.order);
      }

      const statusLabels = {
        PENDING: "Ожидает оплаты",
        PAID: "Оплачен (доступ к курсам выдан)",
        CANCELLED: "Отменен",
      };

      showNotification(`Статус заказа успешно изменен на "${statusLabels[newStatus]}"`, "success");
    } catch (err: any) {
      showNotification(err.message || "Не удалось изменить статус заказа", "error");
    } finally {
      setIsChangingStatus(null);
    }
  };

  // Безопасное получение списка товаров в виде массива
  const getOrderItems = (order: IAdminOrder): IOrderItem[] => {
    if (typeof order.items === "string") {
      try {
        return JSON.parse(order.items) as IOrderItem[];
      } catch (e) {
        console.error("Ошибка парсинга items в заказе", e);
        return [];
      }
    }
    if (Array.isArray(order.items)) {
      return order.items as IOrderItem[];
    }
    return [];
  };

  // Фильтрация и поиск заказов
  const filteredOrders = orders.filter((order) => {
    // 1. Фильтр по статусу
    if (statusFilter !== "ALL" && order.status !== statusFilter) {
      return false;
    }

    // 2. Поиск по запросу
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchEmail = order.customerEmail.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      const matchItems = getOrderItems(order).some((item) =>
        item.name.toLowerCase().includes(q)
      );

      return matchName || matchEmail || matchPhone || matchId || matchItems;
    }

    return true;
  });

  // Получение подписи для категорий товаров
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "COURSE":
        return "Курс";
      case "CONSULTATION":
        return "Услуга";
      case "BRACELET":
        return "Браслет";
      default:
        return cat;
    }
  };

  // Текстовая репрезентация статуса
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Ожидает оплаты";
      case "PAID":
        return "Оплачен";
      case "CANCELLED":
        return "Отменен";
      default:
        return status;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-dark)" }}>
            📦 Управление заказами ({filteredOrders.length} из {orders.length})
          </h2>
          <p style={{ fontSize: "12px", color: "var(--color-gray)" }}>
            Просмотр платежей клиентов, автовыдача доступов и отслеживание статуса доставки браслетов
          </p>
        </div>
      </div>

      {/* Поиск и фильтрация */}
      <div className={styles.searchFilterRow}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск по имени, Email, телефону, ID заказа..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className={styles.searchIcon}
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${statusFilter === "ALL" ? styles.filterTabActive : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            Все заказы
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === "PENDING" ? styles.filterTabActive : ""}`}
            onClick={() => setStatusFilter("PENDING")}
          >
            Ожидают оплаты
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === "PAID" ? styles.filterTabActive : ""}`}
            onClick={() => setStatusFilter("PAID")}
          >
            Оплаченные
          </button>
          <button
            className={`${styles.filterTab} ${statusFilter === "CANCELLED" ? styles.filterTabActive : ""}`}
            onClick={() => setStatusFilter("CANCELLED")}
          >
            Отмененные
          </button>
        </div>
      </div>

      {/* Вывод списка заказов */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-primary)", fontWeight: 600 }}>
          Загрузка списка заказов...
        </div>
      ) : error ? (
        <div style={{ padding: "20px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "10px", fontWeight: 600 }}>
          {error}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--color-gray)",
            border: "1px dashed var(--color-gray-border)",
            borderRadius: "12px",
          }}
        >
          Нет заказов, соответствующих выбранным фильтрам.
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>ID Заказа</th>
                  <th>Дата создания</th>
                  <th>Клиент</th>
                  <th>Товары</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th style={{ textAlign: "right" }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const items = getOrderItems(order);
                  const formattedDate = new Date(order.createdAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.orderId} title={order.id}>
                          #{order.id.substring(0, 8)}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--color-gray)" }}>
                        {formattedDate}
                      </td>
                      <td>
                        <div className={styles.customerName}>{order.customerName}</div>
                        <div className={styles.customerContact}>
                          {order.customerEmail} | {order.customerPhone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                          {items.map((item, idx) => (
                            <div key={idx}>
                              <strong>{item.name}</strong> ({item.quantity} шт.)
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={styles.amount}>
                          {Number(order.totalAmount).toLocaleString("de-DE")} €
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[`badge${order.status}`]}`}>
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "currentColor",
                            }}
                          />
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className={styles.actionsCell} style={{ justifyContent: "flex-end" }}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => setSelectedOrder(order)}
                          >
                            Детали
                          </button>

                          {order.status === "PENDING" && (
                            <button
                              className={`${styles.actionBtn} ${styles.payBtn}`}
                              onClick={() => handleUpdateStatus(order.id, "PAID")}
                              disabled={isChangingStatus === order.id}
                            >
                              {isChangingStatus === order.id ? "..." : "Оплачен"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Модальное окно просмотра деталей заказа */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Детали заказа #{selectedOrder.id.substring(0, 8)}</h3>
              <span className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
            </div>

            <div className={styles.modalBody}>
              {/* Клиент */}
              <div>
                <div className={styles.sectionTitle}>Контакты покупателя</div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>ФИО клиента</span>
                    <span className={styles.infoValue}>{selectedOrder.customerName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{selectedOrder.customerEmail}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Телефон</span>
                    <span className={styles.infoValue}>{selectedOrder.customerPhone}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Дата заказа</span>
                    <span className={styles.infoValue}>
                      {new Date(selectedOrder.createdAt).toLocaleString("ru-RU")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Доставка для физических товаров */}
              {selectedOrder.customerAddress && (
                <div>
                  <div className={styles.sectionTitle}>Адрес доставки (Браслеты)</div>
                  <div style={{ backgroundColor: "#fcf9f8", padding: "12px", border: "1px solid var(--color-gray-border)", borderRadius: "8px", fontSize: "14px", fontWeight: 600 }}>
                    📍 {selectedOrder.customerAddress}
                  </div>
                </div>
              )}

              {/* Состав заказа */}
              <div>
                <div className={styles.sectionTitle}>Содержимое заказа</div>
                <div className={styles.itemsList}>
                  {getOrderItems(selectedOrder).map((item, idx) => (
                    <div key={idx} className={styles.itemCard}>
                      <div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemCategory}>
                          {getCategoryLabel(item.category)}
                        </div>
                      </div>
                      <div className={styles.itemPriceQty}>
                        <div style={{ fontWeight: 700, color: "#6b1d2f" }}>
                          {item.price.toLocaleString("de-DE")} €
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--color-gray)", marginTop: "2px" }}>
                          Кол-во: {item.quantity} шт.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Итог и статус */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eae0db", paddingTop: "20px", marginTop: "10px" }}>
                <div>
                  <span className={styles.infoLabel}>Текущий статус</span>
                  <div style={{ marginTop: "6px" }}>
                    <span className={`${styles.badge} ${styles[`badge${selectedOrder.status}`]}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={styles.infoLabel}>Итоговая сумма</span>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#6b1d2f", marginTop: "2px" }}>
                    {Number(selectedOrder.totalAmount).toLocaleString("de-DE")} €
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.actionBtn} onClick={() => setSelectedOrder(null)}>
                Закрыть
              </button>

              {selectedOrder.status === "PENDING" && (
                <>
                  <button
                    className={styles.actionBtn}
                    style={{ borderColor: "#ef4444", color: "#ef4444" }}
                    onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED")}
                    disabled={isChangingStatus !== null}
                  >
                    Отменить заказ
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.payBtn}`}
                    onClick={() => handleUpdateStatus(selectedOrder.id, "PAID")}
                    disabled={isChangingStatus !== null}
                  >
                    Отметить как оплачен
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
