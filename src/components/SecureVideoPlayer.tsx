"use client";

import React from "react";

interface SecureVideoPlayerProps {
  src: string;
  className?: string;
}

/**
 * Защищенный клиентский компонент видеоплеера.
 * Блокирует контекстное меню (правый клик) и Picture-in-Picture режим для базовой защиты от скачивания.
 */
export function SecureVideoPlayer({ src, className }: SecureVideoPlayerProps) {
  return (
    <video
      src={src}
      className={className}
      controls
      controlsList="nodownload"
      playsInline
      onContextMenu={(e) => e.preventDefault()}
      disablePictureInPicture
    />
  );
}
