import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "src/lib/auth";
import { db } from "src/lib/db";
import { isAccessActive } from "src/lib/access";
import styles from "../../cabinet.module.css";
import { Header } from "src/components/Header";
import { CertificateSection } from "src/components/CertificateSection";
import { SecureVideoPlayer } from "src/components/SecureVideoPlayer";

// Принудительно устанавливаем динамический рендеринг
export const dynamic = "force-dynamic";

interface ParsedVideo {
  type: "youtube" | "ok" | "direct" | "iframe";
  url: string;
}

/**
 * Анализирует переданную ссылку на видео и возвращает её тип и подготовленный URL.
 * Поддерживает YouTube, Одноклассники (OK.ru), прямые ссылки на видеофайлы и Kinescope.
 * 
 * @param url Исходная ссылка на видео
 * @returns Объект с типом видео и обработанным URL
 */
function parseVideoUrl(url: string | null | undefined): ParsedVideo {
  if (!url) return { type: "iframe", url: "" };

  const trimmed = url.trim();

  // 1. YouTube
  // Поддерживаемые форматы:
  // - https://www.youtube.com/watch?v=XXXXXX
  // - https://youtube.com/watch?v=XXXXXX
  // - https://youtu.be/XXXXXX
  // - https://www.youtube.com/embed/XXXXXX
  // - https://youtube.com/embed/XXXXXX
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      url: `https://www.youtube.com/embed/${ytMatch[1]}`
    };
  }

  // 2. OK.ru (Одноклассники)
  // Поддерживаемые форматы:
  // - https://ok.ru/video/XXXXXX
  // - https://www.ok.ru/video/XXXXXX
  // - https://m.ok.ru/video/XXXXXX
  // - https://ok.ru/videoembed/XXXXXX
  const okRegex = /(?:ok\.ru|m\.ok\.ru)\/(?:video|videoembed)\/(\d+)/;
  const okMatch = trimmed.match(okRegex);
  if (okMatch && okMatch[1]) {
    return {
      type: "ok",
      url: `https://ok.ru/videoembed/${okMatch[1]}`
    };
  }

  // 3. Прямая ссылка на видеофайл (обычный хостинг, Vercel Blob и т.д.)
  // Проверяем расширения файлов или наличие ключевых слов
  const isDirectVideo = 
    /\.(mp4|webm|ogg|mov|m4v)(?:\?|$)/i.test(trimmed) || 
    trimmed.includes("public.blob.vercel-storage.com") ||
    trimmed.includes("/video/");

  if (isDirectVideo) {
    return {
      type: "direct",
      url: trimmed
    };
  }

  // 4. По умолчанию - встраивание через iframe (Kinescope, RuTube, Vimeo и готовые iframe-коды)
  // Если это Kinescope без /embed/, автоматически добавляем его для лучшей совместимости
  if (trimmed.includes("kinescope.io") && !trimmed.includes("/embed/")) {
    const kinescopeId = trimmed.split("/").pop();
    if (kinescopeId) {
      return {
        type: "iframe",
        url: `https://kinescope.io/embed/${kinescopeId}`
      };
    }
  }

  return {
    type: "iframe",
    url: trimmed
  };
}

/**
 * Интерфейс параметров страницы просмотра курса
 */
interface ICoursePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    lessonId?: string;
  }>;
}

/**
 * Серверный компонент страницы просмотра курса и проигрывания уроков (/cabinet/course/[id]).
 * Проверяет сессию и доступ пользователя к курсу (UserAccess).
 * Рендерит левое меню уроков и правый блок с плеером Kinescope и файлами.
 */
export default async function CoursePage({ params, searchParams }: ICoursePageProps) {
  // Ожидаем асинхронные параметры Next.js 16
  const { id: courseId } = await params;
  const { lessonId } = await searchParams;

  // 1. Проверяем сессию пользователя на сервере
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // 2. Проверяем наличие доступа (UserAccess) к данному курсу у текущего пользователя (если не ADMIN)
  if (session.role !== "ADMIN") {
    const access = await db.userAccess.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: courseId,
        },
      },
    });

    // Если доступа нет или срок действия истек, перенаправляем обратно в кабинет
    if (!access || !isAccessActive(access.expiresAt)) {
      redirect("/cabinet");
    }
  }

  // 3. Загружаем курс и его уроки из БД
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course || (!course.isPublished && session.role !== "ADMIN")) {
    redirect("/cabinet");
  }

  const lessons = course.lessons;

  // Загружаем сертификат пользователя для этого курса
  const certificate = await db.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: session.userId,
        courseId: courseId,
      },
    },
  });

  if (lessons.length === 0) {
    return (
      <div className={styles.lessonLayout} style={{ justifyContent: "center", alignItems: "center", padding: "40px" }}>
        <div className={styles.emptyState}>
          <h2>В этом курсе ещё нет уроков</h2>
          <p>Ольга скоро добавит обучающие материалы. Пожалуйста, зайдите позже.</p>
          <Link href="/cabinet" className="btn btn-primary">
            Вернуться в кабинет
          </Link>
        </div>
      </div>
    );
  }

  // 4. Определяем активный урок
  let activeLesson = lessons[0];
  if (lessonId) {
    const found = lessons.find((l) => l.id === lessonId);
    if (found) {
      activeLesson = found;
    }
  }

  return (
    <div className={styles.cabinetPage} style={{ paddingBottom: "60px" }}>
      {/* Подключаем глобальный Header */}
      <Header />

      <div className="container" style={{ marginTop: "40px" }}>
        <div className={styles.lessonLayout}>
          {/* Боковое меню уроков (сайдбар) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <Link href="/cabinet" className={styles.backBtn}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Назад в кабинет
              </Link>
              <h3 className={styles.courseTitle}>{course.title}</h3>
            </div>

            <nav className={styles.lessonsList}>
              {lessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <Link
                    key={lesson.id}
                    href={`/cabinet/course/${courseId}?lessonId=${lesson.id}`}
                    className={`${styles.lessonItem} ${isActive ? styles.activeLesson : ""}`}
                  >
                    <span className={styles.lessonNum}>{lesson.order}</span>
                    <span className={styles.lessonItemTitle}>{lesson.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Блок выдачи и скачивания сертификата */}
            <CertificateSection
              courseId={courseId}
              courseTitle={course.title}
              defaultUserName={session.name}
              initialPdfUrl={certificate ? certificate.pdfUrl : null}
            />
          </aside>

          {/* Основной контент активного урока */}
          <main className={styles.lessonContent}>
            {/* Заголовок урока */}
            <div className={styles.lessonHeader}>
              <h1 className={styles.lessonTitle}>{activeLesson.title}</h1>
            </div>

            {/* Видео плеер или красивая плашка, если видео нет */}
            {activeLesson.videoUrl ? (
              <div className={styles.videoContainer}>
                {(() => {
                  const parsed = parseVideoUrl(activeLesson.videoUrl);
                  if (parsed.type === "direct") {
                    return (
                      <SecureVideoPlayer
                        src={parsed.url}
                        className={styles.videoIframe}
                      />
                    );
                  }
                  return (
                    <iframe
                      src={parsed.url}
                      className={styles.videoIframe}
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media;"
                      allowFullScreen
                    />
                  );
                })()}
              </div>
            ) : (
              <div className={styles.noVideoBanner}>
                <div className={styles.noVideoIcon}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </div>
                <span className={styles.noVideoText}>Это занятие без видео</span>
              </div>
            )}

            {/* Детали урока: описание и прикрепленные файлы */}
            <div className={styles.lessonMeta}>
              {/* Описание урока */}
              <div className={styles.lessonDescription}>
                <h4>Описание занятия</h4>
                <div
                  className={styles.lessonText}
                  dangerouslySetInnerHTML={{ __html: activeLesson.description }}
                />
              </div>

              {/* Прикрепленные материалы для скачивания */}
              <div className={styles.filesBox}>
                <h4>Материалы к уроку</h4>
                {activeLesson.fileUrls && activeLesson.fileUrls.length > 0 ? (
                  <div className={styles.filesList}>
                    {activeLesson.fileUrls.map((url, idx) => {
                      const parts = url.split(":::");
                      const fileTitle = parts.length > 1 ? parts[0] : "";
                      const fileUrl = parts.length > 1 ? parts[1] : parts[0];
                      // Используем заголовок, а если его нет — имя файла из ссылки
                      const fileName = fileTitle || fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

                      return (
                        <a
                          key={idx}
                          href={fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.fileLink}
                          title={`Скачать: ${fileName}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                          </svg>
                          <span>{fileName || `Материал ${idx + 1}`}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.noFiles}>К этому уроку нет дополнительных материалов</p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

