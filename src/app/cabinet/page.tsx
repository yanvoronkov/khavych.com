import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import styles from "./cabinet.module.css";
import { Header } from "src/components/Header";

// Принудительно устанавливаем динамический рендеринг, так как страница зависит от кук сессии
export const dynamic = "force-dynamic";

/**
 * Серверный компонент главной страницы Личного кабинета ученика (/cabinet).
 * Проверяет авторизацию, загружает список курсов из базы данных PostgreSQL
 * с помощью Prisma и рендерит интерфейс на выбранном пользователем языке (RU/DE).
 * 
 * @param props Свойства страницы, содержащие асинхронные параметры поиска searchParams.
 * @returns JSX элемент личного кабинета.
 */
export default async function CabinetPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // 1. Проверяем сессию пользователя на сервере
  const session = await getServerSession();

  // Если сессии нет, перенаправляем на страницу входа
  if (!session) {
    redirect("/login");
  }

  // Считываем язык пользователя из кук
  const cookieStore = await cookies();
  const language = cookieStore.get("khavich_language")?.value === "de" ? "de" : "ru";

  // Загружаем выданные сертификаты пользователя
  const userCertificates = await db.certificate.findMany({
    where: {
      userId: session.userId,
    },
  });

  const searchParams = await props.searchParams;
  const activeTab = searchParams.tab || "learning";

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
      certificate: userCertificates.find((cert: any) => cert.courseId === c.id) || null,
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
      certificate: userCertificates.find((cert: any) => cert.courseId === access.course.id) || null,
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
        return language === "ru" ? "Ожидает оплаты" : "Ausstehend";
      case "PAID":
        return language === "ru" ? "Оплачен" : "Bezahlt";
      case "CANCELLED":
        return language === "ru" ? "Отменен" : "Storniert";
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
            <h1>{language === "ru" ? "Здравствуйте" : "Hallo"}, {session.name}!</h1>
            <p>{language === "ru" ? "Добро пожаловать в ваше личное пространство обучения" : "Willkommen in Ihrem persönlichen Lernbereich"}</p>
          </div>
          <div className={styles.headerActions}>
            {/* Если вошел администратор, показываем кнопку перехода в админку */}
            {session.role === "ADMIN" && (
              <Link href="/admin" className="btn btn-secondary" style={{ borderColor: "#c51722", color: "#c51722" }}>
                {language === "ru" ? "Админ-панель" : "Admin-Bereich"}
              </Link>
            )}

            {/* Ссылка на выход из аккаунта (вызывает API логаута) */}
            <a href="/api/auth/logout" className="btn btn-primary" style={{ backgroundColor: "#555", borderColor: "#555" }}>
              {language === "ru" ? "Выйти" : "Abmelden"}
            </a>
          </div>
        </div>
      </div>

      {/* Переключатель вкладок */}
      <div className="container" style={{ marginBottom: "30px" }}>
        <div className={styles.tabsContainer}>
          <Link
            href="/cabinet?tab=learning"
            className={`${styles.tabBtn} ${activeTab === "learning" ? styles.tabBtnActive : ""}`}
          >
            📚 {language === "ru" ? "Моё обучение" : "Mein Lernen"}
          </Link>
          <Link
            href="/cabinet?tab=orders"
            className={`${styles.tabBtn} ${activeTab === "orders" ? styles.tabBtnActive : ""}`}
          >
            📦 {language === "ru" ? "Мои заказы" : "Meine Bestellungen"}
          </Link>
        </div>
      </div>

      {/* Контент вкладок */}
      <main className="container">
        {activeTab === "learning" ? (
          <section className={styles.coursesSection} style={{ marginTop: 0 }}>
            <h2 className={styles.sectionTitle}>{language === "ru" ? "Доступные курсы" : "Verfügbare Kurse"}</h2>

            {courses.length === 0 ? (
              /* Пустое состояние, если доступов к курсам нет */
              <div className={styles.emptyState}>
                <h2>{language === "ru" ? "У вас пока нет активных курсов" : "Sie haben derzeit keine aktiven Kurse"}</h2>
                <p>
                  {language === "ru" 
                    ? "Здесь будут отображаться ваши обучающие программы. Вы можете приобрести курсы по нумерологии или Таро в нашем магазине, после чего Ольга мгновенно предоставит вам доступ." 
                    : "Hier werden Ihre Kurse angezeigt. Sie können Kurse für Numerologie oder Tarot in unserem Shop erwerben, woraufhin Olga Ihnen sofort den Zugang freischaltet."}
                </p>
                <Link href="/shop" className="btn btn-primary">
                  {language === "ru" ? "Перейти в магазин за курсами" : "Zum Shop für Kurse"}
                </Link>
              </div>
            ) : (
              /* Сетка доступных курсов */
              <div className={styles.coursesGrid}>
                {courses.map((course) => (
                  <div key={course.id} className={styles.courseCard}>
                    {/* Изображение курса */}
                    <div className={styles.imageWrapper}>
                      <img
                        src={((language === "de" && course.imageUrlDe) ? course.imageUrlDe : course.imageUrl) || "/images/placeholder.webp"}
                        alt={course.title}
                        className={styles.courseImage}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    {/* Информация о курсе */}
                    <div className={styles.cardContent}>
                      <h3>{(language === "de" && course.titleDe) ? course.titleDe : course.title}</h3>
                      <p>{(language === "de" && course.descriptionDe) ? course.descriptionDe : course.description}</p>

                      <div className={styles.cardFooter}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span className={styles.lessonsCount}>
                            {language === "ru" ? "Уроков" : "Lektionen"}: {course.lessons.length}
                          </span>
                          {course.expiresAt ? (
                            <span className={styles.expiresBadge}>
                              {language === "ru" ? "До" : "Bis"} 🔑 {new Date(course.expiresAt).toLocaleDateString(language === "ru" ? "ru-RU" : "de-DE")}
                            </span>
                          ) : (
                            <span className={styles.expiresBadge} style={{ color: "#785c12", backgroundColor: "#fff9e6", borderColor: "#f5e6cc" }}>
                              ♾️ {language === "ru" ? "Бессрочно" : "Unbegrenzt"}
                            </span>
                          )}
                          {/* Индикация статуса сертификата */}
                          {course.certificate ? (
                            <a
                              href={course.certificate.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.certificateIssuedBadge}
                              title={language === "ru" ? "Нажмите, чтобы открыть или скачать ваш сертификат" : "Klicken Sie hier, um Ihr Zertifikat zu öffnen oder herunterzuladen"}
                            >
                              🏆 {language === "ru" ? "Сертификат выдан" : "Zertifikat ausgestellt"}
                            </a>
                          ) : (
                            <span className={styles.certificateNotIssuedBadge}>
                              🎓 {language === "ru" ? "Сертификат" : "Zertifikat"}
                            </span>
                          )}
                        </div>

                        {/* Ссылка на уроки курса */}
                        <Link
                          href={`/cabinet/course/${course.id}`}
                          className="btn btn-primary"
                          style={{ padding: "8px 16px", fontSize: "13px" }}
                        >
                          {language === "ru" ? "Начать обучение" : "Lernen starten"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className={styles.ordersSection} style={{ marginTop: 0 }}>
            <h2 className={styles.sectionTitle}>{language === "ru" ? "История заказов" : "Bestellverlauf"}</h2>

            {orders.length === 0 ? (
              <div className={styles.emptyState} style={{ margin: "20px auto" }}>
                <h2>{language === "ru" ? "У вас пока нет заказов" : "Sie haben noch keine Bestellungen"}</h2>
                <p>
                  {language === "ru" 
                    ? "Здесь будут отображаться ваши приобретенные курсы, амулеты или заказанные консультации." 
                    : "Hier werden Ihre erworbenen Kurse, Amulette oder bestellten Beratungen angezeigt."}
                </p>
                <Link href="/shop" className="btn btn-primary">
                  {language === "ru" ? "Перейти в магазин" : "Zum Shop"}
                </Link>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>{language === "ru" ? "ID Заказа" : "Bestell-ID"}</th>
                        <th>{language === "ru" ? "Дата заказа" : "Datum"}</th>
                        <th>{language === "ru" ? "Товары" : "Artikel"}</th>
                        <th>{language === "ru" ? "Сумма" : "Betrag"}</th>
                        <th>{language === "ru" ? "Статус" : "Status"}</th>
                        <th style={{ textAlign: "right" }}>{language === "ru" ? "Действия" : "Aktionen"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const items = getOrderItems(order);
                        const formattedDate = new Date(order.createdAt).toLocaleDateString(language === "ru" ? "ru-RU" : "de-DE", {
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
                                    <strong>{item.name}</strong> ({item.quantity} {language === "ru" ? "шт." : "Stk."})
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
                                  💳 {language === "ru" ? "Оплатить" : "Bezahlen"}
                                </Link>
                              ) : (
                                <span style={{ fontSize: "12px", color: "var(--color-gray)", fontStyle: "italic" }}>
                                  {language === "ru" ? "Действий нет" : "Keine Aktionen"}
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
        )}
      </main>
    </div>
  );
}
