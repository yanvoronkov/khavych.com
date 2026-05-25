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
  });
  
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
              Токен бота Telegram (Bot Token)
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
              ID чата или группы Telegram (Chat ID)
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
    </div>
  );
};
