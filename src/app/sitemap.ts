import { MetadataRoute } from "next";

/**
 * Динамический генератор карты сайта (sitemap.xml) для поисковых систем.
 * Путь: /sitemap.xml
 * 
 * Автоматически генерирует актуальный список индексируемых страниц при каждом запросе.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://khavich.com";

  // Статические публичные страницы сайта
  const routes = ["", "/shop", "/login", "/register"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return [...routes];
}
