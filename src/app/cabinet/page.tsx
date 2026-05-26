import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import styles from "./cabinet.module.css";
import { Header } from "src/components/Header";

// Принудительно устанавливаем динамический рендеринг, так как страница зависит от кук сессии
export const dynamic = "force-dynamic";

/**
 * Серверный компонент главной страницы Личного кабинета ученика (/cabinet).
 * Проверяет авторизацию, загружает список курсов из базы данных PostgreSQL
 * с помощью Prisma и рендерит интерфейс.
 */
export default async function CabinetPage() {
  // 1. Проверяем сессию пользователя на сервере
  const session = await getServerSession();

  // Если сессии нет, перенаправляем на страницу входа
  if (!session) {
    redirect("/login");
  }

  // 2. Получаем список курсов. Для администратора выводим ВСЕ курсы, для учеников — только с активным доступом
  let courses: any[] = [];

  if (session.role === "ADMIN") {
    const dbCourses = await db.course.findMany({
      include: {
        lessons: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    courses = dbCourses.map((c) => ({
      ...c,
      expiresAt: null, // У администратора полный бессрочный доступ
    }));
  } else {
    const accesses = await db.userAccess.findMany({
      where: {
        userId: session.userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        grantedAt: "desc",
      },
    });

    courses = accesses.map((access) => ({
      ...access.course,
      expiresAt: access.expiresAt,
    }));
  }

  // 3. Получаем список заказов пользователя (по его id или email)
  const emailLower = session.email.toLowerCase().trim();
  const orders = await db.order.findMany({
    where: {
      OR: [
        { userId: session.userId },
        { customerEmail: { equals: emailLower, mode: "insensitive" } }
      ]
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getOrderItems = (order: any): any[] => {
    if (typeof order.items === "string") {
      try {
        return JSON.parse(order.items);
      } catch (e) {
        return [];
      }
    }
    if (Array.isArray(order.items)) {
      return order.items;
    }
    return [];
  };

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
    <div className={styles.cabinetPage}>
      {/* Подключаем глобальный Header */}
      <Header />

      {/* Шапка кабинета с приветствием */}
      <div className={styles.cabinetHeader}>
        <div className={`container ${styles.headerContainer}`}>
          <div className={styles.userInfo}>
            <h1>Здравствуйте, {session.name}!</h1>
            <p>Добро пожаловать в ваше личное пространство обучения</p>
          </div>
          <div className={styles.headerActions}>
            {/* Если вошел администратор, показываем кнопку перехода в админку */}
            {session.role === "ADMIN" && (
              <Link href="/admin" className="btn btn-secondary" style={{ borderColor: "#c51722", color: "#c51722" }}>
                Админ-панель
              </Link>
            )}

            {/* Ссылка на выход из аккаунта (вызывает API логаута) */}
            <a href="/api/auth/logout" className="btn btn-primary" style={{ backgroundColor: "#555", borderColor: "#555" }}>
              Выйти
            </a>
          </div>
        </div>
      </div>

      {/* Список курсов */}
      <main className="container">
        <section className={styles.coursesSection}>
          <h2 className={styles.sectionTitle}>Моё обучение</h2>

          {courses.length === 0 ? (
            /* Пустое состояние, если доступов к курсам нет */
            <div className={styles.emptyState}>
              <h2>У вас пока нет активных курсов</h2>
              <p>
                Здесь будут отображаться ваши обучающие программы. Вы можете приобрести курсы по
                нумерологии или Таро в нашем магазине, после чего Ольга мгновенно предоставит вам доступ.
              </p>
              <Link href="/shop" className="btn btn-primary">
                Перейти в магазин за курсами
              </Link>
            </div>
          ) : (
            /* Сетка доступных курсов */
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <div key={course.id} className={styles.courseCard}>
                  {/* Изображение курса */}
                  <div className={styles.imageWrapper}>
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className={styles.courseImage}
                      />
                    ) : (
                      <div className={styles.noImage}>Изображение курса</div>
                    )}
                  </div>

                  {/* Информация о курсе */}
                  <div className={styles.cardContent}>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    
                    <div className={styles.cardFooter}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className={styles.lessonsCount}>
                          Уроков: {course.lessons.length}
                        </span>
                        {course.expiresAt ? (
                          <span className={styles.expiresBadge}>
                            До 🔑 {new Date(course.expiresAt).toLocaleDateString("ru-RU")}
                          </span>
                        ) : (
                          <span className={styles.expiresBadge} style={{ color: "#785c12", backgroundColor: "#fff9e6", borderColor: "#f5e6cc" }}>
                            ♾️ Бессрочно
                          </span>
                        )}
                      </div>
                      
                      {/* Ссылка на уроки курса */}
                      <Link
                        href={`/cabinet/course/${course.id}`}
                        className="btn btn-primary"
                        style={{ padding: "8px 16px", fontSize: "13px" }}
                      >
                        Начать обучение
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Раздел Мои заказы */}
        <section className={styles.ordersSection}>
          <h2 className={styles.sectionTitle}>Мои заказы</h2>

          {orders.length === 0 ? (
            <div className={styles.emptyState} style={{ margin: "20px auto" }}>
              <h2>У вас пока нет заказов</h2>
              <p>
                Здесь будут отображаться ваши приобретенные курсы, амулеты или заказанные консультации.
              </p>
              <Link href="/shop" className="btn btn-primary">
                Перейти в магазин
              </Link>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>ID Заказа</th>
                      <th>Дата заказа</th>
                      <th>Товары</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                      <th style={{ textAlign: "right" }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
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
                            <span className={styles.orderId}>
                              #{order.id.substring(0, 8)}
                            </span>
                          </td>
                          <td style={{ fontSize: "13px", color: "var(--color-gray)" }}>
                            {formattedDate}
                          </td>
                          <td>
                            <div style={{ fontSize: "13px", lineHeight: "1.4" }}>
                              {items.map((item: any, idx: number) => (
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
                            {order.status === "PENDING" ? (
                              <Link
                                href={`/shop?payOrder=${order.id}`}
                                className={styles.payBtn}
                              >
                                💳 Оплатить
                              </Link>
                            ) : (
                              <span style={{ fontSize: "12px", color: "var(--color-gray)", fontStyle: "italic" }}>
                                Действий нет
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
