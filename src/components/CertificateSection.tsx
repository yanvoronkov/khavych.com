"use client";

import React, { useState } from "react";
import { CertificateModal } from "./CertificateModal";

interface CertificateSectionProps {
  courseId: string;
  courseTitle: string;
  defaultUserName: string;
  initialPdfUrl: string | null;
}

export function CertificateSection({
  courseId,
  courseTitle,
  defaultUserName,
  initialPdfUrl,
}: CertificateSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl);

  const handleSuccess = (url: string) => {
    setPdfUrl(url);
  };

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "#fffdf9",
        border: "1px solid #f3e6d5",
        boxShadow: "0 4px 12px rgba(181, 141, 61, 0.05)",
      }}
    >
      <h4
        style={{
          margin: "0 0 10px 0",
          fontSize: "14px",
          fontWeight: 700,
          color: "#333",
          fontFamily: "var(--font-title), sans-serif",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        🏆 Завершение обучения
      </h4>

      {pdfUrl ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontSize: "12px", color: "#666", margin: 0, lineHeight: "1.5" }}>
            Ваш именной сертификат об окончании курса успешно сформирован и сохранен.
          </p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              backgroundColor: "#27ae60",
              borderColor: "#27ae60",
              boxShadow: "0 3px 8px rgba(39, 174, 96, 0.2)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            📥 Скачать сертификат (PDF)
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#b58d3d",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              padding: "4px 0",
              textAlign: "center",
              textDecoration: "underline",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#8a7355")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#b58d3d")}
          >
            ✏️ Изменить имя / Перевыпустить
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: "12px", color: "#666", margin: "0 0 12px 0", lineHeight: "1.5" }}>
            После окончания курса вы можете выпустить официальный именной сертификат школы Ольги Хавич.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #d4af37 0%, #b58d3d 100%)",
              borderColor: "#b58d3d",
              boxShadow: "0 4px 10px rgba(181, 141, 61, 0.2)",
              color: "#fff",
              fontWeight: 700,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            🎓 Выдать сертификат
          </button>
        </div>
      )}

      {/* Всплывающее модальное окно */}
      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={courseId}
        courseTitle={courseTitle}
        defaultUserName={defaultUserName}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
