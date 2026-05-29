"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "src/components/Header";
import styles from "./home.module.css";

// Типы для вопросов квиза
interface QuizQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    score: string; // Рекомендуемая категория/субкатегория
  }[];
}

// Данные вопросов квиза
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Какая сфера вашей жизни сейчас требует наибольшего внимания и трансформации?",
    options: [
      { text: "Финансы и карьера (финансовый потолок, долги, выбор дела)", score: "NUMEROLOGY" },
      { text: "Личные отношения и семья (поиск любви, ссоры, детские проблемы)", score: "TAROT" },
      { text: "Внутреннее состояние (усталость, апатия, нехватка жизненных сил)", score: "WAX" },
      { text: "Поиск предназначения, скрытых талантов и вектора развития", score: "NUMEROLOGY" }
    ]
  },
  {
    id: 2,
    question: "Чувствуете ли вы нехватку энергии или ощущение, что ваши дороги к успеху \"закрыты\"?",
    options: [
      { text: "Да, ощущаю постоянный упадок сил, апатию или застой в делах", score: "WAX" },
      { text: "Иногда чувствую усталость, но в целом справляюсь", score: "LADING" },
      { text: "Нет, с энергией все хорошо, нужен только точный расчет и совет", score: "NUMEROLOGY" }
    ]
  },
  {
    id: 3,
    question: "Какому методу работы вы интуитивно доверяете больше всего?",
    options: [
      { text: "Точным расчетам по дате рождения (цифры, матрицы судеб)", score: "NUMEROLOGY" },
      { text: "Интуитивным подсказкам, символам и раскладам (карты Таро)", score: "TAROT" },
      { text: "Энергетическому очищению воском и огнем (устранение блоков)", score: "WAX" },
      { text: "Мягкому наполнению силой и открытию путей (Ладование)", score: "LADING" }
    ]
  }
];

// Рекомендации по результатам квиза
const QUIZ_RESULTS: Record<string, { title: string; desc: string; link: string; btnText: string }> = {
  NUMEROLOGY: {
    title: "Нумерологический анализ личности и предназначения",
    desc: "Ваши ответы показывают, что сейчас для вас важнее всего получить четкую ментальную карту жизни. Ольга рассчитает вашу индивидуальную Матрицу Судьбы, выявит скрытые таланты, финансовые каналы и укажет точный вектор реализации.",
    link: "/shop?category=CONSULTATION&subCategory=NUMEROLOGY",
    btnText: "Выбрать нумерологический расчет"
  },
  TAROT: {
    title: "Диагностический расклад на картах Таро",
    desc: "Вам необходим точный и честный срез текущих событий. Расклад Таро покажет скрытые мотивы окружающих, истинные причины застоя в отношениях или бизнесе, а также подсветит наиболее удачные развилки выбора.",
    link: "/shop?category=CONSULTATION&subCategory=TAROT",
    btnText: "Выбрать расклад Таро"
  },
  WAX: {
    title: "Глубокая восковая отливка (очищение чакр)",
    desc: "Похоже, вы накопили значительный груз энергетической усталости или чужеродного негатива. Мягкие восковые отливки Ольги Хавич помогут бережно снять деструктивные программы, очистить чакры и восстановить здоровое биополе.",
    link: "/shop?category=CONSULTATION&subCategory=WAX",
    btnText: "Пройти очищение воском"
  },
  LADING: {
    title: "Энергетическое Ладование (открытие дорог)",
    desc: "Вы готовы к наполнению и активным действиям, но вам нужен мягкий импульс сил. Ладование Ольги Хавич настроит ваше поле на финансовую стабильность, здоровье и привлечение ресурсных событий в жизнь.",
    link: "/shop?category=CONSULTATION&subCategory=LADING",
    btnText: "Заказать ладование"
  }
};

interface Diploma {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const DIPLOMAS: Diploma[] = [
  { id: 1, title: "Диплом Нумеролога", subtitle: "Профессиональный числовой анализ матрицы судьбы и предназначения", image: "/sertificate1.webp" },
  { id: 2, title: "Магистр Тарологии", subtitle: "Прогнозирование на Старших и Младших Арканах, анализ ситуации", image: "/sertificate2.webp" },
  { id: 3, title: "Энергопрактик & Ладование", subtitle: "Глубокое очищение энергоканалов, восковые отливки биополя", image: "/sertificate3.webp" },
  { id: 4, title: "Чакроанализ", subtitle: "Диагностика чакровой системы человека по дате рождения", image: "/sertificate4.webp" },
  { id: 5, title: "Коррекция Судьбы", subtitle: "Методология числовых кодов и перенаправление жизненных путей", image: "/sertificate5.webp" },
  { id: 6, title: "Рунические Практики", subtitle: "Сакральные знаки, защитные ставы и диагностика энергетики", image: "/sertificate6.webp" },
  { id: 7, title: "Амулетная Нумерология", subtitle: "Создание индивидуальных минеральных браслетов по формуле рождения", image: "/sertificate7.webp" },
  { id: 8, title: "Психологическое консультирование", subtitle: "Методы гештальт-терапии и когнитивной коррекции в эзотерике", image: "/sertificate8.webp" },
  { id: 9, title: "Практическая Нумерология", subtitle: "Магистр числовых прогнозов, расчет финансового и любовного каналов", image: "/sertificate9.webp" },
  { id: 10, title: "Энергетическая Чистка", subtitle: "Мастер бесконтактного ладования, снятие деструктивных блоков", image: "/sertificate10.webp" },
  { id: 11, title: "Кармическая Коррекция", subtitle: "Определение и развязывание кармических узлов прошлых воплощений", image: "/sertificate11.webp" },
  { id: 12, title: "Осознанное Менторство", subtitle: "Помощь в раскрытии внутреннего потенциала и духовного баланса", image: "/sertificate12.webp" },
  { id: 13, title: "Матрица Изобилия", subtitle: "Индивидуальный расчет финансовых ключей и карьерных векторов", image: "/sertificate13.webp" },
  { id: 14, title: "Энерготерапия 5 Измерения", subtitle: "Интегральные практики глубокого исцеления души и сознания", image: "/sertificate14.webp" }
];

interface Testimonial {
  id: number;
  text: string;
  author: string;
  avatar: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: "Хочу выразить огромную благодарность Ольге замечательному человеку и настоящему профессионалу своего дела. Обращение к ней стало для меня очень важной поддержкой в непростой период жизни. Она не только помогла разобраться в ситуации, но и дала уверенность, спокойствие и внутреннюю гармонию.\n\nСпасибо за помощь, внимание и доброе отношение. Редко встречаются такие светлые и отзывчивые люди. От всей души рекомендую!",
    author: "Елена",
    avatar: "ЕЛ",
    role: "Клиент"
  },
  {
    id: 2,
    text: "Добрый вечер! Ольга, хотела бы выразить Вам огромное спасибо за информацию, анализ и подсказки. Получила огромное количество подробной информации по всем направлениям жизни.\nСамое главное получила для себя ответы на вопросы на которые давно искала ответы. Очень профессиональный подход.\nОльга, вы опытный специалист, дающий мудрые и точные советы и инструменты. Мой запрос был раскрыт, стало понятно направление для дальнейшего движения, даны рекомендации на что обратить внимание, что стоит делать, а от чего стоит отказаться, это было в точку.\nОльга, благодарю вас и желаю удачи!",
    author: "Ирина",
    avatar: "ИР",
    role: "Клиент"
  },
  {
    id: 3,
    text: "Уважаемая Ольга, спасибо за ваш вклад в открытие мне дорог для хорошей работы и безопасности. С Вашей помощью я смогла безопасно доехать домой, хотя в дороге была ужасная авария. Решить многие вопросы по документам, за короткое время приобрести много знакомых, найти три работы, главное кругом успевать теперь. А так же отдельное спасибо за старославянский родовой обряд на помощь и поддержку рода.\nВсе работает, рекомендую Вас как специалиста в этой области своим друзьям и знакомым. Желаю Вам только идти вперед ❤️❤️❤️❤️",
    author: "Татьяна",
    avatar: "ТТ",
    role: "Клиент"
  },
  {
    id: 4,
    text: "Оля спасибо большое тебе за курс, очень приятно с тобой работать 😍 мне очень нравится твоя трактовка карт и то как ты объясняешь, информации невероятно много, буду разбираться ✨😍",
    author: "Юлия",
    avatar: "ЮЛ",
    role: "Ученица курса"
  },
  {
    id: 5,
    text: "Приветики. 😊 Свеча какая прямая и пламя так прямо горит 🥰. А цветочки это лаванда, щебрец, ромашка или я ошибаюсь? Как красиво 😍. Спасибочки солнце 😘 Кстати я все эти дни так себя прекрасно чувствую, так легко, высыпаюсь, в течении дня полна энергии. Суб., воскресенье работала с 6 утра и целый день после до вечера чем то занималась и даже не устала. А ещё не поверишь я не чувствую боли в спине, это прям огонь. Я так сильно тебе благодарна и не только тебе, а тому кто привёл меня на встречу с тобой. 🥰😘",
    author: "Анна",
    avatar: "АН",
    role: "Клиент"
  },
  {
    id: 6,
    text: "Доброе утро. Оля я вчера проснулась в 5:40, проводила малого в школу и думала лягу спать. Но на моё удивление у меня было много энергии, спать не хотелось от слова совсем. Сегодня я чувствую себя так же. Полна энергии и нет чувства сонливости и усталости. ☺️☺️☺️\nЭх... пойду гладить кучу белья 🤣🤣🤣\nСпасибочки 😘",
    author: "Светлана",
    avatar: "СВ",
    role: "Клиент"
  }
];

export default function Home() {
  // Состояния для каруселей
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [visibleSlides, setVisibleSlides] = useState<number>(3);

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState<number>(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState<number>(3);

  // Эффект для адаптивного количества слайдов в каруселях
  useEffect(() => {
    const updateSlidesCount = () => {
      // Сертификаты
      if (window.innerWidth < 768) {
        setVisibleSlides(1);
      } else if (window.innerWidth < 1024) {
        setVisibleSlides(2);
      } else {
        setVisibleSlides(3);
      }

      // Отзывы
      if (window.innerWidth < 768) {
        setVisibleTestimonials(1);
      } else if (window.innerWidth < 1024) {
        setVisibleTestimonials(2);
      } else {
        setVisibleTestimonials(3);
      }
    };
    updateSlidesCount();
    window.addEventListener("resize", updateSlidesCount);
    return () => window.removeEventListener("resize", updateSlidesCount);
  }, []);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, DIPLOMAS.length - visibleSlides));
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => Math.min(prev + 1, TESTIMONIALS.length - visibleTestimonials));
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => Math.max(prev - 1, 0));
  };

  // Состояния для интерактивного Квиза
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedScores, setSelectedScores] = useState<string[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [finalRecommendation, setFinalRecommendation] = useState<string>("NUMEROLOGY");

  // Состояния для FAQ аккордеона
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Состояния для Lightbox сертификатов
  const [activeDiploma, setActiveDiploma] = useState<Diploma | null>(null);

  // Обработка клика по ответу в квизе
  const handleQuizAnswer = (score: string) => {
    const newScores = [...selectedScores, score];
    setSelectedScores(newScores);

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Подсчет наиболее частой рекомендации
      const counts: Record<string, number> = {};
      let maxScore = newScores[0];
      let maxCount = 0;

      newScores.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
        if (counts[s] > maxCount) {
          maxCount = counts[s];
          maxScore = s;
        }
      });

      setFinalRecommendation(maxScore);
      setQuizFinished(true);
    }
  };

  // Сброс квиза
  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedScores([]);
    setQuizFinished(false);
  };

  // Переключение FAQ
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className={styles.homeWrapper}>
      {/* Шапка сайта с корзиной */}
      <Header />

      {/* 1. HERO СЕКЦИЯ (Attention - Главный экран) */}
      <section className={styles.hero} id="hero">
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroGrid}>

            {/* Блок заголовка */}
            <div className={styles.heroTitleArea}>
              <h1 className={styles.heroTitle} id="main-title">
                Ольга Хавич, духовный целитель, таролог,<br />
                <span>нумеролог</span>
              </h1>
            </div>

            {/* Блок фотографии Ольги */}
            <div className={styles.heroImageArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/olga.webp"
                alt="Ольга Хавич, духовный целитель, таролог, нумеролог"
                className={styles.heroOlgaImage}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            </div>

            {/* Блок подзаголовка и кнопок (для десктопов он внутри Hero Grid) */}
            <div className={`${styles.heroBottomArea} ${styles.desktopOnly}`}>
              <p className={styles.heroSubtitle}>
                Помогаю клиентам справляться со многими жизненными проблемами в отношениях, финансах, бизнесе и других сферах.
              </p>

              <div className={styles.heroActions}>
                <a href="#quiz-block" className="btn btn-primary" id="hero-btn-quiz">
                  Подобрать метод решения
                </a>
                <Link href="/shop" className="btn btn-secondary" id="hero-btn-shop">
                  В магазин силы
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Блок подзаголовка и кнопок (для мобильных экранов вынесен под Hero-секцию) */}
      <div className={`${styles.heroBottomAreaMobile} ${styles.mobileOnly}`}>
        <div className="container">
          <p className={styles.heroSubtitleMobile}>
            Помогаю клиентам справляться со многими жизненными проблемами в отношениях, финансах, бизнесе и других сферах.
          </p>
          <div className={styles.heroActionsMobile}>
            <a href="#quiz-block" className="btn btn-primary" id="hero-btn-quiz-mobile">
              Подобрать метод решения
            </a>
            <Link href="/shop" className="btn btn-secondary" id="hero-btn-shop-mobile">
              В магазин силы
            </Link>
          </div>
        </div>
      </div>
      <section className={styles.problems} id="problems">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>С какими запросами ко мне приходят?</h2>
            <p>
              В жизни каждого наступает момент застоя или кризиса. Моя задача — найти глубинную
              причину блокировки и дать вам точные ключи для её устранения.
            </p>
          </div>

          <div className={styles.problemsGrid}>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.problemSvgIcon}>
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className={styles.problemCardContent}>
                <h4>Финансы и карьера</h4>
                <p>Уперлись в финансовый потолок? Бизнес буксует? Не понимаете, в какое русло направить силы для привлечения материального изобилия?</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.problemSvgIcon}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div className={styles.problemCardContent}>
                <h4>Личные отношения</h4>
                <p>Наступаете на одни и те же грабли с партнерами? Ощущаете одиночество и непонимание? Переживаете болезненный разрыв или семейный кризис?</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.problemSvgIcon}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className={styles.problemCardContent}>
                <h4>Энергия и здоровье</h4>
                <p>Чувствуете хроническую усталость, опустошение или апатию? Ощущаете, что все дороги закрыты и удача буквально отвернулась от вас?</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.problemSvgIcon}>
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div className={styles.problemCardContent}>
                <h4>Предназначение и дети</h4>
                <p>Не знаете, кто вы на самом деле и в чем ваша кармическая задача? Хотите понять таланты и особенности характера вашего ребенка?</p>
              </div>
            </div>
          </div>

          <div className={styles.problemsTransition}>
            «Каждая из этих проблем имеет четкую причину, скрытую в вашей дате рождения и энергоструктуре. Мы найдем её и трансформируем в ваш ресурс.»
          </div>
        </div>
      </section>

      {/* 3. БЛОК-ФИЛОСОФИЯ "СИСТЕМА ЧЕТЫРЕХ КЛЮЧЕЙ" (Interest - Почему это работает?) */}
      <section className={styles.keys} id="keys">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2 style={{ color: "#fff" }}>Система Четырех Ключей</h2>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Моя методика построена на интегральном подходе: от точной диагностики развилок вашей реальности
              и глубокого очищения воском до наполнения природной силой и детального расчета матрицы судьбы.
            </p>
          </div>

          <div className={styles.keysGrid}>
            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>01</div>
              </div>
              <h3 className={styles.keyStepTitle}>Диагностика (Таро)</h3>
              <p className={styles.keyStepDesc}>
                Сканируем текущие развилки вашей реальности. Видим скрытые мотивы людей,
                причины кризисов и помогаем сделать верный выбор прямо сейчас.
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>02</div>
              </div>
              <h3 className={styles.keyStepTitle}>Очищение (Отливки)</h3>
              <p className={styles.keyStepDesc}>
                Бережно убираем энергетические блокировки, сглазы, деструктивные программы
                и привязки из прошлых травмирующих отношений.
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>03</div>
              </div>
              <h3 className={styles.keyStepTitle}>Наполнение (Ладование)</h3>
              <p className={styles.keyStepDesc}>
                Заполняем очищенные каналы природной силой. Настраиваем ваше биополе
                на финансовую стабильность, здоровье и привлечение любви.
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>04</div>
              </div>
              <h3 className={styles.keyStepTitle}>Расчет (Нумерология)</h3>
              <p className={styles.keyStepDesc}>
                Составляем точную ментальную карту вашей жизни по дате рождения. Находим сильные стороны,
                предназначение и кармические задачи.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ПРОДУКТОВАЯ МАТРИЦА (Desire - Услуги и Направления практики) */}
      <section className={styles.services} id="services">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>Направления Помощи и Практик</h2>
            <p>
              Выберите подходящее направление для вашей личной трансформации. Вы можете заказать индивидуальную консультацию
              или полноценный энергетический обряд.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-tarot.webp" alt="Карты Таро" className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>Карты Таро</h3>
              <p>
                Точный анализ запутанных жизненных ситуаций и прогнозирование вероятностей. Расклады на
                партнерство, карьеру, причины финансовых кризисов и поиск правильного пути.
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=TAROT" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-tarot-btn">
                Сделать расклад (от 40 €)
              </Link>
            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-wax.webp" alt="Восковые отливки" className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>Восковые отливки</h3>
              <p>
                Диагностика и глубокое очищение энергетических центров (чакр). Снятие негатива,
                деструктивных программ и разрушение привязок из прошлых токсичных отношений.
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=WAX" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-wax-btn">
                Очистить поле (от 70 €)
              </Link>
            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-lading.webp" alt="Ладование биополя" className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>Ладование биополя</h3>
              <p>
                Практики наполнения чистой силой после очищений. Восстановление здоровья,
                настройка на финансовую стабильность, красоту и энергетическое «открытие дорог».
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=LADING" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-lading-btn">
                Наполниться силой (от 70 €)
              </Link>

            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-numerology.webp" alt="Нумерологический прогноз" className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>Нумерологический прогноз</h3>
              <p>
                Глубокий анализ вашей личности и судьбы по дате рождения. Расчет предназначения,
                финансовых каналов, совместимости в любви и прогнозирование ключевых периодов жизни.
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=NUMEROLOGY" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-matrix-btn">
                Выбрать расчет (от 70 €)
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* 5. ПРОДУКТЫ СИЛЫ: БРАСЛЕТЫ И КУРСЫ (Desire - Артефакты и Обучение) */}
      <section className={styles.productsPower} id="products-power">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>Инструменты Силы и Сакральные Знания</h2>
            <p>
              Поддерживайте свое ресурсное состояние с помощью индивидуальных амулетов или начните
              самостоятельное обучение нумерологии и таро.
            </p>
          </div>

          <div className={styles.productsPowerGrid}>
            {/* Блок Амулетов */}
            <div className={`${styles.powerCard} ${styles.powerCardNormal}`}>
              <div className={styles.powerBadge}>Артефакты силы</div>
              <h3 className={styles.powerTitle}>Индивидуальные амулетные браслеты</h3>
              <p className={styles.powerDesc}>
                Браслеты из натуральных минералов премиального качества. Каждый камень подбирается Ольгой вручную строго
                под вашу дату рождения и конкретный запрос (финансы, защита биополя, любовь и гармония). Все браслеты проходят обряд воскового ладования.
              </p>
              <div className={styles.powerList}>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> 100% натуральные камни
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> Индивидуальный расчет камней по вашей матрице
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> Обряд активации и зарядка силой мастера
                </div>
              </div>
              <Link href="/shop?category=PRODUCT" className="btn btn-secondary" style={{ marginTop: "auto" }}>
                Подобрать браслет (от 39 €)
              </Link>
            </div>

            {/* Блок Курсов */}
            <div className={`${styles.powerCard} ${styles.powerCardPremium}`}>
              <div className={styles.powerBadge}>Авторское обучение</div>
              <h3 className={styles.powerTitle}>Онлайн-курсы по нумерологии и таро</h3>
              <p className={styles.powerDesc}>
                Станьте хозяином своей судьбы или освойте новую престижную помогающую профессию. Понятные видеоуроки без воды,
                детальные PDF-методички и удобный личный кабинет ученика с бессрочным или временным доступом.
              </p>
              <div className={styles.powerList}>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> Видеоплеер Kinescope высокого качества без рекламы
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> Готовые методические пособия для расчетов
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> Личный кабинет для контроля сроков доступов
                </div>
              </div>
              <Link href="/shop?category=COURSE" className="btn btn-primary" style={{ marginTop: "auto" }}>
                Начать обучение (от 149 €)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ИНТЕРАКТИВНЫЙ КВИЗ-ТЕСТ "С ЧЕГО НАЧАТЬ?" (Вовлечение) */}
      <section className={styles.quiz} id="quiz-block">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>С чего начать ваше преображение?</h2>
            <p>
              Пройдите короткий интуитивный тест из 3 вопросов, чтобы определить, какой инструмент
              Ольги Хавич принесет вам максимальную пользу прямо сейчас.
            </p>
          </div>

          <div className={styles.quizCard}>
            {!quizFinished ? (
              <>
                <div className={styles.quizHeader}>
                  <div className={styles.quizProgressWrapper}>
                    <span>Вопрос {currentQuestionIndex + 1} из {QUIZ_QUESTIONS.length}</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
                  </div>
                  <div className={styles.quizProgressBar}>
                    <div
                      className={styles.quizProgress}
                      style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className={styles.quizContent}>
                  <div className={styles.quizQuestion}>
                    <h3>{QUIZ_QUESTIONS[currentQuestionIndex].question}</h3>
                    <div className={styles.quizOptions}>
                      {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, i) => (
                        <button
                          key={i}
                          className={styles.quizOption}
                          onClick={() => handleQuizAnswer(opt.score)}
                        >
                          <span>{opt.text}</span>
                          <span className={styles.quizOptionCheck}>✓</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.quizContent}>
                <div className={styles.quizResult}>
                  <div className={styles.quizResultIcon}>🔑</div>
                  <h3 className={styles.quizResultTitle}>Ваша персональная рекомендация:</h3>
                  <div className={styles.quizResultAction}>
                    <h4>{QUIZ_RESULTS[finalRecommendation].title}</h4>
                    <p>Рекомендуемый шаг для восстановления баланса и раскрытия потенциала</p>
                  </div>
                  <p className={styles.quizResultDesc}>
                    {QUIZ_RESULTS[finalRecommendation].desc}
                  </p>
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                    <Link href={QUIZ_RESULTS[finalRecommendation].link} className="btn btn-primary">
                      {QUIZ_RESULTS[finalRecommendation].btnText}
                    </Link>
                    <button className="btn btn-secondary" onClick={resetQuiz}>
                      Пройти заново
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. ОБ АВТОРЕ (Доверие / Authority) */}
      <section className={styles.about} id="about">
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutImageArea}>
              <div className={styles.aboutFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/olga2.webp"
                  alt="Ольга Хавич, нумеролог и ваш проводник в мир осознанности"
                  className={styles.aboutOlgaImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className={styles.aboutContent}>
              <h2>
                Ваш проводник в мир осознанности — <span>Ольга Хавич</span>
              </h2>

              <div className={styles.aboutText}>
                <p style={{ fontWeight: "600", fontSize: "17px", color: "var(--color-primary)", borderLeft: "3px solid var(--color-primary)", paddingLeft: "15px", fontStyle: "italic" }}>
                  «Моя цель — не просто дать вам предсказание будущего, а вручить точную числовую карту судьбы и энергетические инструменты, чтобы вы построили свое счастливое будущее сами.»
                </p>
                <p>
                  Уже более 10 лет я помогаю людям по всей Европе и СНГ выходить из глубоких кризисов,
                  находить свое предназначение, выстраивать гармоничные отношения в семье и пробивать финансовые потолки.
                </p>
                <p>
                  В своей практике я соединяю сухую математическую точность расчетов числовых матриц с глубоким чувствованием тонкого плана через восковое ладование и расклады карт Таро, в содействии с моими  Духовными Наставниками.
                </p>
              </div>

              {/* Сетка качеств */}
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h4>10+ лет опыта</h4>
                    <p>Проверенные временем и тысячами клиентов практики нумерологии и тарологии.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h4>Индивидуальный расчет</h4>
                    <p>Каждый амулет создается Ольгой под дату рождения конкретного человека.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h4>Энергетическая зарядка</h4>
                    <p>Все изделия проходят обряд мягкого воскового ладования силой мастера.</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h4>Удобный ЛК ученика</h4>
                    <p>Собственная современная IT-платформа для качественного обучения.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ДИПЛОМЫ И СЕРТИФИКАТЫ */}
      <section className={styles.certificates} id="skills">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>Дипломы и Сертификаты</h2>
            <p>
              Подтвержденная квалификация и академический подход к эзотерическим дисциплинам.
              Ольга обучалась у ведущих мастеров России и зарубежья.
            </p>
          </div>

          <div className={styles.sliderContainer}>
            {/* Стрелка Влево */}
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className={`${styles.sliderArrow} ${styles.sliderArrowLeft} ${currentSlideIndex === 0 ? styles.sliderArrowDisabled : ""}`}
              aria-label="Предыдущий сертификат"
            >
              ‹
            </button>

            {/* Видимая область слайдера */}
            <div className={styles.sliderViewport}>
              <div
                className={styles.sliderTrack}
                style={{
                  transform: `translateX(-${currentSlideIndex * (100 / visibleSlides)}%)`,
                }}
              >
                {DIPLOMAS.map((dip) => (
                  <div
                    key={dip.id}
                    className={styles.sliderSlide}
                    style={{ width: `${100 / visibleSlides}%` }}
                  >
                    <div
                      className={styles.diplomaCard}
                      onClick={() => setActiveDiploma(dip)}
                    >
                      <div className={styles.diplomaImageContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dip.image}
                          alt={dip.title}
                          className={styles.diplomaImg}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className={styles.diplomaOverlay}>
                          <span style={{ fontSize: "24px" }}>🔍</span>
                          <span style={{ fontSize: "11px", color: "#fff", fontWeight: 600, marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Увеличить
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Стрелка Вправо */}
            <button
              onClick={nextSlide}
              disabled={currentSlideIndex >= DIPLOMAS.length - visibleSlides}
              className={`${styles.sliderArrow} ${styles.sliderArrowRight} ${currentSlideIndex >= DIPLOMAS.length - visibleSlides ? styles.sliderArrowDisabled : ""}`}
              aria-label="Следующий сертификат"
            >
              ›
            </button>
          </div>

          {/* Пагинация (индикаторы) */}
          <div className={styles.sliderPagination}>
            {Array.from({ length: Math.max(0, DIPLOMAS.length - visibleSlides + 1) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`${styles.sliderDot} ${currentSlideIndex === idx ? styles.sliderDotActive : ""}`}
                aria-label={`Перейти к слайду ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. РЕАЛЬНЫЕ КЕЙСЫ И ОТЗЫВЫ (Доверие / Social Proof) */}
      <section className={styles.testimonials} id="testimonials">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>Истории Реальных Трансформаций</h2>
            <p>
              Как изменилась жизнь людей после глубоких консультаций Ольги Хавич,
              восковых очищений или индивидуального подбора амулета.
            </p>
          </div>

          <div className={styles.testimonialsSliderContainer}>
            {/* Стрелка Влево */}
            <button
              onClick={prevTestimonial}
              disabled={currentTestimonialIndex === 0}
              className={`${styles.testimonialsSliderArrow} ${styles.testimonialsSliderArrowLeft} ${currentTestimonialIndex === 0 ? styles.testimonialsSliderArrowDisabled : ""}`}
              aria-label="Предыдущий отзыв"
            >
              ‹
            </button>

            {/* Видимая область слайдера */}
            <div className={styles.testimonialsSliderViewport}>
              <div
                className={styles.testimonialsSliderTrack}
                style={{
                  transform: `translateX(-${currentTestimonialIndex * (100 / visibleTestimonials)}%)`,
                }}
              >
                {TESTIMONIALS.map((test) => (
                  <div
                    key={test.id}
                    className={styles.testimonialsSliderSlide}
                    style={{ width: `${100 / visibleTestimonials}%` }}
                  >
                    <article className={styles.testimonialCard}>
                      <div className={styles.quoteIcon}>
                        <svg width="45" height="45" fill="currentColor" viewBox="0 0 24 24" opacity="0.1">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                      <p className={styles.testimonialText}>
                        «{test.text}»
                      </p>
                      <div className={styles.clientMeta}>
                        <div className={styles.avatar}>{test.avatar}</div>
                        <div className={styles.clientInfo}>
                          <h4>{test.author}</h4>
                          <p>{test.role}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            {/* Стрелка Вправо */}
            <button
              onClick={nextTestimonial}
              disabled={currentTestimonialIndex >= TESTIMONIALS.length - visibleTestimonials}
              className={`${styles.testimonialsSliderArrow} ${styles.testimonialsSliderArrowRight} ${currentTestimonialIndex >= TESTIMONIALS.length - visibleTestimonials ? styles.testimonialsSliderArrowDisabled : ""}`}
              aria-label="Следующий отзыв"
            >
              ›
            </button>
          </div>

          {/* Пагинация (индикаторы) */}
          <div className={styles.testimonialsSliderPagination}>
            {Array.from({ length: Math.max(0, TESTIMONIALS.length - visibleTestimonials + 1) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonialIndex(idx)}
                className={`${styles.testimonialsSliderDot} ${currentTestimonialIndex === idx ? styles.testimonialsSliderDotActive : ""}`}
                aria-label={`Перейти к отзыву ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ - ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ (Закрытие возражений) */}
      <section className={styles.faq} id="faq-section">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>Часто Задаваемые Вопросы</h2>
            <p>
              Ответы на ключевые вопросы о методах работы Ольги Хавич, доставке амулетов
              и процессе обучения.
            </p>
          </div>

          <div className={styles.faqGrid}>
            <div className={`${styles.faqItem} ${openFaqIndex === 0 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(0)}>
                <span>Как проходят онлайн-консультации и сколько они длятся?</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  Индивидуальные консультации по нумерологии или Таро проходят в онлайн-формате (через Zoom, WhatsApp или Telegram)
                  и длятся от 30 минут до часа, но не больше. Возможен аудиоформат. Ольга детально разбирает ваш запрос, дает пошаговые рекомендации и отвечает на ваши вопросы.
                  Запись консультации и все методические материалы для расчетов остаются у вас навсегда.
                </p>
              </div>
            </div>

            <div className={`${styles.faqItem} ${openFaqIndex === 1 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(1)}>
                <span>Нужно ли мое личное присутствие при восковых отливках или ладовании?</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  Нет, ваше физическое присутствие на обряде не требуется. Ольга работает бесконтактно, используя вашу фотографию,
                  полное имя и точную дату рождения. Это проверенная веками методика дистанционной энерготерапии. По завершении обряда
                  вы получаете подробнейший аудиоотчет от Ольги с расшифровкой отливок и рекомендациями.
                </p>
              </div>
            </div>

            <div className={`${styles.faqItem} ${openFaqIndex === 2 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(2)}>
                <span>Как рассчитывается и создается индивидуальный амулетный браслет?</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  Сначала Ольга рассчитывает вашу числовую матрицу по дате рождения и определяет камни-покровители, соответствующие вашему запросу.
                  Затем подбираются натуральные минералы премиум-класса (аметист, лазурит, тигровый глаз, гранат и др.). В завершение
                  Ольга проводит обряд воскового ладования изделия, чтобы активировать его защитные и ресурсные свойства лично под вас.
                </p>
              </div>
            </div>

            <div className={`${styles.faqItem} ${openFaqIndex === 3 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(3)}>
                <span>Как быстро я получу доступ к курсам после подтверждения заказа?</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  Доступ предоставляется моментально. Сразу после оплаты и подтверждения заказа вы сможете авторизоваться в личном кабинете
                  ученика на сайте. Там автоматически появится ваш видеокурс с уроками (через быстрый плеер Kinescope) и PDF-методичками.
                  Ольга настраивает гибкий срок действия доступа в соответствии с тарифом.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ФИНАЛЬНЫЙ CTA (Action - Запись / Консультация) */}
      <footer className={styles.footer}>
        <div className="container" style={{ marginBottom: "60px", textAlign: "center" }}>
          <div className={styles.centerHeader} style={{ marginBottom: "30px" }}>
            <h2 style={{ color: "#fff" }}>Не знаете, с чего начать?</h2>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Напишите Ольге Хавич напрямую в мессенджерах. Кратко опишите вашу жизненную ситуацию,
              и она подскажет, какой инструмент (расчет, очищение или амулет) поможет вам быстрее всего.
            </p>
          </div>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/4917630761368"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px" }}
            >
              <span>Связаться в WhatsApp</span>
            </a>
            <a
              href="https://t.me/Bluesky_blue_blue"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px", borderColor: "rgba(255,255,255,0.2)" }}
            >
              <span>Связаться в Telegram</span>
            </a>
          </div>
        </div>

        <div className={`container ${styles.footerGrid}`}>
          {/* Колонка 1: Логотип */}
          <div className={styles.footerLogo}>
            <h3>OLGA KHAVYCH</h3>
            <p>
              Интегральный анализ личности, энергопрактики воскового очищения и ладования для раскрытия
              вашего природного потенциала и гармонии в жизни.
            </p>
          </div>

          {/* Колонка 2: Контакты */}
          <div className={styles.footerContacts}>
            <h4>Контакты для связи</h4>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span>info@khavych.com</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <span>+49 176 30761368 (Германия)</span>
            </div>
            <a href="https://instagram.com/numerologin.khavych" target="_blank" rel="noopener noreferrer" className={styles.contactItem} style={{ textDecoration: "none", color: "inherit" }}>
              <span className={styles.contactIcon}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </span>
              <span>@numerologin.khavych</span>
            </a>
            <a href="https://tiktok.com/@magja_moja" target="_blank" rel="noopener noreferrer" className={styles.contactItem} style={{ textDecoration: "none", color: "inherit" }}>
              <span className={styles.contactIcon}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.19 1.11 1.23 2.69 1.98 4.33 2.19v3.9c-1.39-.06-2.75-.54-3.89-1.37-.73-.55-1.33-1.26-1.78-2.07v7.57c.01 2.2-.76 4.38-2.19 6.02-1.52 1.77-3.77 2.85-6.11 2.99-2.52.12-5.08-.75-6.84-2.56-1.85-1.92-2.72-4.63-2.39-7.29.35-2.77 2.05-5.28 4.62-6.42 1.72-.75 3.65-.92 5.48-.48v4.03c-1.04-.36-2.2-.28-3.17.26-.97.55-1.68 1.54-1.94 2.63-.33 1.34-.03 2.8.82 3.88.88 1.1 2.27 1.71 3.68 1.63 1.4-.04 2.7-.82 3.42-2.02.48-.82.68-1.78.65-2.73V.02h-.03z" />
                </svg>
              </span>
              <span>@magja_moja</span>
            </a>
          </div>
        </div>

        {/* Копирайты */}
        <div className={`container ${styles.footerBottom}`}>
          <p>© 2026 Ольга Хавич. Все права защищены.</p>
          <p>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>
              Вход для учеников и администратора
            </Link>
          </p>
        </div>
      </footer>

      {/* МОДАЛЬНОЕ ОКНО LIGHTBOX ДЛЯ СЕРТИФИКАТОВ */}
      {activeDiploma && (
        <div
          className={`${styles.lightbox} ${styles.lightboxActive}`}
          onClick={() => setActiveDiploma(null)}
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.lightboxClose}
              onClick={() => setActiveDiploma(null)}
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeDiploma.image}
              alt={activeDiploma.title}
              className={styles.lightboxImage}
              decoding="async"
            />
          </div>
        </div>
      )}
    </div>
  );
}
