"use client";

import React, { useState } from "react";
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
  { id: 1, title: "Диплом Нумеролога", subtitle: "Профессиональный числовой анализ матрицы судьбы и предназначения", image: "/sertificate1.jpg" },
  { id: 2, title: "Магистр Тарологии", subtitle: "Прогнозирование на Старших и Младших Арканах, анализ ситуации", image: "/sertificate2.jpg" },
  { id: 3, title: "Энергопрактик & Ладование", subtitle: "Глубокое очищение энергоканалов, восковые отливки биополя", image: "/sertificate3.jpg" },
  { id: 4, title: "Чакроанализ", subtitle: "Диагностика чакровой системы человека по дате рождения", image: "/sertificate4.jpg" },
  { id: 5, title: "Коррекция Судьбы", subtitle: "Методология числовых кодов и перенаправление жизненных путей", image: "/sertificate5.jpg" },
  { id: 6, title: "Рунические Практики", subtitle: "Сакральные знаки, защитные ставы и диагностика энергетики", image: "/sertificate6.jpg" },
  { id: 7, title: "Амулетная Нумерология", subtitle: "Создание индивидуальных минеральных браслетов по формуле рождения", image: "/sertificate7.jpg" },
  { id: 8, title: "Психологическое консультирование", subtitle: "Методы гештальт-терапии и когнитивной коррекции в эзотерике", image: "/sertificate8.jpg" },
  { id: 9, title: "Практическая Нумерология", subtitle: "Магистр числовых прогнозов, расчет финансового и любовного каналов", image: "/sertificate9.jpg" },
  { id: 10, title: "Энергетическая Чистка", subtitle: "Мастер бесконтактного ладования, снятие деструктивных блоков", image: "/sertificate10.jpg" },
  { id: 11, title: "Кармическая Коррекция", subtitle: "Определение и развязывание кармических узлов прошлых воплощений", image: "/sertificate11.jpg" }
];

export default function Home() {
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
                Ольга Хавич, <br />
                <span>нумеролог</span>
              </h1>
            </div>

            {/* Блок фотографии Ольги */}
            <div className={styles.heroImageArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/olga.png"
                alt="Ольга Хавич, нумеролог"
                className={styles.heroOlgaImage}
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
              <div className={styles.problemIcon}>💼</div>
              <div className={styles.problemCardContent}>
                <h4>Финансы и карьера</h4>
                <p>Уперлись в финансовый потолок? Бизнес буксует? Не понимаете, в какое русло направить силы для привлечения материального изобилия?</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>❤️</div>
              <div className={styles.problemCardContent}>
                <h4>Личные отношения</h4>
                <p>Наступаете на одни и те же грабли с партнерами? Ощущаете одиночество и непонимание? Переживаете болезненный разрыв или семейный кризис?</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>⚡</div>
              <div className={styles.problemCardContent}>
                <h4>Энергия и здоровье</h4>
                <p>Чувствуете хроническую усталость, опустошение или апатию? Ощущаете, что все дороги закрыты и удача буквально отвернулась от вас?</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>🧩</div>
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
              Моя методика построена на интегральном подходе: от точного математического расчета
              вашей матрицы судьбы до физического очищения биополя воском и наполнения силой.
            </p>
          </div>

          <div className={styles.keysGrid}>
            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>01</div>
                <div className={styles.keyIcon}>🔢</div>
              </div>
              <h3 className={styles.keyStepTitle}>Расчет (Нумерология)</h3>
              <p className={styles.keyStepDesc}>
                Составляем точную ментальную карту вашей жизни по дате рождения. Находим сильные стороны,
                предназначение и кармические задачи.
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>02</div>
                <div className={styles.keyIcon}>🃏</div>
              </div>
              <h3 className={styles.keyStepTitle}>Диагностика (Таро)</h3>
              <p className={styles.keyStepDesc}>
                Сканируем текущие развилки вашей реальности. Видим скрытые мотивы людей,
                причины кризисов и помогаем сделать верный выбор прямо сейчас.
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>03</div>
                <div className={styles.keyIcon}>🕯️</div>
              </div>
              <h3 className={styles.keyStepTitle}>Очищение (Отливки)</h3>
              <p className={styles.keyStepDesc}>
                Бережно убираем энергетические блокировки, сглазы, деструктивные программы
                и привязки из прошлых травмирующих отношений.
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>04</div>
                <div className={styles.keyIcon}>☀️</div>
              </div>
              <h3 className={styles.keyStepTitle}>Наполнение (Ладование)</h3>
              <p className={styles.keyStepDesc}>
                Заполняем очищенные каналы природной силой. Настраиваем ваше биополе
                на финансовую стабильность, здоровье и привлечение любви.
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
              <div className={styles.serviceIcon}>🔢</div>
              <h3>Нумерологический прогноз</h3>
              <p>
                Глубокий анализ вашей личности и судьбы по дате рождения. Расчет предназначения,
                финансовых каналов, совместимости в любви и прогнозирование ключевых периодов жизни.
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=NUMEROLOGY" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-matrix-btn">
                Выбрать расчет (от 70 €)
              </Link>
            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🃏</div>
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
              <div className={styles.serviceIcon}>🕯️</div>
              <h3>Восковые отливки</h3>
              <p>
                Диагностика и глубокое очищение энергетических центров (чакр). Снятие негатива,
                деструктивных программ и разрушение привязок из прошлых токсичных отношений.
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=WAX" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-wax-btn">
                Очистить поле (от 55 €)
              </Link>
            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceIcon}>☀️</div>
              <h3>Ладование биополя</h3>
              <p>
                Практики наполнения чистой силой после очищений. Восстановление здоровья,
                настройка на финансовую стабильность, красоту и энергетическое «открытие дорог».
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=LADING" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-lading-btn">
                Наполниться силой (от 35 €)
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
                  src="/olga2.jpg"
                  alt="Ольга Хавич, нумеролог и ваш проводник в мир осознанности"
                  className={styles.aboutOlgaImage}
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
                  В своей практике я соединяю сухую математическую точность расчетов числовых матриц с глубоким чувствованием тонкого плана через восковое ладование и расклады карт Таро.
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

          <div className={styles.diplomasGrid}>
            {DIPLOMAS.map((dip) => (
              <div
                key={dip.id}
                className={styles.diplomaCard}
                onClick={() => setActiveDiploma(dip)}
              >
                <div className={styles.diplomaImageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dip.image}
                    alt={dip.title}
                    className={styles.diplomaImg}
                  />
                  <div className={styles.diplomaOverlay}>
                    <span style={{ fontSize: "24px" }}>🔍</span>
                    <span style={{ fontSize: "11px", color: "#fff", fontWeight: 600, marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Увеличить
                    </span>
                  </div>
                </div>
                <div className={styles.diplomaMeta}>
                  <h4 className={styles.diplomaTitle}>{dip.title}</h4>
                  <p className={styles.diplomaSubtitle}>{dip.subtitle}</p>
                </div>
              </div>
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

          <div className={styles.testimonialsGrid}>
            <article className={styles.testimonialCard}>
              <div className={styles.quoteIcon}>
                <svg width="45" height="45" fill="currentColor" viewBox="0 0 24 24" opacity="0.1">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className={styles.testimonialText}>
                «Заказывала браслет "Финансовый поток". Ольга рассчитала его специально под мою матрицу.
                Удивительно, но уже через две недели мне предложили долгожданное повышение и вернули давний
                долг! Сам браслет выглядит очень изящно и статусно.»
              </p>
              <div className={styles.caseState}>
                <div className={styles.caseStateItem}>
                  <strong>Было (Запрос):</strong> Застой в финансах в Германии, долги, непонимание вектора развития.
                </div>
                <div className={styles.caseStateItem}>
                  <strong>Результат:</strong> Рост дохода до 4200 € в месяц, закрытие кредитов за 4 месяца работы с Ольгой.
                </div>
              </div>
              <div className={styles.clientMeta} style={{ marginTop: "20px" }}>
                <div className={styles.avatar}>ЮК</div>
                <div className={styles.clientInfo}>
                  <h4>Юлия Краузе</h4>
                  <p>Предприниматель (Мюнхен)</p>
                </div>
              </div>
            </article>

            <article className={styles.testimonialCard}>
              <div className={styles.quoteIcon}>
                <svg width="45" height="45" fill="currentColor" viewBox="0 0 24 24" opacity="0.1">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className={styles.testimonialText}>
                «Консультация по матрице судьбы буквально открыла мне глаза. Я наконец поняла, почему
                сталкивалась с одними и теми же граблями в отношениях. Ольга дала очень четкие, жизненные
                рекомендации без всякой воды. Огромная благодарность!»
              </p>
              <div className={styles.caseState}>
                <div className={styles.caseStateItem}>
                  <strong>Было (Запрос):</strong> Повторяющиеся токсичные сценарии в браке, хроническая усталость.
                </div>
                <div className={styles.caseStateItem}>
                  <strong>Результат:</strong> Осознание кармических задач, выход из деструктивных связей, внутренний покой.
                </div>
              </div>
              <div className={styles.clientMeta} style={{ marginTop: "20px" }}>
                <div className={styles.avatar}>МС</div>
                <div className={styles.clientInfo}>
                  <h4>Марина Смирнова</h4>
                  <p>Маркетолог (Штутгарт)</p>
                </div>
              </div>
            </article>

            <article className={styles.testimonialCard}>
              <div className={styles.quoteIcon}>
                <svg width="45" height="45" fill="currentColor" viewBox="0 0 24 24" opacity="0.1">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className={styles.testimonialText}>
                «Прошел курс "Практическая нумерология". Очень удобный формат: личный кабинет работает
                шустро, плеер Kinescope отличный, методички информативные. Доступы Ольга выдала сразу
                после подтверждения заказа. Рекомендую всем, кто хочет разобраться глубоко.»
              </p>
              <div className={styles.caseState}>
                <div className={styles.caseStateItem}>
                  <strong>Было (Запрос):</strong> Непонимание талантов ребенка, частые ссоры с сыном-подростком.
                </div>
                <div className={styles.caseStateItem}>
                  <strong>Результат:</strong> Составлена детская матрица, поняли характер сына, отдали в робототехнику, дома мир.
                </div>
              </div>
              <div className={styles.clientMeta} style={{ marginTop: "20px" }}>
                <div className={styles.avatar}>ДВ</div>
                <div className={styles.clientInfo}>
                  <h4>Дмитрий Волков</h4>
                  <p>Практикующий психолог (Берлин)</p>
                </div>
              </div>
            </article>
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
                  и длятся от 1.5 до 2 часов. Ольга детально разбирает ваш запрос, дает пошаговые рекомендации и отвечает на ваши вопросы.
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
              href="https://wa.me/79991234567"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px" }}
            >
              <span>💬 Связаться в WhatsApp</span>
            </a>
            <a
              href="https://t.me/olga_khavych"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px", borderColor: "rgba(255,255,255,0.2)" }}
            >
              <span>✈ Задать вопрос в Telegram</span>
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

          {/* Колонка 2: Навигация */}
          <div className={styles.footerLinks}>
            <h4>Навигация</h4>
            <div className={styles.linksList}>
              <a href="#hero">Главная</a>
              <a href="#problems">Запросы</a>
              <a href="#keys">4 Ключа</a>
              <a href="#services">Услуги</a>
              <Link href="/shop">Магазин</Link>
            </div>
          </div>

          {/* Колонка 3: Контакты */}
          <div className={styles.footerContacts}>
            <h4>Контакты для связи</h4>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>✉</span>
              <span>info@khavych.com</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📞</span>
              <span>+49 176 12345678 (Германия)</span>
            </div>

            {/* Соцсети */}
            <div className={styles.socials}>
              <a href="https://t.me/olga_khavych" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Telegram Ольги">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.26-1.43-.4-1.37-.85.03-.23.35-.47.96-.72 3.76-1.63 6.27-2.71 7.54-3.21 3.59-1.42 4.33-1.67 4.82-1.68.11 0 .35.03.5.16.13.12.17.29.18.41-.01.07.01.12.01.2z" />
                </svg>
              </a>
              <a href="https://wa.me/79991234567" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="WhatsApp Ольги">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 12.01.953c-5.44 0-9.866 4.372-9.87 9.802-.001 1.77.475 3.497 1.38 5.041L2.593 21.17l5.054-1.31-.001-.002z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Копирайты */}
        <div className={`container ${styles.footerBottom}`}>
          <p>© 2026 Ольга Хавич. Все права защищены. Разработка на Next.js & PostgreSQL.</p>
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
            />
            <div className={styles.lightboxMeta}>
              <h3>{activeDiploma.title}</h3>
              <p>{activeDiploma.subtitle}</p>
              <div style={{ marginTop: "12px", border: "1px dashed var(--color-accent)", padding: "6px 16px", fontSize: "10px", color: "var(--color-accent)", display: "inline-block", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>
                Официальный документ мастера
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
