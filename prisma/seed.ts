import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Основная функция сидирования (заполнения базы данных начальными данными).
 * Создает продукты, курсы и уроки в БД PostgreSQL с поддержкой немецкого языка (de).
 */
async function main() {
  console.log("Запуск сидирования базы данных...");

  // 1. Очистка старых данных перед заполнением (транзакция)
  await prisma.$transaction([
    prisma.lesson.deleteMany(),
    prisma.userAccess.deleteMany(),
    prisma.course.deleteMany(),
    prisma.product.deleteMany(),
  ]);

  console.log("Старые данные очищены.");

  // 2. Создание продуктов в магазине (каталог)
  const products = [
    // --- 5 ТЕСТОВЫХ БРАСЛЕТОВ ---
    {
      id: "bracelet-1",
      name: {
        ru: "Амулетный браслет «Финансовый поток»",
        de: "Amulett-Armband «Finanzfluss»"
      },
      description: {
        ru: "Авторский браслет из натуральных камней (пирит, цитрин, тигровый глаз) с индивидуальным нумерологическим кодом богатства на золотой фурнитуре. Помогает открыть новые источники дохода и привлечь удачу.",
        de: "Einzigartiges Armband aus Natursteinen (Pyrit, Citrin, Tigerauge) mit individuellem numerologischem Reichtumscode auf vergoldeten Elementen. Hilft, neue Einkommensquellen zu erschließen und Glück anzuziehen."
      },
      price: 49.0,
      oldPrice: 59.0,
      imageUrl: "/bracelet1.jpeg",
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["Натуральный цитрин и пирит класса ААА", "Индивидуальный расчет по вашей дате рождения", "Активация энергетическим ладованием"],
        de: ["Natürlicher Citrin und Pyrit der AAA-Klasse", "Individuelle Berechnung nach Ihrem Geburtsdatum", "Aktivierung durch energetische Harmonisierung"]
      }
    },
    {
      id: "bracelet-2",
      name: {
        ru: "Энергетический браслет «Гармония 7 Чакр»",
        de: "Energie-Armband «Harmonie der 7 Chakren»"
      },
      description: {
        ru: "Сбалансированное сочетание семи священных камней (аметист, лазурит, бирюза, императорская яшма, тигровый глаз, янтарь, сердолик) для очищения, гармонизации и наполнения жизненной силой всех энергетических центров.",
        de: "Ausgewogene Kombination aus sieben heiligen Steinen (Amethyst, Lapislazuli, Türkis, Kaiserjaspis, Tigerauge, Bernstein, Karneol) zur Reinigung, Harmonisierung und Stärkung aller Energiezentren."
      },
      price: 39.0,
      oldPrice: null,
      imageUrl: "/bracelet2.jpeg",
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["7 натуральных минералов для каждой чакры", "Основа из прочной эластичной нити", "Подходит для ежедневных медитаций"],
        de: ["7 natürliche Mineralien für jedes Chakra", "Stabile, elastische Fadenbasis", "Ideal für tägliche Meditationen"]
      }
    },
    {
      id: "bracelet-3",
      name: {
        ru: "Браслет-оберег «Защита и Сила»",
        de: "Schutz-Armband «Schutz und Stärke»"
      },
      description: {
        ru: "Мощный оберег из черного турмалина (шерла) и матового шунгита. Нейтрализует негативные энергетические воздействия, укрепляет биополе, придает уверенность и внутреннюю стабильность.",
        de: "Starker Schutzstein aus schwarzem Turmalin (Schörl) und mattem Schungit. Neutralisiert negative energetische Einflüsse, stärkt das Biofeld und schenkt Selbstvertrauen."
      },
      price: 45.0,
      oldPrice: 48.0,
      imageUrl: "/bracelet3.jpeg",
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["Натуральный шерл (черный турмалин)", "Защита от негативного влияния", "Ручная сборка под размер запястья"],
        de: ["Natürlicher Schörl (schwarzer Turmalin)", "Schutz vor negativen Energien", "Handgefertigt nach Handgelenkumfang"]
      }
    },
    {
      id: "bracelet-4",
      name: {
        ru: "Амулетный браслет «Магнит Любви»",
        de: "Amulett-Armband «Liebesmagnet»"
      },
      description: {
        ru: "Нежный браслет из розового кварца, аметиста и горного хрусталя. Настроен на раскрытие сердечной чакры (Анахаты), привлечение искренней любви, нежности и взаимопонимания.",
        de: "Zartes Armband aus Rosenquarz, Amethyst und Bergkristall. Abgestimmt auf die Öffnung des Herzchakras (Anahata), um wahre Liebe, Zärtlichkeit und gegenseitiges Verständnis anzuziehen."
      },
      price: 42.0,
      oldPrice: null,
      imageUrl: "/bracelet4.jpeg",
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["Натуральный розовый кварц класса АА", "Гармонизация личных отношений", "Зарядка на привлечение любви"],
        de: ["Natürlicher Rosenquarz der AA-Klasse", "Harmonisierung persönlicher Beziehungen", "Energetisch aufgeladen für die Liebe"]
      }
    },
    {
      id: "bracelet-5",
      name: {
        ru: "Браслет-стимулятор «Активатор Здоровья»",
        de: "Vitalitäts-Armband «Gesundheitsaktivator»"
      },
      description: {
        ru: "Браслет из зеленого нефрита, гематита и лавового камня. Способствует регенерации сил, улучшает тонус организма, заземляет и защищает от физического переутомления.",
        de: "Armband aus grüner Jade, Hämatit und Lavastein. Unterstützt die Regeneration, verbessert die körperliche Vitalität, erdet und schützt vor Erschöpfung."
      },
      price: 40.0,
      oldPrice: 45.0,
      imageUrl: "/bracelet5.jpeg",
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["Натуральный зеленый нефрит и лава", "Укрепление иммунитета и тонуса", "Подходит мужчинам и женщинам"],
        de: ["Natürliche grüne Jade und Lavagestein", "Stärkung der Immunität und Vitalität", "Unisex-Design, passend für alle"]
      }
    },

    // --- КУРСЫ ---
    {
      id: "course-1",
      name: {
        ru: "Курс «Практическая Нумерология. Матрица Судьбы»",
        de: "Kurs «Praktische Numerologie. Matrix des Schicksals»"
      },
      description: {
        ru: "Глубокая авторская программа обучения нумерологии. С нуля научитесь рассчитывать и анализировать судьбу человека, кармические узлы, финансовый потенциал и совместимость в отношениях.",
        de: "Tiefgehendes Autoren-Ausbildungsprogramm in Numerologie. Lernen Sie von Grund auf, das Schicksal, karmische Knoten, das Finanzpotenzial und die Beziehungskompatibilität zu berechnen."
      },
      price: 189.0,
      oldPrice: 249.0,
      imageUrl: "/images/course-numerology.jpg",
      category: "COURSE" as const,
      isAvailable: true,
      features: {
        ru: ["24 видеоурока без воды с методичками", "Доступ в личный кабинет ученика навсегда", "Сертификат об окончании курса"],
        de: ["24 praxisnahe Videolektionen mit Handbüchern", "Lebenslanger Zugang zum Mitgliederbereich", "Zertifikat nach Kursabschluss"]
      }
    },
    {
      id: "course-2",
      name: {
        ru: "Курс «Таро для начинающих. Старшие Арканы»",
        de: "Kurs «Tarot für Anfänger. Große Arkana»"
      },
      description: {
        ru: "Пошаговый курс по глубокому изучению 22 Старших Арканов Таро. Вы изучите архетипы карт, научитесь делать точные расклады на любые жизненные вопросы без зубрежки значений.",
        de: "Schritt-für-Schritt-Kurs zum tiefen Studium der 22 Großen Arkana des Tarots. Lernen Sie die Archetypen kennen und legen Sie Karten für alle Lebensfragen ohne Auswendiglernen."
      },
      price: 145.0,
      oldPrice: null,
      imageUrl: "/images/course-tarot.jpg",
      category: "COURSE" as const,
      isAvailable: true,
      features: {
        ru: ["Подробный разбор 22 Старших Арканов", "Практические домашние задания с проверкой", "Удобные шпаргалки по раскладам"],
        de: ["Detaillierte Analyse der 22 Großen Arkana", "Praktische Hausaufgaben mit Feedback", "Nützliche Spickzettel für Legesysteme"]
      }
    },

    // --- УСЛУГИ (4 НАПРАВЛЕНИЯ) ---
    {
      id: "consultation-numerology",
      name: {
        ru: "Полный нумерологический анализ Матрицы Судьбы",
        de: "Vollständige numerologische Analyse der Schicksalsmatrix"
      },
      description: {
        ru: "Детальный разбор вашей матрицы судьбы по дате рождения. Определение предназначения, талантов, скрытого финансового потенциала и кармических задач.",
        de: "Detaillierte Analyse Ihrer Schicksalsmatrix nach Geburtsdatum. Bestimmung der Lebensaufgabe, Talente, des verborgenen Finanzpotenzials und karmischer Aufgaben."
      },
      price: 85.0,
      oldPrice: 100.0,
      imageUrl: "/images/service-numerology.jpg",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Живая онлайн-сессия (1.5 часа) с записью", "Подробный текстовый PDF-отчет (40+ страниц)", "Ответы на ключевые жизненные вопросы"],
        de: ["Live-Online-Sitzung (1.5 Std.) mit Aufzeichnung", "Ausführlicher schriftlicher PDF-Bericht (40+ S.)", "Antworten auf die wichtigsten Lebensfragen"]
      }
    },
    {
      id: "consultation-tarot",
      name: {
        ru: "Расклад Таро на партнерские отношения и любовь",
        de: "Tarot-Legung für Partnerschaft und Liebe"
      },
      description: {
        ru: "Глубокая диагностика ваших отношений с партнером. Разбор мыслей, чувств, скрытых мотивов, причин недопонимания и точный прогноз союза.",
        de: "Tiefgehende Analyse Ihrer Beziehung. Analyse der Gedanken, Gefühle, verborgenen Motive, Ursachen für Missverständnisse und präzise Zukunftsprognose."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-tarot.jpg",
      category: "CONSULTATION" as const,
      subCategory: "TAROT",
      isAvailable: true,
      features: {
        ru: ["Анализ мыслей, чувств и намерений партнера", "Выявление кармических уроков союза", "Рекомендации карт по гармонизации отношений"],
        de: ["Analyse der Gedanken und Absichten des Partners", "Erkennung karmischer Lektionen der Verbindung", "Empfehlungen der Karten zur Beziehungsstärkung"]
      }
    },
    {
      id: "consultation-wax",
      name: {
        ru: "Восковая отливка: Энергетическая чистка чакр",
        de: "Wachsguss: Energetische Chakrenreinigung"
      },
      description: {
        ru: "Эффективная практика очищения от деструктивных программ, блоков, сглаза и накопленного ментального мусора с помощью натурального пчелиного воска.",
        de: "Effektive Reinigungsmethode von destruktiven Programmen, Blockaden, Fremdeinflüssen und mentalem Ballast mithilfe von natürlichem Bienenwachs."
      },
      price: 90.0,
      oldPrice: null,
      imageUrl: "/images/service-wax.jpg",
      category: "CONSULTATION" as const,
      subCategory: "WAX",
      isAvailable: true,
      features: {
        ru: ["Полный цикл восковых отливок по фотографии", "Снятие блоков в 7 чакрах", "Фотоотчет отливки с детальной трактовкой"],
        de: ["Vollständiger Wachsguss-Zyklus per Foto", "Lösung von Blockaden in allen 7 Chakren", "Fotobericht des Wachsbildes mit Deutung"]
      }
    },
    {
      id: "consultation-lading",
      name: {
        ru: "Энергетическое ладование чакральной системы",
        de: "Energetische Chakren-Harmonisierung (Ladung)"
      },
      description: {
        ru: "Практика мягкого наполнения очищенных чакр природной силой, балансировка потоков энергии, восстановление целостности ауры и защитного поля.",
        de: "Sanfte Aufladung gereinigter Chakren mit Lebensenergie, Harmonisierung der Energieflüsse, Wiederherstellung der Aura-Integrität."
      },
      price: 60.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.jpg",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Гармонизация и сонастройка всех 7 энергоцентров", "Укрепление границ биополя", "Ощущение бодрости, легкости и ясности"],
        de: ["Harmonisierung und Ausrichtung aller 7 Zentren", "Stärkung der Grenzen Ihres Biofeldes", "Gefühl von Vitalität, Leichtigkeit und Klarheit"]
      }
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`Создано ${products.length} продуктов в магазине.`);

  // 3. Создание закрытых курсов для Личного кабинета
  await prisma.course.create({
    data: {
      id: "course-1",
      title: "Практическая Нумерология. Матрица Судьбы",
      description: "Глубокая авторская программа обучения нумерологии. С нуля научитесь рассчитывать и анализировать судьбу человека, кармические узлы, финансовый потенциал и совместимость в отношениях.",
      imageUrl: "/images/course-numerology.jpg",
      isPublished: true,
    },
  });

  await prisma.course.create({
    data: {
      id: "course-2",
      title: "Таро для начинающих. Старшие Арканы",
      description: "Пошаговый курс по глубокому изучению 22 Старших Арканов Таро. Вы изучите архетипы карт, научитесь делать точные расклады на любые жизненные вопросы без зубрежки значений.",
      imageUrl: "/images/course-tarot.jpg",
      isPublished: true,
    },
  });

  console.log("Созданы курсы в обучающей системе.");

  // 4. Добавление уроков для курсов (демонстрационные)
  const lessons = [
    {
      courseId: "course-1",
      title: "Урок 1. Введение в Матрицу Судьбы и её философия",
      description: "Знакомство со структурой Матрицы, базовые понятия и подготовка к расчетам.",
      videoUrl: "https://kinescope.io/demo-video-1",
      order: 1,
    },
    {
      courseId: "course-1",
      title: "Урок 2. Расчет личного квадрата и базовых энергий характера",
      description: "Пошаговый разбор расчета центральной точки и четырех углов личного квадрата.",
      videoUrl: "https://kinescope.io/demo-video-2",
      order: 2,
    },
    {
      courseId: "course-2",
      title: "Урок 1. История Таро и подготовка колоды к раскладам",
      description: "Правильный выбор колоды, очищение, хранение и сонастройка с картами.",
      videoUrl: "https://kinescope.io/demo-video-3",
      order: 1,
    },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.create({
      data: lesson,
    });
  }

  console.log("Все уроки для курсов успешно добавлены.");
  console.log("Сидирование базы данных завершено успешно!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
