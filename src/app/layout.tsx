import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { Providers } from "src/components/Providers";
import { CartDrawer } from "src/components/CartDrawer";
import { ScrollToTop } from "src/components/ScrollToTop";
import "./globals.css";

// Подключаем премиальный шрифт Montserrat для заголовков с поддержкой кириллицы
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Подключаем современный шрифт Inter для основного текста с поддержкой кириллицы
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Метаданные для SEO-оптимизации сайта Ольги Хавич
export const metadata: Metadata = {
  title: "Ольга Хавич | Сертифицированный Нумеролог, Таролог и Энерготерапевт",
  description:
    "Персональный сайт нумеролога Ольги Хавич. Услуги нумерологического анализа, расклады Таро, чакроанализ и энергетическое ладование. Купить авторские браслеты и онлайн-курсы по нумерологии с личным кабинетом ученика.",
  keywords: [
    "Ольга Хавич",
    "нумеролог",
    "таролог",
    "энерготерапевт",
    "нумерология обучение",
    "купить браслеты",
    "матрица судьбы",
    "расклад таро",
    "чакроанализ",
    "ладование",
  ],
  authors: [{ name: "Ольга Хавич" }],
  openGraph: {
    title: "Ольга Хавич | Нумерология, Таро и Энергопрактики",
    description:
      "Помогаю находить ответы на жизненные вопросы в сфере финансов, отношений и предназначения. Авторские курсы и энергетические браслеты.",
    type: "website",
    locale: "ru_RU",
  },
  icons: {
    icon: "/favicon.png",
  },
};

/**
 * Корневой макет приложения.
 * Подключает глобальные шрифты и стили, оборачивает дочерние страницы в клиентские провайдеры
 * и рендерит глобальную выдвижную корзину (CartDrawer).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>
          {children}
          <CartDrawer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
