"use client";

import React, { useState, useEffect } from "react";

interface SecureVideoPlayerProps {
  src: string;
  type: "direct" | "iframe";
  coverUrl?: string | null;
  className?: string;
}

/**
 * Защищенный клиентский компонент видеоплеера.
 * Блокирует контекстное меню (правый клик) и Picture-in-Picture режим для базовой защиты от скачивания.
 * Поддерживает отображение обложки с кнопкой воспроизведения и ленивым запуском плеера.
 */
export function SecureVideoPlayer({ src, type, coverUrl, className }: SecureVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Сбрасываем состояние воспроизведения при переходе на другой урок
  useEffect(() => {
    setIsPlaying(false);
  }, [src]);

  // Если обложка задана и видео еще не запущено
  if (coverUrl && !isPlaying) {
    return (
      <div
        className={className}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          borderRadius: "inherit",
          overflow: "hidden",
        }}
        onClick={() => setIsPlaying(true)}
      >
        {/* Затемняющий оверлей для выделения кнопки Play */}
        <div
          className="cover-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            transition: "background-color 0.3s ease",
            zIndex: 1,
          }}
        />

        {/* Анимированная кнопка Play */}
        <div
          className="play-button-outer"
          style={{
            zIndex: 2,
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d4af37 0%, #b58d3d 100%)",
            boxShadow: "0 8px 24px rgba(212, 175, 55, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              width: "28px",
              height: "28px",
              color: "#fff",
              marginLeft: "4px",
            }}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Локальные стили для эффектов наведения и пульсации */}
        <style>{`
          .play-button-outer {
            animation: playButtonPulse 2.5s infinite;
          }
          div[style*="backgroundImage"]:hover .play-button-outer {
            transform: scale(1.12);
            box-shadow: 0 12px 30px rgba(212, 175, 55, 0.65);
          }
          div[style*="backgroundImage"]:hover .cover-overlay {
            background-color: rgba(0, 0, 0, 0.35);
          }
          @keyframes playButtonPulse {
            0% {
              box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0.4);
            }
            70% {
              box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4), 0 0 0 15px rgba(212, 175, 55, 0);
            }
            100% {
              box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4), 0 0 0 0 rgba(212, 175, 55, 0);
            }
          }
        `}</style>
      </div>
    );
  }

  // Если обложки нет или пользователь нажал Play - рендерим реальный плеер
  if (type === "direct") {
    return (
      <video
        src={src}
        className={className}
        controls
        controlsList="nodownload"
        playsInline
        onContextMenu={(e) => e.preventDefault()}
        disablePictureInPicture
        autoPlay={isPlaying}
      />
    );
  }

  // Для iframes (YouTube, OK.ru, Kinescope)
  // Добавляем autoplay=1 к ссылке, если проигрывание было инициировано кликом по обложке
  const finalSrc = isPlaying
    ? src.includes("?")
      ? `${src}&autoplay=1`
      : `${src}?autoplay=1`
    : src;

  return (
    <iframe
      src={finalSrc}
      className={className}
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media;"
      allowFullScreen
    />
  );
}
