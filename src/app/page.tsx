"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "src/components/Header";
import { useLanguage } from "src/context/LanguageContext";
import styles from "./home.module.css";

// Типы для вопросов квиза
interface QuizQuestion {
  id: number;
  question: { ru: string; de: string };
  options: {
    text: { ru: string; de: string };
    score: string; // Рекомендуемая категория/субкатегория
  }[];
}

// Данные вопросов квиза
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: {
      ru: "Какая сфера вашей жизни сейчас требует наибольшего внимания и трансформации?",
      de: "Welcher Bereich Ihres Lebens erfordert derzeit die meiste Aufmerksamkeit?"
    },
    options: [
      { text: { ru: "Финансы и карьера (финансовый потолок, долги, выбор дела)", de: "Finanzen und Karriere (finanzielle Grenzen, Bestimmung)" }, score: "NUMEROLOGY" },
      { text: { ru: "Личные отношения и семья (поиск любви, ссоры, детские проблемы)", de: "Beziehungen und Familie (Liebe finden, Harmonisierung)" }, score: "TAROT" },
      { text: { ru: "Внутреннее состояние (усталость, апатия, нехватка жизненных сил)", de: "Innerer Zustand (Müdigkeit, Apathie, Blockaden)" }, score: "WAX" },
      { text: { ru: "Поиск предназначения, скрытых талантов и вектора развития", de: "Suche nach Bestimmung und verborgenen Talenten" }, score: "NUMEROLOGY" }
    ]
  },
  {
    id: 2,
    question: {
      ru: "Чувствуете ли вы нехватку энергии или ощущение, что ваши дороги к успеху \"закрыты\"?",
      de: "Spüren Sie Energiemangel oder Stillstand in Ihren Angelegenheiten?"
    },
    options: [
      { text: { ru: "Да, ощущаю постоянный упадок сил, апатию или застой в делах", de: "Ja, ich spüre ständigen Energiemangel oder Stillstand" }, score: "WAX" },
      { text: { ru: "Иногда чувствую усталость, но в целом справляюсь", de: "Manchmal fühle ich mich müde, aber ich komme zurecht" }, score: "LADING" },
      { text: { ru: "Нет, с энергией все хорошо, нужен только точный расчет и совет", de: "Nein, mit der Energie ist alles bestens, ich brauche nur Rat" }, score: "NUMEROLOGY" }
    ]
  },
  {
    id: 3,
    question: {
      ru: "Какому методу работы вы интуитивно доверяете больше всего?",
      de: "Welcher Arbeitsmethode vertrauen Sie intuitiv am meisten?"
    },
    options: [
      { text: { ru: "Точным расчетам по дате рождения (цифры, матрицы судеб)", de: "Genaue Berechnungen nach Geburtsdatum (Matrix des Schicksals)" }, score: "NUMEROLOGY" },
      { text: { ru: "Интуитивным подсказкам, символам и раскладам (карты Таро)", de: "Intuitive Hinweise und Symbole (Tarot-Karten)" }, score: "TAROT" },
      { text: { ru: "Энергетическому очищению воском и огнем (устранение блоков)", de: "Energetische Reinigung mit Wachs und Feuer (Wachsguss)" }, score: "WAX" },
      { text: { ru: "Мягкому наполнению силой и открытию путей (Ладование)", de: "Sanfte Energieübertragung und Wegeöffnung (Ladowanie)" }, score: "LADING" }
    ]
  }
];

// Рекомендации по результатам квиза
const QUIZ_RESULTS: Record<string, { title: { ru: string; de: string }; desc: { ru: string; de: string }; link: string; btnText: { ru: string; de: string } }> = {
  NUMEROLOGY: {
    title: {
      ru: "Нумерологический анализ личности и предназначения",
      de: "Numerologische Persönlichkeits- und Potenzialanalyse"
    },
    desc: {
      ru: "Ваши ответы показывают, что сейчас для вас важнее всего получить четкую ментальную карту жизни. Ольга рассчитает вашу индивидуальную Матрицу Судьбы, выявит скрытые таланты, финансовые каналы и укажет точный вектор реализации.",
      de: "Ihre Antworten zeigen, dass es für Sie jetzt am wichtigsten ist, eine klare Lebenskarte zu erhalten. Olga berechnet Ihre individuelle Schicksalsmatrix, identifiziert verborgene Talente, Finanzkanäle und zeigt den genauen Vektor der Selbstverwirklichung."
    },
    link: "/shop?category=CONSULTATION&subCategory=NUMEROLOGY",
    btnText: {
      ru: "Выбрать нумерологический расчет",
      de: "Numerologische Analyse wählen"
    }
  },
  TAROT: {
    title: {
      ru: "Диагностический расклад на картах Таро",
      de: "Diagnostische Tarot-Sitzung"
    },
    desc: {
      ru: "Вам необходим точный и честный срез текущих событий. Расклад Таро покажет скрытые мотивы окружающих, истинные причины застоя в отношениях или бизнесе, а также подсветит наиболее удачные развилки выбора.",
      de: "Sie benötigen eine präzise und ehrliche Bestandsaufnahme der aktuellen Ereignisse. Die Tarot-Sitzung zeigt verborgene Motive anderer, die wahren Ursachen für Stillstand in Beziehungen oder im Geschäft und hebt die besten Entscheidungswege hervor."
    },
    link: "/shop?category=CONSULTATION&subCategory=TAROT",
    btnText: {
      ru: "Выбрать расклад Таро",
      de: "Tarot-Sitzung wählen"
    }
  },
  WAX: {
    title: {
      ru: "Глубокая восковая отливка (очищение чакр)",
      de: "Tiefe Wachsreinigung (Chakrenreinigung)"
    },
    desc: {
      ru: "Похоже, вы накопили значительный груз энергетической усталости или чужеродного негатива. Мягкие восковые отливки Ольги Хавич помогут бережно снять деструктивные программы, очистить чакры и восстановить здоровое биополе.",
      de: "Es scheint, als hätten Sie eine erhebliche Last an energetischer Müdigkeit oder negativem Einfluss angesammelt. Olgas sanfte Wachsgüsse helfen dabei, destruktive Programme behutsam zu entfernen, die Chakren zu reinigen und ein gesundes Biofeld wiederherzustellen."
    },
    link: "/shop?category=CONSULTATION&subCategory=WAX",
    btnText: {
      ru: "Пройти очищение воском",
      de: "Wachsreinigung wählen"
    }
  },
  LADING: {
    title: {
      ru: "Энергетическое Ладование (открытие дорог)",
      de: "Energetisches Ladowanie (Wegeöffnung)"
    },
    desc: {
      ru: "Вы готовы к наполнению и активным действиям, но вам нужен мягкий импульс сил. Ладование Ольги Хавич настроит ваше поле на финансовую стабильность, здоровье и привлечение ресурсных событий в жизнь.",
      de: "Sie sind bereit für Füllung und aktives Handeln, benötigen aber einen sanften Kraftimpuls. Olgas Ladowanie stimmt Ihr Feld auf finanzielle Stabilität, Gesundheit und das Anziehen positiver Lebensereignisse ein."
    },
    link: "/shop?category=CONSULTATION&subCategory=LADING",
    btnText: {
      ru: "Заказать ладование",
      de: "Ladowanie wählen"
    }
  }
};

interface Diploma {
  id: number;
  title: { ru: string; de: string };
  subtitle: { ru: string; de: string };
  image: string;
  width: number;
  height: number;
}

const DIPLOMAS: Diploma[] = [
  { id: 1, title: { ru: "Диплом Нумеролога", de: "Diplom für Numerologie" }, subtitle: { ru: "Профессиональный числовой анализ матрицы судьбы и предназначения", de: "Professionelle numerologische Analyse der Schicksalsmatrix" }, image: "/sertificate1.webp", width: 2560, height: 1597 },
  { id: 2, title: { ru: "Магистр Тарологии", de: "Magister der Tarot-Wissenschaft" }, subtitle: { ru: "Прогнозирование на Старших и Младших Арканах, анализ ситуации", de: "Prognostik auf Großen und Kleinen Arkana, Situationsanalyse" }, image: "/sertificate2.webp", width: 2560, height: 1597 },
  { id: 3, title: { ru: "Энергопрактик & Ладование", de: "Energiepraktik & Ladowanie" }, subtitle: { ru: "Глубокое очищение энергоканалов, восковые отливки биополя", de: "Tiefe Reinigung der Energiekanäle, Wachsguss des Biofelds" }, image: "/sertificate3.webp", width: 2560, height: 1597 },
  { id: 4, title: { ru: "Чакроанализ", de: "Chakren-Analyse" }, subtitle: { ru: "Диагностика чакровой системы человека по дате рождения", de: "Diagnostik des Chakrensystems eines Menschen nach Geburtsdatum" }, image: "/sertificate4.webp", width: 2560, height: 1597 },
  { id: 5, title: { ru: "Коррекция Судьбы", de: "Schicksalskorrektur" }, subtitle: { ru: "Методология числовых кодов и перенаправление жизненных путей", de: "Methodik von Zahlencodes und Neuausrichtung von Lebenswegen" }, image: "/sertificate5.webp", width: 2560, height: 1597 },
  { id: 6, title: { ru: "Рунические Практики", de: "Runen-Praktiken" }, subtitle: { ru: "Сакральные знаки, защитные ставы и диагностика энергетики", de: "Sakrale Zeichen, Schutzformeln und Energiediagnostik" }, image: "/sertificate6.webp", width: 1056, height: 816 },
  { id: 7, title: { ru: "Амулетная Нумерология", de: "Amulett-Numerologie" }, subtitle: { ru: "Создание индивидуальных минеральных браслетов по формуле рождения", de: "Erstellung individueller Mineralarmbänder nach der Geburtsformel" }, image: "/sertificate7.webp", width: 2560, height: 1597 },
  { id: 8, title: { ru: "Психологическое консультирование", de: "Psychologische Beratung" }, subtitle: { ru: "Методы гештальт-терапии и когнитивной коррекции в эзотерике", de: "Methoden der Gestalttherapie und kognitiven Korrektur in der Esoterik" }, image: "/sertificate8.webp", width: 2560, height: 1597 },
  { id: 9, title: { ru: "Практическая Нумерология", de: "Praktische Numerologie" }, subtitle: { ru: "Магистр числовых прогнозов, расчет финансового и любовного каналов", de: "Magister für Zahlenprognosen, Berechnung von Finanz- und Liebeskanälen" }, image: "/sertificate9.webp", width: 1280, height: 1280 },
  { id: 10, title: { ru: "Энергетическая Чистка", de: "Energetische Reinigung" }, subtitle: { ru: "Мастер бесконтактного ладования, снятие деструктивных блоков", de: "Meister des berührungslosen Ladowanie, Entfernung destruktiver Blockaden" }, image: "/sertificate10.webp", width: 2560, height: 1597 },
  { id: 11, title: { ru: "Кармическая Коррекция", de: "Karmische Korrektur" }, subtitle: { ru: "Определение и развязывание кармических узлов прошлых воплощений", de: "Bestimmung und Auflösung karmischer Knoten aus früheren Inkarnationen" }, image: "/sertificate11.webp", width: 2560, height: 1597 },
  { id: 12, title: { ru: "Осознанное Менторство", de: "Achtsames Mentoring" }, subtitle: { ru: "Помощь в раскрытии внутреннего потенциала и духовного баланса", de: "Hilfe bei der Entfaltung des inneren Potenzials und der spirituellen Balance" }, image: "/sertificate12.webp", width: 2048, height: 2048 },
  { id: 13, title: { ru: "Матрица Изобилия", de: "Matrix der Fülle" }, subtitle: { ru: "Индивидуальный расчет финансовых ключей и карьерных векторов", de: "Individuelle Berechnung von Finanzschlüsseln und Karrierevektoren" }, image: "/sertificate13.webp", width: 2001, height: 1416 },
  { id: 14, title: { ru: "Энерготерапия 5 Измерения", de: "Energietherapie der 5. Dimension" }, subtitle: { ru: "Интегральные практики глубокого исцеления души и сознания", de: "Integrale Praktiken zur tiefen Heilung von Seele und Bewusstsein" }, image: "/sertificate14.webp", width: 2048, height: 2048 }
];

interface Testimonial {
  id: number;
  text: { ru: string; de: string };
  author: string;
  avatar: string;
  role: { ru: string; de: string };
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    text: {
      ru: "Хочу выразить огромную благодарность Ольге замечательному человеку и настоящему профессионалу своего дела. Обращение к ней стало для меня очень важной поддержкой в непростой период жизни. Она не только помогла разобраться в ситуации, но и дала уверенность, спокойствие и внутреннюю гармонию.\n\nСпасибо за помощь, внимание и доброе отношение. Редко встречаются такие светлые и отзывчивые люди. От всей души рекомендую!",
      de: "Ich möchte Olga meinen tiefsten Dank aussprechen – einer wunderbaren Persönlichkeit und einer wahren Expertin auf ihrem Gebiet. Ihre Beratung war für mich eine sehr wichtige Unterstützung in einer schwierigen Lebensphase. Sie hat mir nicht nur geholfen, die Situation zu verstehen, sondern mir auch Zuversicht, Ruhe und innere Harmonie geschenkt.\n\nVielen Dank für die Hilfe, die Aufmerksamkeit und die Herzlichkeit. Solche feinfühligen Menschen trifft man selten. Ich empfehle sie von ganzem Herzen!"
    },
    author: "Елена",
    avatar: "ЕЛ",
    role: { ru: "Клиент", de: "Klientin" }
  },
  {
    id: 2,
    text: {
      ru: "Добрый вечер! Ольга, хотела бы выразить Вам огромное спасибо за информацию, анализ и подсказки. Получила огромное количество подробной информации по всем направлениям жизни.\nСамое главное получила для себя ответы на вопросы на которые давно искала ответы. Очень профессиональный подход.\nОльга, вы опытный специалист, дающий мудрые и точные советы и инструменты. Мой запрос был раскрыт, стало понятно направление для дальнейшего движения, даны рекомендации на что обратить внимание, что стоит делать, а от чего стоит отказаться, это было в точку.\nОльга, благодарю вас и желаю удачи!",
      de: "Guten Abend! Olga, ich möchte Ihnen vielmals für die Informationen, die Analyse und die Ratschläge danken. Ich habe eine enorme Menge an detaillierten Informationen für alle Lebensbereiche erhalten.\nVor allem habe ich Antworten auf Fragen gefunden, nach denen ich schon lange gesucht habe. Ein sehr professioneller Ansatz.\nOlga, Sie sind eine erfahrene Spezialistin, die weise und präzise Ratschläge und Werkzeuge anbietet. Mein Anliegen wurde vollständig gelöst, die Richtung für die Zukunft ist klar geworden, und es wurden wertvolle Empfehlungen gegeben.\nVielen Dank, Olga, und viel Erfolg!"
    },
    author: "Ирина",
    avatar: "ИР",
    role: { ru: "Клиент", de: "Klientin" }
  },
  {
    id: 3,
    text: {
      ru: "Уважаемая Ольга, спасибо за ваш вклад в открытие мне дорог для хорошей работы и безопасности. С Вашей помощью я смогла безопасно доехать домой, хотя в дороге была ужасная авария. Решить многие вопросы по документам, за короткое время приобрести много знакомых, найти три работы, главное кругом успевать теперь. А так же отдельное спасибо за старославянский родовой обряд на помощь и поддержку рода.\nВсе работает, рекомендую Вас как специалиста в этой области своим друзьям и знакомым. Желаю Вам только идти вперед ❤️❤️❤️❤️",
      de: "Liebe Olga, vielen Dank für Ihren Beitrag zur Öffnung meiner Wege für eine gute Arbeit und Sicherheit. Mit Ihrer Hilfe konnte ich sicher nach Hause reisen, obwohl es auf dem Weg einen schrecklichen Unfall gab. Ich konnte viele Dokumentenfragen klären, in kurzer Zeit viele Kontakte knüpfen und drei Jobs finden. Ein besonderer Dank gilt auch dem altslawischen Ahnenritual zur Unterstützung der Ahnenkräfte.\nAlles funktioniert bestens, ich empfehle Sie gerne weiter! Ich wünsche Ihnen nur das Beste ❤️❤️❤️❤️"
    },
    author: "Татьяна",
    avatar: "ТТ",
    role: { ru: "Клиент", de: "Klientin" }
  },
  {
    id: 4,
    text: {
      ru: "Оля спасибо большое тебе за курс, очень приятно с тобой работать 😍 мне очень нравится твоя трактовка карт и то как ты объясняешь, информации невероятно много, буду разбираться ✨😍",
      de: "Olya, vielen Dank für den Kurs, es ist eine Freude, mit dir zu arbeiten! Ich liebe deine Interpretation der Karten und deine Erklärungen. Die Menge an Informationen ist fantastisch, ich werde mich intensiv damit beschäftigen! ✨😍"
    },
    author: "Юлия",
    avatar: "ЮЛ",
    role: { ru: "Ученица курса", de: "Schülerin des Kurses" }
  },
  {
    id: 5,
    text: {
      ru: "Приветики. 😊 Свеча какая прямая и пламя так прямо горит 🥰. А цветочки это лаванда, щебрец, ромашка или я ошибаюсь? Как красиво 😍. Спасибочки солнце 😘 Кстати я все эти дни так себя прекрасно чувствую, так легко, высыпаюсь, в течении дня полна энергии. Суб., воскресенье работала с 6 утра и целый день после до вечера чем то занималась и даже не устала. А ещё не поверишь я не чувствую боли в спине, это прям огонь. Я так сильно тебе благодарна и не только тебе, а тому кто привёл меня на встречу с тобой. 🥰😘",
      de: "Hallo! 😊 Die Kerze brennt so ruhig und die Flamme ist so gerade. Die Blumen sind Lavendel, Thymian und Kamille, oder? Wunderschön! Vielen Dank, mein Sonnenschein. Ich fühle mich seit Tagen so großartig, leicht und voller Energie. Ich habe das ganze Wochenende ab 6 Uhr morgens gearbeitet und hatte danach immer noch Energie. Und stell dir vor, meine Rückenschmerzen sind weg! Ich bin dir so dankbar!"
    },
    author: "Анна",
    avatar: "АН",
    role: { ru: "Клиент", de: "Klientin" }
  },
  {
    id: 6,
    text: {
      ru: "Доброе утро. Оля я вчера проснулась в 5:40, проводила малого в школу и думала лягу спать. Но на моё удивление у меня было много энергии, спать не хотелось от слова совсем. Сегодня я чувствую себя так же. Полна энергии и нет чувства сонливости и усталости. ☺️☺️☺️\nЭх... пойду гладить кучу белья 🤣🤣🤣\nСпасибочки 😘",
      de: "Guten Morgen! Olya, ich bin gestern um 5:40 Uhr aufgewacht, habe das Kind zur Schule gebracht und dachte, ich lege mich wieder hin. Aber zu meiner Überraschung hatte ich so viel Energie, dass ich überhaupt nicht müde war. Heute fühle ich mich genauso. Voller Energie und ohne Müdigkeit. ☺️☺️☺️\nJetzt werde ich bügeln gehen 🤣🤣🤣\nVielen Dank! 😘"
    },
    author: "Светлана",
    avatar: "СВ",
    role: { ru: "Клиент", de: "Klientin" }
  }
];

export default function Home() {
  const { language, t } = useLanguage();
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
      {/* Микроразметка Schema.org (JSON-LD) для главной страницы */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                "@id": "https://khavych.com/#person",
                "name": "Ольга Хавич",
                "jobTitle": "Духовный целитель, таролог, нумеролог",
                "url": "https://khavych.com",
                "image": "https://khavych.com/olga.webp",
                "description": "Духовный целитель, таролог, нумеролог. Помогаю находить ответы на жизненные вопросы в сфере финансов, отношений и предназначения.",
                "sameAs": [
                  "https://instagram.com/numerologin.khavych",
                  "https://tiktok.com/@magja_moja"
                ]
              },
              {
                "@type": "LocalBusiness",
                "@id": "https://khavych.com/#organization",
                "name": "Ольга Хавич | Нумерология, Таро и Энергопрактики",
                "url": "https://khavych.com",
                "logo": "https://khavych.com/olga.webp",
                "image": "https://khavych.com/olga.webp",
                "description": "Интегральный анализ личности, энергопрактики воскового очищения и ладования для раскрытия вашего природного потенциала и гармонии в жизни.",
                "telephone": "+4917630761368",
                "email": "info@khavych.com",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "DE"
                },
                "priceRange": "€40 - €200"
              }
            ]
          }),
        }}
      />

      {/* Шапка сайта с корзиной */}
      <Header />

      <main>
        {/* 1. HERO СЕКЦИЯ (Attention - Главный экран) */}
      <section className={styles.hero} id="hero">
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroGrid}>

            {/* Блок заголовка */}
            <div className={styles.heroTitleArea}>
              <h1 className={styles.heroTitle} id="main-title">
                {t("hero", "subtitle")}<br />
                <span>{t("hero", "title")}</span>
              </h1>
            </div>

            {/* Блок фотографии Ольги */}
            <div className={styles.heroImageArea}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/olga.webp"
                alt="Olga Khavich"
                title="Olga Khavich"
                width={667}
                height={1000}
                className={styles.heroOlgaImage}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            </div>

            {/* Блок подзаголовка и кнопок (для десктопов он внутри Hero Grid) */}
            <div className={`${styles.heroBottomArea} ${styles.desktopOnly}`}>
              <p className={styles.heroSubtitle}>
                {t("hero", "desc")}
              </p>

              <div className={styles.heroActions}>
                <a href="#quiz-block" className="btn btn-primary" id="hero-btn-quiz">
                  {t("hero", "cta")}
                </a>
                <Link href="/shop" className="btn btn-secondary" id="hero-btn-shop">
                  {t("header", "shop")}
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
            {t("hero", "desc")}
          </p>
          <div className={styles.heroActionsMobile}>
            <a href="#quiz-block" className="btn btn-primary" id="hero-btn-quiz-mobile">
              {t("hero", "cta")}
            </a>
            <Link href="/shop" className="btn btn-secondary" id="hero-btn-shop-mobile">
              {t("header", "shop")}
            </Link>
          </div>
        </div>
      </div>
      <section className={styles.problems} id="problems">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>{t("problems", "title")}</h2>
            <p>
              {t("problems", "subtitle")}
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
                <h3>{t("problems", "finance")}</h3>
                <p>{t("problems", "financeDesc")}</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.problemSvgIcon}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div className={styles.problemCardContent}>
                <h3>{t("problems", "relations")}</h3>
                <p>{t("problems", "relationsDesc")}</p>
              </div>
            </div>

            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.problemSvgIcon}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className={styles.problemCardContent}>
                <h3>{t("problems", "energy")}</h3>
                <p>{t("problems", "energyDesc")}</p>
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
                <h3>{t("problems", "destiny")}</h3>
                <p>{t("problems", "destinyDesc")}</p>
              </div>
            </div>
          </div>

          <div className={styles.problemsTransition}>
            {t("problems", "quote")}
          </div>
        </div>
      </section>

      {/* 3. БЛОК-ФИЛОСОФИЯ "СИСТЕМА ЧЕТЫРЕХ КЛЮЧЕЙ" (Interest - Почему это работает?) */}
      <section className={styles.keys} id="keys">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2 style={{ color: "#fff" }}>{t("keysBlock", "title")}</h2>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              {t("keysBlock", "subtitle")}
            </p>
          </div>

          <div className={styles.keysGrid}>
            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>01</div>
              </div>
              <h3 className={styles.keyStepTitle}>{t("keysBlock", "k1_title")}</h3>
              <p className={styles.keyStepDesc}>
                {t("keysBlock", "k1_desc")}
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>02</div>
              </div>
              <h3 className={styles.keyStepTitle}>{t("keysBlock", "k2_title")}</h3>
              <p className={styles.keyStepDesc}>
                {t("keysBlock", "k2_desc")}
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>03</div>
              </div>
              <h3 className={styles.keyStepTitle}>{t("keysBlock", "k3_title")}</h3>
              <p className={styles.keyStepDesc}>
                {t("keysBlock", "k3_desc")}
              </p>
            </div>

            <div className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div className={styles.keyStepNumber}>04</div>
              </div>
              <h3 className={styles.keyStepTitle}>{t("keysBlock", "k4_title")}</h3>
              <p className={styles.keyStepDesc}>
                {t("keysBlock", "k4_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ПРОДУКТОВАЯ МАТРИЦА (Desire - Услуги и Направления практики) */}
      <section className={styles.services} id="services">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>{t("servicesBlock", "title")}</h2>
            <p>
              {t("servicesBlock", "subtitle")}
            </p>
          </div>

          <div className={styles.servicesGrid}>
            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-tarot.webp" alt="Tarot" title="Tarot" width={500} height={500} className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>{t("servicesBlock", "s1_title")}</h3>
              <p>
                {t("servicesBlock", "s1_desc")}
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=TAROT" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-tarot-btn">
                {t("servicesBlock", "s1_btn")}
              </Link>
            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-wax.webp" alt="Wachsguss" title="Wachsguss" width={500} height={500} className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>{t("servicesBlock", "s2_title")}</h3>
              <p>
                {t("servicesBlock", "s2_desc")}
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=WAX" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-wax-btn">
                {t("servicesBlock", "s2_btn")}
              </Link>
            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-lading.webp" alt="Ladowanie" title="Ladowanie" width={500} height={500} className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>{t("servicesBlock", "s3_title")}</h3>
              <p>
                {t("servicesBlock", "s3_desc")}
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=LADING" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-lading-btn">
                {t("servicesBlock", "s3_btn")}
              </Link>
            </article>

            <article className={styles.serviceCard}>
              <div className={styles.serviceImageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/service-numerology.webp" alt="Numerologie" title="Numerologie" width={500} height={500} className={styles.serviceImage} loading="lazy" decoding="async" />
              </div>
              <h3>{t("servicesBlock", "s4_title")}</h3>
              <p>
                {t("servicesBlock", "s4_desc")}
              </p>
              <Link href="/shop?category=CONSULTATION&subCategory=NUMEROLOGY" className="btn btn-secondary" style={{ marginTop: "auto" }} id="service-matrix-btn">
                {t("servicesBlock", "s4_btn")}
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* 5. ПРОДУКТЫ СИЛЫ: БРАСЛЕТЫ И КУРСЫ (Desire - Артефакты и Обучение) */}
      <section className={styles.productsPower} id="products-power">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>{t("productsPowerBlock", "title")}</h2>
            <p>
              {t("productsPowerBlock", "subtitle")}
            </p>
          </div>

          <div className={styles.productsPowerGrid}>
            {/* Блок Амулетов */}
            <div className={`${styles.powerCard} ${styles.powerCardNormal}`}>
              <div className={styles.powerBadge}>{t("productsPowerBlock", "p1_badge")}</div>
              <h3 className={styles.powerTitle}>{t("productsPowerBlock", "p1_title")}</h3>
              <p className={styles.powerDesc}>
                {t("productsPowerBlock", "p1_desc")}
              </p>
              <div className={styles.powerList}>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> {t("productsPowerBlock", "p1_f1")}
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> {t("productsPowerBlock", "p1_f2")}
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> {t("productsPowerBlock", "p1_f3")}
                </div>
              </div>
              <Link href="/shop?category=PRODUCT" className="btn btn-secondary" style={{ marginTop: "auto" }}>
                {t("productsPowerBlock", "p1_btn")}
              </Link>
            </div>

            {/* Блок Курсов */}
            <div className={`${styles.powerCard} ${styles.powerCardPremium}`}>
              <div className={styles.powerBadge}>{t("productsPowerBlock", "p2_badge")}</div>
              <h3 className={styles.powerTitle}>{t("productsPowerBlock", "p2_title")}</h3>
              <p className={styles.powerDesc}>
                {t("productsPowerBlock", "p2_desc")}
              </p>
              <div className={styles.powerList}>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> {t("productsPowerBlock", "p2_f1")}
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> {t("productsPowerBlock", "p2_f2")}
                </div>
                <div className={styles.powerListItem}>
                  <span className={styles.powerListItemDot}>✦</span> {t("productsPowerBlock", "p2_f3")}
                </div>
              </div>
              <Link href="/shop?category=COURSE" className="btn btn-primary" style={{ marginTop: "auto" }}>
                {t("productsPowerBlock", "p2_btn")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ИНТЕРАКТИВНЫЙ КВИЗ-ТЕСТ "С ЧЕГО НАЧАТЬ?" (Вовлечение) */}
      <section className={styles.quiz} id="quiz-block">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>{t("quiz", "title")}</h2>
            <p>
              {t("quiz", "subtitle")}
            </p>
          </div>

          <div className={styles.quizCard}>
            {!quizFinished ? (
              <>
                <div className={styles.quizHeader}>
                  <div className={styles.quizProgressWrapper}>
                    <span>
                      {language === "ru"
                        ? `Вопрос ${currentQuestionIndex + 1} из ${QUIZ_QUESTIONS.length}`
                        : `Frage ${currentQuestionIndex + 1} von ${QUIZ_QUESTIONS.length}`}
                    </span>
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
                    <h3>{QUIZ_QUESTIONS[currentQuestionIndex].question[language]}</h3>
                    <div className={styles.quizOptions}>
                      {QUIZ_QUESTIONS[currentQuestionIndex].options.map((opt, i) => (
                        <button
                          key={i}
                          className={styles.quizOption}
                          onClick={() => handleQuizAnswer(opt.score)}
                        >
                          <span>{opt.text[language]}</span>
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
                  <h3 className={styles.quizResultTitle}>{t("quiz", "resultTitle")}</h3>
                  <div className={styles.quizResultAction}>
                    <h4>{QUIZ_RESULTS[finalRecommendation].title[language]}</h4>
                    <p>
                      {language === "ru"
                        ? "Рекомендуемый шаг для восстановления баланса и раскрытия потенциала"
                        : "Empfohlener Schritt zur Wiederherstellung der Balance und Potenzialentfaltung"}
                    </p>
                  </div>
                  <p className={styles.quizResultDesc}>
                    {QUIZ_RESULTS[finalRecommendation].desc[language]}
                  </p>
                  <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                    <Link href={QUIZ_RESULTS[finalRecommendation].link} className="btn btn-primary">
                      {QUIZ_RESULTS[finalRecommendation].btnText[language]}
                    </Link>
                    <button className="btn btn-secondary" onClick={resetQuiz}>
                      {t("quiz", "btnRestart")}
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
                  alt={language === "ru" ? "Ольга Хавич, нумеролог и ваш проводник в мир осознанности" : "Olga Khavich, Numerologin und Ihre Begleiterin"}
                  title={language === "ru" ? "Ольга Хавич, нумеролог и ваш проводник в мир осознанности" : "Olga Khavich, Numerologin und Ihre Begleiterin"}
                  width={1000}
                  height={1045}
                  className={styles.aboutOlgaImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className={styles.aboutContent}>
              <h2>
                {t("about", "subtitle")} — <span>{t("about", "title")}</span>
              </h2>

              <div className={styles.aboutText}>
                <p style={{ fontWeight: "600", fontSize: "17px", color: "var(--color-primary)", borderLeft: "3px solid var(--color-primary)", paddingLeft: "15px", fontStyle: "italic" }}>
                  {t("about", "quote")}
                </p>
                <p>
                  {t("about", "text1")}
                </p>
                <p>
                  {t("about", "text2")}
                </p>
              </div>

              {/* Сетка качеств */}
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h3>{t("about", "feat1_title")}</h3>
                    <p>{t("about", "feat1_desc")}</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h3>{t("about", "feat2_title")}</h3>
                    <p>{t("about", "feat2_desc")}</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h3>{t("about", "feat3_title")}</h3>
                    <p>{t("about", "feat3_desc")}</p>
                  </div>
                </div>

                <div className={styles.featureItem}>
                  <div className={styles.featureItemIcon}>✓</div>
                  <div className={styles.featureItemText}>
                    <h3>{t("about", "feat4_title")}</h3>
                    <p>{t("about", "feat4_desc")}</p>
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
            <h2>{t("skills", "title")}</h2>
            <p>
              {t("skills", "subtitle")}
            </p>
          </div>

          <div className={styles.sliderContainer}>
            {/* Стрелка Влево */}
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className={`${styles.sliderArrow} ${styles.sliderArrowLeft} ${currentSlideIndex === 0 ? styles.sliderArrowDisabled : ""}`}
              aria-label={language === "ru" ? "Предыдущий сертификат" : "Vorheriges Zertifikat"}
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
                          alt={dip.title[language]}
                          title={dip.title[language]}
                          width={dip.width}
                          height={dip.height}
                          className={styles.diplomaImg}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className={styles.diplomaOverlay}>
                          <span style={{ fontSize: "24px" }}>🔍</span>
                          <span style={{ fontSize: "11px", color: "#fff", fontWeight: 600, marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
                            {language === "ru" ? "Увеличить" : "Vergrößern"}
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
              aria-label={language === "ru" ? "Следующий сертификат" : "Nächstes Zertifikat"}
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
                aria-label={language === "ru" ? `Перейти к слайду ${idx + 1}` : `Zu Folie ${idx + 1} wechseln`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. РЕАЛЬНЫЕ КЕЙСЫ И ОТЗЫВЫ (Доверие / Social Proof) */}
      <section className={styles.testimonials} id="testimonials">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>{t("testimonials", "title")}</h2>
            <p>
              {t("testimonials", "subtitle")}
            </p>
          </div>

          <div className={styles.testimonialsSliderContainer}>
            {/* Стрелка Влево */}
            <button
              onClick={prevTestimonial}
              disabled={currentTestimonialIndex === 0}
              className={`${styles.testimonialsSliderArrow} ${styles.testimonialsSliderArrowLeft} ${currentTestimonialIndex === 0 ? styles.testimonialsSliderArrowDisabled : ""}`}
              aria-label={language === "ru" ? "Предыдущий отзыв" : "Vorherige Bewertung"}
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
                        «{test.text[language]}»
                      </p>
                      <div className={styles.clientMeta}>
                        <div className={styles.avatar}>{test.avatar}</div>
                        <div className={styles.clientInfo}>
                          <h3>{test.author}</h3>
                          <p>{test.role[language]}</p>
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
              aria-label={language === "ru" ? "Следующий отзыв" : "Nächste Bewertung"}
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
                aria-label={language === "ru" ? `Перейти к отзыву ${idx + 1}` : `Zu Bewertung ${idx + 1} wechseln`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ - ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ (Закрытие возражений) */}
      <section className={styles.faq} id="faq-section">
        <div className="container">
          <div className={styles.centerHeader}>
            <h2>{t("faq", "title")}</h2>
            <p>
              {t("faq", "subtitle")}
            </p>
          </div>

          <div className={styles.faqGrid}>
            <div className={`${styles.faqItem} ${openFaqIndex === 0 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(0)}>
                <span>{t("faq", "q1")}</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  {t("faq", "a1")}
                </p>
              </div>
            </div>

            <div className={`${styles.faqItem} ${openFaqIndex === 1 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(1)}>
                <span>{t("faq", "q2")}</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  {t("faq", "a2")}
                </p>
              </div>
            </div>

            <div className={`${styles.faqItem} ${openFaqIndex === 2 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(2)}>
                <span>{t("faq", "q3")}</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  {t("faq", "a3")}
                </p>
              </div>
            </div>

            <div className={`${styles.faqItem} ${openFaqIndex === 3 ? styles.faqItemOpen : ""}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(3)}>
                <span>{t("faq", "q4")}</span>
                <span className={styles.faqIcon}>+</span>
              </button>
              <div className={styles.faqAnswer}>
                <p>
                  {t("faq", "a4")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* 10. ФИНАЛЬНЫЙ CTA (Action - Запись / Консультация) */}
      <footer className={styles.footer}>
        <div className="container" style={{ marginBottom: "60px", textAlign: "center" }}>
          <div className={styles.centerHeader} style={{ marginBottom: "30px" }}>
            <h2 style={{ color: "#fff" }}>{t("footer", "title")}</h2>
            <p style={{ color: "rgba(255,255,255,0.9)" }}>
              {t("footer", "desc")}
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
              <span>{t("footer", "wa")}</span>
            </a>
            <a
              href="https://t.me/Bluesky_blue_blue"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px", borderColor: "rgba(255,255,255,0.2)" }}
            >
              <span>{t("footer", "tg")}</span>
            </a>
          </div>
        </div>

        <div className={`container ${styles.footerGrid}`}>
          {/* Колонка 1: Логотип */}
          <div className={styles.footerLogo}>
            <h3>OLGA KHAVYCH</h3>
            <p>
              {t("footer", "logoDesc")}
            </p>
          </div>

          {/* Колонка 2: Контакты */}
          <div className={styles.footerContacts}>
            <h4>{t("footer", "contactsTitle")}</h4>
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
              <span>+49 176 30761368 ({t("footer", "germany")})</span>
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
          <p>{t("footer", "copyright")}</p>
          <p>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline" }}>
              {t("footer", "cabinetLink")}
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
              alt={activeDiploma.title[language]}
              title={activeDiploma.title[language]}
              width={activeDiploma.width}
              height={activeDiploma.height}
              className={styles.lightboxImage}
              decoding="async"
            />
          </div>
        </div>
      )}
    </div>
  );
}
