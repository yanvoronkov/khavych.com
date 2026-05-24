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
      name: "Амулетный браслет «Финансовый поток»",
      description: "Авторский браслет из натуральных камней (пирит, цитрин, тигровый глаз) с индивидуальным нумерологическим кодом богатства на золотой фурнитуре. Помогает открыть новые источники дохода и привлечь удачу.",
      price: 4900,
      imageUrl: "/images/bracelet-financial.jpg",
      category: "BRACELET" as const,
      isAvailable: true,
    },
    {
      id: "bracelet-2",
      name: "Энергетический браслет «Гармония 7 Чакр»",
      description: "Сбалансированное сочетание семи священных камней (аметист, лазурит, бирюза, императорская яшма, тигровый глаз, янтарь, сердолик) для очищения, гармонизации и наполнения жизненной силой всех энергетических центров.",
      price: 3800,
      imageUrl: "/images/bracelet-chakras.jpg",
      category: "BRACELET" as const,
      isAvailable: true,
    },
    {
      id: "bracelet-3",
      name: "Браслет-оберег «Защита и Сила»",
      description: "Мощный оберег из черного турмалина (шерла) и матового шунгита. Нейтрализует негативные энергетические воздействия, укрепляет биополе, придает уверенность и внутреннюю стабильность.",
      price: 4200,
      imageUrl: "/images/bracelet-protection.jpg",
      category: "BRACELET" as const,
      isAvailable: true,
    },
    {
      id: "course-1",
      name: "Курс «Практическая Нумерология. Матрица Судьбы»",
      description: "Глубокая авторская программа обучения нумерологии. С нуля научитесь рассчитывать и анализировать судьбу человека, кармические узлы, финансовый потенциал и совместимость в отношениях.",
      price: 18900,
      imageUrl: "/images/course-numerology.jpg",
      category: "COURSE" as const,
      isAvailable: true,
    },
    {
      id: "course-2",
      name: "Курс «Таро для начинающих. Старшие Арканы»",
      description: "Пошаговый курс по глубокому изучению 22 Старших Арканов Таро. Вы изучите архетипы карт, научитесь делать точные расклады на любые жизненные вопросы без зубрежки значений.",
      price: 14500,
      imageUrl: "/images/course-tarot.jpg",
      category: "COURSE" as const,
      isAvailable: true,
    },
    {
      id: "consultation-1",
      name: "Индивидуальный Нумерологический разбор матрицы",
      description: "Полная консультация Ольги Хавич по вашей дате рождения (1.5-2 часа, онлайн). Подробный анализ вашего жизненного предназначения, скрытых талантов, кармических задач и рекомендаций на текущий период.",
      price: 8500,
      imageUrl: "/images/consultation-matrix.jpg",
      category: "CONSULTATION" as const,
      isAvailable: true,
    },
    {
      id: "consultation-2",
      name: "Чакродиагностика и Энергетическое ладование",
      description: "Комплексная сессия по диагностике ваших энергетических центров (чакр), выявлению блоков и зажимов, с последующим мягким восковым ладованием и восстановлением целостности ауры.",
      price: 6000,
      imageUrl: "/images/consultation-energy.jpg",
      category: "CONSULTATION" as const,
      isAvailable: true,
    },
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
