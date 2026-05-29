"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./CertificateModal.module.css";
import { useLanguage } from "../context/LanguageContext";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  defaultUserName: string;
  onSuccess: (pdfUrl: string) => void;
}

export function CertificateModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  defaultUserName,
  onSuccess,
}: CertificateModalProps) {
  const [userName, setUserName] = useState(defaultUserName || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [issuedPdfUrl, setIssuedPdfUrl] = useState("");
  const [scale, setScale] = useState(1);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [error, setError] = useState<string>("");

  const { language, t } = useLanguage();

  const containerRef = useRef<HTMLDivElement>(null);
  const fontsLoadedRef = useRef(false);

  // 1. Динамическое подключение шрифтов и загрузка активного фона
  useEffect(() => {
    if (!isOpen) return;

    // Сбрасываем статус при каждом новом открытии модального окна
    setIsSuccess(false);
    setIssuedPdfUrl("");
    setError("");

    if (!fontsLoadedRef.current) {
      const link = document.createElement("link");
      link.href =
        "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
      fontsLoadedRef.current = true;
    }

    const fetchBg = async () => {
      try {
        const response = await fetch("/api/cabinet/certificates");
        const data = await response.json();
        if (response.ok && data.backgroundUrl) {
          setBackgroundUrl(data.backgroundUrl);
        }
      } catch (error) {
        console.error("Ошибка при загрузке фонового изображения сертификата:", error);
      }
    };

    fetchBg();
  }, [isOpen]);

  // 2. Расчет масштабирования бланка, чтобы он гармонично помещался на экранах любого размера
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 2400px — базовая ширина нашего бланка
        const computedScale = Math.min((containerWidth - 24) / 2400, 1);
        setScale(computedScale > 0 ? computedScale : 1);
      }
    };

    // Небольшой таймаут, чтобы дать DOM отрендериться перед расчетом
    const timer = setTimeout(updateScale, 100);

    window.addEventListener("resize", updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScale);
    };
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  // 3. Генерация PDF с использованием html2canvas и jspdf
  const handleGenerate = async () => {
    if (!userName.trim()) return;

    try {
      setIsGenerating(true);
      setError("");
      setGenerationStep(t("cabinet", "certStep1"));

      // Импортируем библиотеки динамически только при клике, чтобы уменьшить размер базового бандла
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      setGenerationStep(t("cabinet", "certStep2"));

      // Берем скрытый полноразмерный элемент (который отрендерен без CSS-масштабирования)
      const element = document.getElementById("certificate-pdf-target");
      if (!element) {
        throw new Error("Макет сертификата не найден в DOM");
      }

      // Ждем 300мс, чтобы убедиться, что все шрифты полностью применились к скрытому макету
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Рендерим элемент в canvas с коэффициентом масштабирования scale: 1 (так как физический размер бланка уже равен 2400x1792px)
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      setGenerationStep(t("cabinet", "certStep3"));
      // Используем JPEG с качеством 0.9 для достижения идеальной четкости и уменьшения размера файла до ~700-900 КБ
      const imgData = canvas.toDataURL("image/jpeg", 0.9);

      // Размеры бланка 2400x1792 в px
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [2400, 1792],
        compress: true,
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 2400, 1792);

      setGenerationStep(t("cabinet", "certStep4"));
      const pdfBlob = pdf.output("blob");

      // Формируем FormData для загрузки в Vercel Blob и записи в бд
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("recipientName", userName.trim());
      formData.append(
        "file",
        new File([pdfBlob], `Certificate_${courseId}.pdf`, {
          type: "application/pdf",
        })
      );

      const response = await fetch("/api/cabinet/certificates", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || "Не удалось сохранить сертификат на сервере");
      }

      setGenerationStep(t("cabinet", "certStep5"));

      // Автоматическое скачивание файла на компьютер
      const downloadFileName = language === "de"
        ? `Zertifikat Olga Khavich - ${courseTitle}.pdf`
        : `Сертификат Ольга Хавич - ${courseTitle}.pdf`;
      pdf.save(downloadFileName);

      setIssuedPdfUrl(data.certificate.pdfUrl);
      setIsSuccess(true);
      onSuccess(data.certificate.pdfUrl);
    } catch (error: any) {
      console.error("Ошибка при генерации сертификата:", error);
      setError(error.message || t("common", "error"));
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const formattedDate = new Date().toLocaleDateString(
    language === "de" ? "de-DE" : "ru-RU",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  // Вспомогательный JSX для содержимого бланка сертификата
  const renderCertificateContent = () => (
    <div className={styles.borderOuter}>
      <div className={styles.borderInner}>
        {/* Угловой декор */}
        <div className={styles.cornerTopLeft} />
        <div className={styles.cornerTopRight} />
        <div className={styles.cornerBottomLeft} />
        <div className={styles.cornerBottomRight} />

        {/* Шапка */}
        <div className={styles.certHeader}>
          <div className={styles.schoolLogo}>
            {/* Изящная золотая мандала/солнце */}
            <svg width="110" height="110" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="#d4af37" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="32" stroke="#d4af37" strokeWidth="0.8" strokeDasharray="4 2" />
              <path
                d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22"
                stroke="#d4af37"
                strokeWidth="0.5"
              />
              <polygon
                points="50,25 57,43 75,50 57,57 50,75 43,57 25,50 43,43"
                fill="#d4af37"
                opacity="0.85"
              />
              <circle cx="50" cy="50" r="6" fill="#fff" stroke="#d4af37" strokeWidth="1" />
            </svg>
          </div>
          <p className={styles.schoolName}>
            {t("cabinet", "certSchoolName")}
          </p>
        </div>

        {/* Заголовок */}
        <div className={styles.certTitleBlock}>
          <h1 className={styles.certTitle}>{t("cabinet", "certDocTitle")}</h1>
          <p className={styles.certSubtitle}>{t("cabinet", "certDocConfirm")}</p>
        </div>

        {/* Имя получателя */}
        <div className={styles.recipientBlock}>
          <h2 className={styles.recipientName}>
            {userName.trim() || t("cabinet", "certDocDefaultName")}
          </h2>
        </div>

        {/* Курс */}
        <div className={styles.courseBlock}>
          <p className={styles.courseText}>
            {t("cabinet", "certDocCourseText")}{" "}
            <span className={styles.courseName}>«{courseTitle}»</span>
          </p>
        </div>

        {/* Футер бланка: Дата, Золотая Печать, Подпись */}
        <div className={styles.certFooter}>
          <div className={styles.footerLeft}>
            <span className={styles.infoLabel}>{t("cabinet", "certDocDate")}</span>
            <span className={styles.infoValue}>{formattedDate}</span>
          </div>

          <div className={styles.footerRight}>
            <span className={styles.infoLabel}>{t("cabinet", "certDocTeacher")}</span>
            <span className={styles.infoValue}>{t("cabinet", "certDocTeacherName")}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={isGenerating ? undefined : onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {!isGenerating && (
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        )}

        <div className={styles.modalBody}>
          {isSuccess ? (
            /* Экран успешной выдачи */
            <div className={styles.successScreen}>
              <div className={styles.successIcon}>✓</div>
              <h3>{t("cabinet", "certSuccessTitle")}</h3>
              <p>
                {language === "de" ? (
                  <>
                    Das personalisierte Zertifikat über den Kursabschluss <strong>«{courseTitle}»</strong> wurde erfolgreich generiert. Die Datei wurde auf Ihr Gerät heruntergeladen und auch in Ihrem Kundenbereich gespeichert.
                  </>
                ) : (
                  <>
                    Именной сертификат о завершении курса <strong>«{courseTitle}»</strong> успешно сформирован. Файл скачался на ваше устройство, а также сохранен в личном кабинете.
                  </>
                )}
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <a
                  href={issuedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  {t("cabinet", "certSuccessOpen")}
                </a>
                <button className={styles.cancelBtn} onClick={onClose}>
                  {t("cabinet", "certSuccessClose")}
                </button>
              </div>
            </div>
          ) : (
            /* Экран ввода имени и предпросмотра */
            <>
              <div className={styles.modalHeader}>
                <h2>{t("cabinet", "certModalTitle")}</h2>
                <p>
                  {t("cabinet", "certModalDesc")}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="student-name">{t("cabinet", "certInputLabel")}</label>
                <input
                  type="text"
                  id="student-name"
                  className={styles.inputName}
                  placeholder={t("cabinet", "certInputPlaceholder")}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  maxLength={60}
                  disabled={isGenerating}
                />
              </div>

              <div className={styles.previewContainer} ref={containerRef}>
                <span className={styles.previewLabel}>{t("cabinet", "certPreviewLabel")}</span>
                {/* Адаптивная обертка с масштабированием */}
                <div className={styles.scaleWrapper} style={{ height: `${1792 * scale}px` }}>
                  <div
                    className={styles.certificateBlank}
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "center center",
                      position: "absolute",
                      backgroundImage: `url(${backgroundUrl || "/images/cert-bg.webp"})`,
                    }}
                  >
                    {renderCertificateContent()}
                  </div>
                </div>
              </div>

              {error && (
                <div style={{
                  color: "#d32f2f",
                  backgroundColor: "#ffebee",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  border: "1px solid rgba(211, 47, 47, 0.2)",
                  fontFamily: "var(--font-montserrat, sans-serif)",
                }}>
                  <span>⚠️</span>
                  <div>{error}</div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={onClose} disabled={isGenerating}>
                  {t("cabinet", "certCancelBtn")}
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleGenerate}
                  disabled={isGenerating || !userName.trim()}
                >
                  {t("cabinet", "certConfirmBtn")}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Фоновый оверлей загрузки */}
        {isGenerating && (
          <div className={styles.loaderOverlay}>
            <div className={styles.spinner} />
            <p>{t("cabinet", "certGeneratingText")}</p>
            <span>{generationStep}</span>
          </div>
        )}

        {/* Скрытый полноразмерный макет для html2canvas.
            Отрендерен без CSS-масштабирования (1:1), чтобы скриншот получился максимально четким и качественным. */}
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px", overflow: "hidden" }}>
          <div
            id="certificate-pdf-target"
            className={styles.certificateBlank}
            style={{ backgroundImage: `url(${backgroundUrl || "/images/cert-bg.webp"})` }}
          >
            {renderCertificateContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
