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
 * Создает продукты, курсы и уроки в БД PostgreSQL.
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
    {
      id: "bracelet-1",
      name: {
        ru: "Амулетный браслет «Финансовый поток»",
        en: "Amulet Bracelet 'Financial Flow'"
      },
      description: {
        ru: "Авторский браслет из натуральных камней (пирит, цитрин, тигровый глаз) с индивидуальным нумерологическим кодом богатства на золотой фурнитуре. Помогает открыть новые источники дохода и привлечь удачу.",
        en: "Author's bracelet made of natural stones (pyrite, citrine, tiger's eye) with an individual numerological wealth code on gold hardware. Helps open new sources of income and attract luck."
      },
      price: 49.0,
      oldPrice: 59.0,
      imageUrl: null,
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["Натуральный цитрин и пирит класса ААА", "Индивидуальный расчет по вашей дате рождения", "Активация энергетическим ладованием"],
        en: ["Natural citrine and pyrite AAA class", "Individual calculation by your date of birth", "Activation by energy lading"]
      }
    },
    {
      id: "bracelet-2",
      name: {
        ru: "Энергетический браслет «Гармония 7 Чакр»",
        en: "Energy Bracelet '7 Chakras Harmony'"
      },
      description: {
        ru: "Сбалансированное сочетание семи священных камней (аметист, лазурит, бирюза, императорская яшма, тигровый глаз, янтарь, сердолик) для очищения, гармонизации и наполнения жизненной силой всех энергетических центров.",
        en: "Balanced combination of seven sacred stones (amethyst, lapis lazuli, turquoise, imperial jasper, tiger's eye, amber, carnelian) for purification, harmonization and filling with vital force of all energy centers."
      },
      price: 39.0,
      oldPrice: null,
      imageUrl: null,
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["7 натуральных минералов для каждой чакры", "Основа из прочной эластичной нити", "Подходит для ежедневных медитаций"],
        en: ["7 natural minerals for each chakra", "Base made of strong elastic thread", "Suitable for daily meditations"]
      }
    },
    {
      id: "bracelet-3",
      name: {
        ru: "Браслет-оберег «Защита и Сила»",
        en: "Amulet Bracelet 'Protection and Strength'"
      },
      description: {
        ru: "Мощный оберег из черного турмалина (шерла) и матового шунгита. Нейтрализует негативные энергетические воздействия, укрепляет биополе, придает уверенность и внутреннюю стабильность.",
        en: "Powerful amulet made of black tourmaline (sherl) and matte shungite. Neutralizes negative energy influences, strengthens the biofield, gives confidence and internal stability."
      },
      price: 42.0,
      oldPrice: 48.0,
      imageUrl: null,
      category: "BRACELET" as const,
      isAvailable: true,
      features: {
        ru: ["Натуральный шерл (черный турмалин)", "Защита от негативного влияния", "Ручная сборка под размер запястья"],
        en: ["Natural sherl (black tourmaline)", "Protection from negative influence", "Hand assembly to wrist size"]
      }
    },
    {
      id: "course-1",
      name: {
        ru: "Курс «Практическая Нумерология. Матрица Судьбы»",
        en: "Course 'Practical Numerology. Matrix of Destiny'"
      },
      description: {
        ru: "Глубокая авторская программа обучения нумерологии. С нуля научитесь рассчитывать и анализировать судьбу человека, кармические узлы, финансовый потенциал и совместимость в отношениях.",
        en: "Deep author's program for teaching numerology. From scratch you will learn to calculate and analyze a person's destiny, karmic nodes, financial potential and compatibility in relationships."
      },
      price: 189.0,
      oldPrice: 249.0,
      imageUrl: null,
      category: "COURSE" as const,
      isAvailable: true,
      features: {
        ru: ["24 видеоурока без воды с методичками", "Доступ в личный кабинет ученика навсегда", "Сертификат об окончании курса"],
        en: ["24 video lessons without water with manuals", "Access to the student's personal account forever", "Certificate of course completion"]
      }
    },
    {
      id: "course-2",
      name: {
        ru: "Курс «Таро для начинающих. Старшие Арканы»",
        en: "Course 'Tarot for Beginners. Major Arcana'"
      },
      description: {
        ru: "Пошаговый курс по глубокому изучению 22 Старших Арканов Таро. Вы изучите архетипы карт, научитесь делать точные расклады на любые жизненные вопросы без зубрежки значений.",
        en: "Step-by-step course on deep study of 22 Major Arcana of Tarot. You will study card archetypes, learn to make accurate spreads on any life questions without memorizing values."
      },
      price: 145.0,
      oldPrice: null,
      imageUrl: null,
      category: "COURSE" as const,
      isAvailable: true,
      features: {
        ru: ["Подробный разбор 22 Старших Арканов", "Практические домашние задания с проверкой", "Удобные шпаргалки по раскладам"],
        en: ["Detailed analysis of 22 Major Arcana", "Practical homework with review", "Convenient cheat sheets on spreads"]
      }
    },
    {
      id: "consultation-1",
      name: {
        ru: "Индивидуальный Нумерологический разбор матрицы",
        en: "Individual Numerological Matrix Analysis"
      },
      description: {
        ru: "Полная консультация Ольги Хавич по вашей дате рождения (1.5-2 часа, онлайн). Подробный анализ вашего жизненного предназначения, скрытых талантов, кармических задач и рекомендаций на текущий период.",
        en: "Full consultation of Olga Khavich by your date of birth (1.5-2 hours, online). Detailed analysis of your life purpose, hidden talents, karmic tasks and recommendations for the current period."
      },
      price: 85.0,
      oldPrice: 100.0,
      imageUrl: null,
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Живая онлайн-встреча с записью", "Текстовый PDF-отчет на 40+ страниц", "Ответы на любые ваши вопросы"],
        en: ["Live online meeting with recording", "Text PDF report of 40+ pages", "Answers to any of your questions"]
      }
    },
    {
      id: "consultation-2",
      name: {
        ru: "Чакродиагностика и Энергетическое ладование",
        en: "Chakra Diagnosis and Energy Lading"
      },
      description: {
        ru: "Комплексная сессия по диагностике ваших энергетических центров (чакр), выявлению блоков и зажимов, с последующим мягким восковым ладованием и восстановлением целостности ауры.",
        en: "Comprehensive session for diagnosing your energy centers (chakras), identifying blocks and clamps, followed by soft wax lading and restoring the integrity of the aura."
      },
      price: 60.0,
      oldPrice: null,
      imageUrl: null,
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Полная диагностика биополя", "Дистанционная работа по фото", "Рекомендации по защите энергии"],
        en: ["Full biofield diagnostics", "Remote work by photo", "Recommendations for energy protection"]
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
  const numCourse = await prisma.course.create({
    data: {
      id: "course-1",
      title: "Практическая Нумерология. Матрица Судьбы",
      description: "Глубокая авторская программа обучения нумерологии. С нуля научитесь рассчитывать и анализировать судьбу человека, кармические узлы, финансовый потенциал и совместимость в отношениях.",
      imageUrl: "/images/course-numerology.jpg",
      isPublished: true,
    },
  });

  const tarotCourse = await prisma.course.create({
    data: {
      id: "course-2",
      title: "Таро для начинающих. Старшие Арканы",
      description: "Пошаговый курс по глубокому изучению 22 Старших Арканов Таро. Вы изучите архетипы карт, научитесь делать точные расклады на любые жизненные вопросы без зубрежки значений.",
      imageUrl: "/images/course-tarot.jpg",
      isPublished: true,
    },
  });

  console.log("Созданы курсы в обучающей системе.");

  // 4. Добавление уроков для курса «Практическая Нумерология. Матрица Судьбы»
  const numLessons = [
    {
      title: "Введение в Матрицу Судьбы и 22 энергии",
      description: "В этом вводном уроке мы разберем философию метода Матрицы Судьбы, познакомимся с концепцией 22 энергий Нового Времени и научимся базовым правилам сложения чисел в матрице.",
      // Пример Kinescope видео плеера. Мы используем демонстрационный iframe-плеер
      videoUrl: "https://kinescope.ru/embed/player-demo-1", 
      fileUrls: ["/files/intro-matrix-handout.pdf", "/files/energy-table.pdf"],
      order: 1,
      courseId: numCourse.id,
    },
    {
      title: "Расчет угловых точек матрицы (Личность и Сила)",
      description: "Практическое занятие по детальному ручному расчету угловых точек личного квадрата и родового квадрата. Учимся выявлять сильные стороны и зоны проработки личности.",
      videoUrl: "https://kinescope.ru/embed/player-demo-2",
      fileUrls: ["/files/calculation-guide.pdf"],
      order: 2,
      courseId: numCourse.id,
    },
    {
      title: "Кармический хвост: Скрытые уроки прошлых воплощений",
      description: "Разбор нижней точки матрицы — кармического долга. Как определить свои нерешенные задачи из прошлого, развязать кармические узлы и перестать наступать на одни и те же грабли.",
      videoUrl: "https://kinescope.ru/embed/player-demo-3",
      fileUrls: ["/files/karma-tails-handbook.pdf"],
      order: 3,
      courseId: numCourse.id,
    },
    {
      title: "Канал отношений и Денежный канал в Матрице",
      description: "Глубокий анализ материального благополучия и сферы личной жизни. Изучаем входы в денежный канал и канал отношений, а также то, как активировать эти зоны.",
      videoUrl: "https://kinescope.ru/embed/player-demo-4",
      fileUrls: ["/files/money-and-love-activations.pdf"],
      order: 4,
      courseId: numCourse.id,
    },
  ];

  for (const lesson of numLessons) {
    await prisma.lesson.create({
      data: lesson,
    });
  }

  // 5. Добавление уроков для курса «Таро для начинающих. Старшие Арканы»
  const tarotLessons = [
    {
      title: "Введение в Таро: История, Этика и Выбор колоды",
      description: "Первые шаги в мире Таро. Разбираем, как выбрать свою первую колоду Райдера-Уэйта, как её подготовить к работе и какие базовые правила безопасности существуют.",
      videoUrl: "https://kinescope.ru/embed/player-demo-5",
      fileUrls: ["/files/tarot-intro-guide.pdf"],
      order: 1,
      courseId: tarotCourse.id,
    },
    {
      title: "Путешествие Дурака: Разбор Арканов от 0 до VII",
      description: "Изучение первых 8 Старших Арканов Таро: от Дурака до Колесницы. Погружаемся в глубинные архетипы, психологические и событийные значения в раскладах.",
      videoUrl: "https://kinescope.ru/embed/player-demo-6",
      fileUrls: ["/files/arcana-0-7-cheat-sheet.pdf"],
      order: 2,
      courseId: tarotCourse.id,
    },
    {
      title: "Духовные испытания: Разбор Арканов от VIII до XIV",
      description: "Изучение срединной части пути Старших Арканов: Сила, Отшельник, Колесо Фортуны, Справедливость, Повешенный, Смерть, Умеренность.",
      videoUrl: "https://kinescope.ru/embed/player-demo-7",
      fileUrls: ["/files/arcana-8-14-cheat-sheet.pdf"],
      order: 3,
      courseId: tarotCourse.id,
    },
  ];

  for (const lesson of tarotLessons) {
    await prisma.lesson.create({
      data: lesson,
    });
  }

  console.log("Все уроки для курсов успешно добавлены.");
  console.log("Сидирование базы данных завершено успешно!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Ошибка в процессе сидирования:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
