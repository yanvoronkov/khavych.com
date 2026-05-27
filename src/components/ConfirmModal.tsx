"use client";

import React, { useEffect } from "react";

interface ConfirmModalProps {
  /** Управляет отображением модального окна */
  isOpen: boolean;
  /** Обработчик закрытия модального окна */
  onClose: () => void;
  /** Обработчик подтверждения действия */
  onConfirm: () => void;
  /** Заголовок окна */
  title: string;
  /** Текст сообщения/вопроса */
  message: string;
  /** Текст кнопки подтверждения (по умолчанию "Подтвердить") */
  confirmText?: string;
  /** Текст кнопки отмены (по умолчанию "Отмена") */
  cancelText?: string;
  /** Опасное ли действие (например, удаление), делает кнопку подтверждения красной */
  danger?: boolean;
}

/**
 * Универсальный компонент модального окна подтверждения действия.
 * Заменяет стандартный браузерный window.confirm() на стильный диалог в дизайне приложения.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = false,
}: ConfirmModalProps) {
  // Закрытие модального окна по клавише Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        backdropFilter: "blur(6px)",
        padding: "20px",
        boxSizing: "border-box",
        animation: "confirmFadeIn 0.2s ease-out forward",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
          border: "1px solid #eae0db",
          overflow: "hidden",
          animation: "confirmScaleUp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forward",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Хедер диалога */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f2e9e4",
            backgroundColor: "#fdfbf7",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "24px" }}>{danger ? "⚠️" : "❓"}</span>
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: "#2c221e",
              fontFamily: "var(--font-montserrat, sans-serif)",
            }}
          >
            {title}
          </h3>
        </div>

        {/* Текст сообщения */}
        <div style={{ padding: "24px", boxSizing: "border-box" }}>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#5c4f49",
              fontFamily: "var(--font-montserrat, sans-serif)",
            }}
          >
            {message}
          </p>
        </div>

        {/* Кнопки действий */}
        <div
          style={{
            padding: "16px 24px",
            backgroundColor: "#fdfbf7",
            borderTop: "1px solid #f2e9e4",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#5c4f49",
              border: "1px solid #dcd1cb",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#faf5f2";
              e.currentTarget.style.borderColor = "#c4b6af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.borderColor = "#dcd1cb";
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: "10px 22px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              background: danger
                ? "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)"
                : "linear-gradient(135deg, #d4af37 0%, #b58d3d 100%)",
              boxShadow: danger
                ? "0 4px 12px rgba(211, 47, 47, 0.3)"
                : "0 4px 12px rgba(212, 175, 55, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = danger
                ? "0 6px 16px rgba(211, 47, 47, 0.4)"
                : "0 6px 16px rgba(212, 175, 55, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = danger
                ? "0 4px 12px rgba(211, 47, 47, 0.3)"
                : "0 4px 12px rgba(212, 175, 55, 0.3)";
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
