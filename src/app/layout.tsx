import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { Providers } from "src/components/Providers";
import { CartDrawer } from "src/components/CartDrawer";
import { ScrollToTop } from "src/components/ScrollToTop";
import { db } from "src/lib/db";
import "./globals.css";

// Обеспечиваем динамический рендеринг макета для актуального считывания настроек из базы данных при каждом запросе
export const dynamic = "force-dynamic";

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
  metadataBase: new URL("https://khavych.com"),
  title: "Ольга Хавич | Нумеролог, Таролог, Энерготерапевт",
  description:
    "Официальный сайт Ольги Хавич: нумерологический анализ, расклады Таро, ладование и чакроанализ. Онлайн-курсы и авторские браслеты силы.",
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Ольга Хавич" }],
  openGraph: {
    title: "Ольга Хавич | Нумерология, Таро и Энергопрактики",
    description:
      "Помогаю находить ответы на жизненные вопросы в сфере финансов, отношений и предназначения. Авторские курсы и энергетические браслеты.",
    type: "website",
    locale: "ru_RU",
    url: "https://khavych.com",
    images: [
      {
        url: "/og_image.jpg",
        width: 600,
        height: 315,
        alt: "Ольга Хавич | Нумерология, Таро и Энергопрактики",
      },
    ],
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
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Загружаем Yandex Metrika ID из базы данных на сервере
  let yandexMetrikaId = "";
  try {
    const metrikaSetting = await db.setting.findUnique({
      where: { key: "yandexMetrikaId" },
    });
    if (metrikaSetting) {
      yandexMetrikaId = metrikaSetting.value.trim();
    }
  } catch (e) {
    // Безопасный перехват ошибок (например, при сборке проекта)
  }

  return (
    <html lang="ru" className={`${montserrat.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://wa.me" />
        <link rel="preconnect" href="https://t.me" />
        {yandexMetrikaId && (
          <>
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(m,e,t,r,i,k,a){
                      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                      m[i].l=1*new Date();
                      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                  })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${yandexMetrikaId}', 'ym');

                  ym(${yandexMetrikaId}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
                `
              }}
            />
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${yandexMetrikaId}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}
      </head>
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
