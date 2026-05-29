import { MetadataRoute } from "next";

/**
 * Динамический генератор файла правил для поисковых роботов (robots.txt).
 * Путь: /robots.txt
 * 
 * Настраивает правила индексации страниц: разрешает публичные маршруты
 * и скрывает от поисковиков панели управления, кабинет ученика и системное API.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://khavich.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop", "/login", "/register"],
      disallow: [
        "/admin",
        "/admin/*",
        "/cabinet",
        "/cabinet/*",
        "/api",
        "/api/*",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
