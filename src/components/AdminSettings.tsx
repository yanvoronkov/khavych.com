"use client";

import React, { useState, useEffect } from "react";
import styles from "./AdminSettings.module.css";

interface IAdminSettingsProps {
  /**
   * Функция отображения глобальных уведомлений в админ-панели
   */
  showNotification: (text: string, type: "success" | "error") => void;
}

interface ISettingsState {
  telegramBotToken: string;
  telegramChatId: string;
  certificateBgUrl: string;
}

/**
 * Компонент управления системными настройками в админ-панели.
 * Позволяет настраивать уведомления в Telegram-бота (токен и chat ID)
 * и осуществлять тестовую отправку сообщений для проверки интеграции.
 */
export const AdminSettings: React.FC<IAdminSettingsProps> = ({ showNotification }) => {
  const [settings, setSettings] = useState<ISettingsState>({
    telegramBotToken: "",
    telegramChatId: "",
    certificateBgUrl: "",
  });
  
  const [uploadingBg, setUploadingBg] = useState<boolean>(false);
  const [savingBg, setSavingBg] = useState<boolean>(false);
  const [bgMessage, setBgMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  
  // Локальные сообщения об ошибке/успехе для формы настроек
  const [localMessage, setLocalMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  /**
   * Загружает текущие настройки из базы данных через API
   */
  const fetchSettings = async () => {
    setLoading(true);
    setLocalMessage(null);
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Не удалось загрузить настройки");
      }
      
      if (data.success && data.settings) {
        setSettings({
          telegramBotToken: data.settings.telegramBotToken || "",
          telegramChatId: data.settings.telegramChatId || "",
          certificateBgUrl: data.settings.certificateBgUrl || "",
        });
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Произошла неизвестная ошибка при загрузке";
      setLocalMessage({ text: errMsg, type: "error" });
      showNotification(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Обработчик сохранения настроек в базу данных
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.telegramBotToken.trim() || !settings.telegramChatId.trim()) {
      setLocalMessage({
        text: "Для сохранения настроек необходимо заполнить оба поля: Токен бота и ID чата",
        type: "error",
      });
      showNotification("Заполните оба обязательных поля", "error");
      return;
    }

    setSaving(true);
    setLocalMessage(null);
    
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          telegramBotToken: settings.telegramBotToken,
          telegramChatId: settings.telegramChatId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Ошибка при сохранении настроек");
      }
      
      setLocalMessage({ text: "Настройки успешно сохранены в базе данных!", type: "success" });
      showNotification("Настройки успешно сохранены", "success");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Произошла ошибка при сохранении настроек";
      setLocalMessage({ text: errMsg, type: "error" });
      showNotification(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Отправляет тестовое сообщение в Telegram-чат для проверки корректности токена и chat ID
   */
  const handleTestTelegram = async () => {
    if (!settings.telegramBotToken.trim() || !settings.telegramChatId.trim()) {
      setLocalMessage({
        text: "Для проверки необходимо заполнить оба поля: Токен бота и ID чата",
        type: "error",
      });
      return;
    }
    
    setTesting(true);
    setLocalMessage(null);
    
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "testTelegram",
          telegramBotToken: settings.telegramBotToken,
          telegramChatId: settings.telegramChatId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Telegram API вернул ошибку при отправке сообщения");
      }
      
      setLocalMessage({
        text: "Тестовое сообщение успешно отправлено! Пожалуйста, проверьте ваш Telegram.",
        type: "success",
      });
      showNotification("Тестовое сообщение отправлено!", "success");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Не удалось отправить тестовое сообщение";
      setLocalMessage({ text: `Ошибка проверки: ${errMsg}`, type: "error" });
      showNotification("Ошибка проверки Telegram", "error");
    } finally {
      setTesting(false);
    }
  };

  /**
   * Загрузка фонового изображения сертификата на Vercel Blob
   */
  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBgMessage({ text: "Разрешена загрузка только графических изображений (картинок)", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setBgMessage({ text: "Размер файла не должен превышать 5 МБ", type: "error" });
      return;
    }

    setUploadingBg(true);
    setBgMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", "certificate");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || "Не удалось загрузить файл");
      }

      setSettings((prev) => ({ ...prev, certificateBgUrl: data.url }));
      setBgMessage({ text: "Изображение успешно загружено во временную память! Нажмите «Сохранить оформление», чтобы применить.", type: "success" });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Ошибка при загрузке изображения";
      setBgMessage({ text: errMsg, type: "error" });
    } finally {
      setUploadingBg(false);
      // Сбрасываем инпут
      e.target.value = "";
    }
  };

  /**
   * Сохранение только фонового изображения сертификата в базу данных
   */
  const handleSaveBg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBg(true);
    setBgMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          certificateBgUrl: settings.certificateBgUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось сохранить настройки оформления");
      }

      setBgMessage({ text: "Оформление сертификата успешно сохранено в базе данных!", type: "success" });
      showNotification("Оформление сертификата сохранено", "success");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Произошла ошибка при сохранении";
      setBgMessage({ text: errMsg, type: "error" });
      showNotification(errMsg, "error");
    } finally {
      setSavingBg(false);
    }
  };

  /**
   * Сброс фонового изображения на стандартный вариант
   */
  const handleResetBg = () => {
    setSettings((prev) => ({ ...prev, certificateBgUrl: "" }));
    setBgMessage({ text: "Выбран стандартный фон сертификата. Не забудьте нажать «Сохранить оформление».", type: "success" });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-gray)" }}>
        <div className={styles.spinner} style={{ borderColor: "var(--color-primary)", width: "30px", height: "30px", borderWidth: "3px" }} />
        <p style={{ marginTop: "12px", fontSize: "14px", fontWeight: 600 }}>Загрузка настроек...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardTitleBlock}>
          <h2 className={styles.cardTitle}>
            <span>⚙️</span> Системные настройки и интеграции
          </h2>
          <p className={styles.cardSubtitle}>
            Управление параметрами уведомлений и связи с внешними сервисами
          </p>
        </div>

        {localMessage && (
          <div className={`${styles.alert} ${localMessage.type === "success" ? styles.alertSuccess : styles.alertError}`}>
            <span>{localMessage.type === "success" ? "✅" : "⚠️"}</span>
            <div>{localMessage.text}</div>
          </div>
        )}

        <div className={styles.infoBlock}>
          <div className={styles.infoBlockTitle}>📢 Как настроить уведомления в Telegram:</div>
          <div className={styles.infoBlockText}>
            Для того чтобы получать мгновенные уведомления о новых заказах и оплатах на сайте в Telegram, выполните следующие шаги:
            <ol>
              <li>Откройте Telegram и найдите официального бота <b>@BotFather</b>. Создайте нового бота с помощью команды <code>/newbot</code> и скопируйте полученный <b>HTTP API Token</b>.</li>
              <li>Начните диалог с созданным ботом (нажмите кнопку <b>Запустить / Start</b>).</li>
              <li>Узнайте свой персональный <b>ID чата</b> (Chat ID). Для этого перешлите любое сообщение от себя боту <b>@userinfobot</b> или воспользуйтесь ботом <b>@GetMyChatID_Bot</b>. Если вы хотите получать уведомления в группу, добавьте вашего созданного бота в группу и узнайте ID группы.</li>
              <li>Заполните поля ниже, нажмите кнопку <b>Сохранить настройки</b>, а затем нажмите <b>Проверить подключение</b> для отправки тестового оповещения.</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="telegramBotToken">
              Токен бота Telegram (Bot Token) *
            </label>
            <input
              type="text"
              id="telegramBotToken"
              className={styles.formInput}
              placeholder="Например: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={settings.telegramBotToken}
              onChange={(e) => setSettings((prev) => ({ ...prev, telegramBotToken: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="telegramChatId">
              ID чата или группы Telegram (Chat ID) *
            </label>
            <input
              type="text"
              id="telegramChatId"
              className={styles.formInput}
              placeholder="Например: 987654321 или -100123456789"
              value={settings.telegramChatId}
              onChange={(e) => setSettings((prev) => ({ ...prev, telegramChatId: e.target.value }))}
            />
          </div>

          <div className={styles.actionsRow}>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving || testing}
            >
              {saving ? "Сохранение..." : "Сохранить настройки"}
            </button>
            
            <button
              type="button"
              className={styles.testBtn}
              onClick={handleTestTelegram}
              disabled={saving || testing}
            >
              {testing ? "Отправка теста..." : "Проверить подключение"}
            </button>
          </div>
        </form>
      </div>

      {/* Карточка 2: Настройка оформления сертификата */}
      <div className={styles.card}>
        <div className={styles.cardTitleBlock}>
          <h2 className={styles.cardTitle}>
            <span>🎨</span> Оформление именного сертификата
          </h2>
          <p className={styles.cardSubtitle}>
            Загрузка фонового рисунка для сертификатов учеников (альбомная ориентация 16:9)
          </p>
        </div>

        {bgMessage && (
          <div className={`${styles.alert} ${bgMessage.type === "success" ? styles.alertSuccess : styles.alertError}`}>
            <span>{bgMessage.type === "success" ? "✅" : "⚠️"}</span>
            <div>{bgMessage.text}</div>
          </div>
        )}

        <div className={styles.infoBlock} style={{ borderLeftColor: "#ab8c44", backgroundColor: "rgba(171, 140, 68, 0.03)" }}>
          <div className={styles.infoBlockTitle}>📐 Требования к фоновому файлу:</div>
          <div className={styles.infoBlockText}>
            Для идеального рендеринга и высокого качества печати:
            <ul style={{ margin: "8px 0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
              <li>Используйте изображение с точными пропорциями <b>16:9</b> (например, <b>1920x1080</b> или <b>1024x576</b> пикселей).</li>
              <li>Рекомендуемый формат: качественный <b>JPG</b> с умеренным сжатием или <b>PNG</b>.</li>
              <li>Максимальный размер файла: <b>5 МБ</b>.</li>
              <li>Фон должен быть неброским, чтобы золотые и темные надписи (имя ученика, название курса) легко читались.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSaveBg} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Текущий фон сертификата</label>
            
            {/* Контейнер интерактивного предпросмотра фона */}
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
                aspectRatio: "16 / 9",
                borderRadius: "8px",
                border: "2px dashed #ccc",
                backgroundColor: "#f9f9f9",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#ccc";
              }}
              onClick={() => document.getElementById("certificate-bg-file")?.click()}
            >
              {uploadingBg ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", zIndex: 5 }}>
                  <div className={styles.spinner} style={{ borderColor: "var(--color-primary)", width: "30px", height: "30px", borderWidth: "3px" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>Загрузка картинки в Vercel Blob...</span>
                </div>
              ) : (
                <>
                  <img
                    src={settings.certificateBgUrl || "/images/cert-bg.jpeg"}
                    alt="Certificate Background Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: 0.85,
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/images/cert-bg.jpeg";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      color: "#fff",
                      padding: "8px 12px",
                      fontSize: "12px",
                      textAlign: "center",
                      fontWeight: 600,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {settings.certificateBgUrl ? "📸 Кастомный фон (нажмите, чтобы изменить)" : "🖼️ Стандартный фон (нажмите, чтобы загрузить свой)"}
                  </div>
                </>
              )}
            </div>
            
            <input
              type="file"
              id="certificate-bg-file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleUploadBg}
              disabled={uploadingBg || savingBg}
            />
          </div>

          <div className={styles.actionsRow}>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={uploadingBg || savingBg}
            >
              {savingBg ? "Сохранение..." : "Сохранить оформление"}
            </button>

            {settings.certificateBgUrl && (
              <button
                type="button"
                className={styles.testBtn}
                style={{ color: "#c62828", borderColor: "#c62828" }}
                onClick={handleResetBg}
                disabled={uploadingBg || savingBg}
              >
                🔄 Сбросить на стандартный
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
