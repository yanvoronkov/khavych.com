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

  // 2. Получаем список активных доступов пользователя (исключаем просроченные)
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

  const courses = accesses.map((access) => ({
    ...access.course,
    expiresAt: access.expiresAt,
  }));

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
            <Link href="/shop" className="btn btn-secondary">
              В магазин
            </Link>
            
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
      </main>
    </div>
  );
}
