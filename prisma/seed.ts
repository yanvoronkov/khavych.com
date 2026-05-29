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
      imageUrl: "/bracelet1.webp",
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
      imageUrl: "/bracelet2.webp",
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
      imageUrl: "/bracelet3.webp",
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
      imageUrl: "/bracelet4.webp",
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
      imageUrl: "/bracelet5.webp",
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

    // --- УСЛУГИ (4 НАПРАВЛЕНИЯ — ВСЕГО 31 УСЛУГА) ---
    // === НУМЕРОЛОГИЯ (NUMEROLOGY) ===
    {
      id: "service-num-analysis",
      name: {
        ru: "Полный нумерологический анализ и самореализация",
        de: "Vollständige numerologische Analyse und Selbstrealisierung"
      },
      description: {
        ru: "Глубокий анализ вашей карты по дате рождения. Определение сильных сторон, жизненных ориентиров и путей раскрытия вашего потенциала.",
        de: "Eine tiefgehende Analyse Ihrer Geburtskarte. Bestimmung von Stärken, Lebenszielen und Wegen zur Entfaltung Ihres Potenzials."
      },
      price: 85.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Глубокий анализ предназначения", "Определение сильных сторон личности", "PDF-отчет с подробным разбором"],
        de: ["Tiefgehende Analyse der Lebensaufgabe", "Bestimmung der persönlichen Stärken", "PDF-Bericht mit detaillierter Analyse"]
      }
    },
    {
      id: "service-num-portrait",
      name: {
        ru: "Полный психологический портрет вашей личности",
        de: "Vollständiges psychologisches Persönlichkeitsprofil"
      },
      description: {
        ru: "Детальный разбор психологических особенностей характера, скрытых блоков, внутренних ресурсов и паттернов поведения.",
        de: "Detaillierte Analyse psychologischer Charaktereigenschaften, verborgener Blockaden, innerer Ressourcen und Verhaltensmuster."
      },
      price: 90.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Анализ поведенческих паттернов", "Выявление скрытых внутренних ресурсов", "Практические рекомендации психотипа"],
        de: ["Analyse der Verhaltensmuster", "Erkennung verborgener Ressourcen", "Praktische Empfehlungen für den Psychotyp"]
      }
    },
    {
      id: "service-num-love",
      name: {
        ru: "Партнерские отношения и любовь",
        de: "Beziehungsnumerologie: Partnerschaft und Liebe"
      },
      description: {
        ru: "Анализ совместимости пары по датам рождения. Выявление точек соприкосновения, возможных кризисов и рекомендаций для гармонии.",
        de: "Kompatibilitätsanalyse des Paares nach Geburtsdaten. Identifizierung von Berührungspunkten, potenziellen Krisen und Tipps für Harmonie."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Анализ совместимости по датам рождения", "Прогноз кризисных периодов пары", "Рекомендации по гармонизации отношений"],
        de: ["Kompatibilitätsanalyse nach Geburtsdaten", "Prognose von Krisenphasen des Paares", "Tipps zur Harmonisierung der Beziehung"]
      }
    },
    {
      id: "service-num-destiny",
      name: {
        ru: "Нумерологический анализ: Предназначение",
        de: "Numerologische Analyse: Lebensaufgabe & Bestimmung"
      },
      description: {
        ru: "Определение ваших главных кармических задач, социального и духовного предназначения в этой жизни.",
        de: "Bestimmung Ihrer wichtigsten karmischen Aufgaben sowie Ihrer sozialen und spirituellen Lebensbestimmung."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Определение социального предназначения", "Выявление духовных задач души", "Понимание кармических уроков"],
        de: ["Bestimmung der sozialen Lebensaufgabe", "Erkennung der spirituellen Seelenaufgaben", "Verständnis karmischer Lektionen"]
      }
    },
    {
      id: "service-num-partner-matrix",
      name: {
        ru: "Матрица для партнеров",
        de: "Tiefenanalyse: Matrix für Partner"
      },
      description: {
        ru: "Максимально детальный анализ совместной матрицы пары. Кармические уроки, финансовые каналы союза и задачи души в партнерстве.",
        de: "Maximale Detailanalyse der gemeinsamen Matrix eines Paares. Karmische Lektionen, finanzielle Kanäle der Verbindung und Seelenaufgaben."
      },
      price: 245.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Максимальный детальный разбор союза", "Кармические задачи в паре", "Финансовые каналы семейного эгрегора"],
        de: ["Maximale Detailanalyse der Verbindung", "Karmische Aufgaben im Paar", "Finanzkanäle des familiären Egregors"]
      }
    },
    {
      id: "service-num-child-full",
      name: {
        ru: "Полный разбор матрицы ребенка: таланты, профпуть и навыки",
        de: "Vollständige Kindermatrix-Analyse: Talente, Berufsweg & Fähigkeiten"
      },
      description: {
        ru: "Комплексный анализ детской матрицы. Определение врожденных талантов, подходящих направлений развития и способов гармоничного воспитания.",
        de: "Umfassende Analyse der Kindermatrix. Bestimmung angeborener Talente, geeigneter Entwicklungswege und Methoden für eine harmonische Erziehung."
      },
      price: 120.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Определение врожденных талантов ребенка", "Анализ профессионального пути", "Советы родителям по мягкому воспитанию"],
        de: ["Bestimmung angeborener Kindertalente", "Analyse des zukünftigen Berufsweges", "Elternratgeber für eine sanfte Erziehung"]
      }
    },
    {
      id: "service-num-patterns",
      name: {
        ru: "Анализ сценариев: Почему повторяется один и тот же сценарий в отношениях",
        de: "Szenarioanalyse: Warum sich dasselbe Beziehungsmuster wiederholt"
      },
      description: {
        ru: "Выявление глубинных кармических причин повторяющихся неудач в любви и практические рекомендации по выходу из замкнутого круга.",
        de: "Identifizierung einer tiefen karmischen Ursache für wiederkehrende Enttäuschungen in der Liebe und praktische Tipps zum Ausbrechen."
      },
      price: 85.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Выявление кармических причин повторений", "Анализ психологических триггеров", "Индивидуальный plan выхода из сценария"],
        de: ["Erkennung karmischer Ursachen der Wiederholung", "Analyse psychologischer Trigger", "Individueller Plan zum Durchbrechen des Musters"]
      }
    },
    {
      id: "service-num-loneliness",
      name: {
        ru: "Разбор причин одиночества",
        de: "Analyse der Ursachen des Alleinseins"
      },
      description: {
        ru: "Анализ внутренних блоков, страхов и кармических препятствий, мешающих создать счастливые и гармоничные отношения.",
        de: "Analyse innerer Blockaden, Ängste und karmischer Hindernisse, die dem Aufbau glücklicher Beziehungen im Wege stehen."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Поиск подсознательных блоков и страхов", "Анализ кармических препятствий", "Рекомендации по привлечению партнера"],
        de: ["Suche nach unterbewussten Ängsten & Blockaden", "Analyse karmischer Hindernisse", "Empfehlungen zur Anziehung des Partners"]
      }
    },
    {
      id: "service-num-conception",
      name: {
        ru: "Вопросы зачатия: что необходимо прорабатывать",
        de: "Empfängnisfragen: Was energetisch zu bearbeiten ist"
      },
      description: {
        ru: "Нумерологический анализ энергетических и психологических причин задержки материнства, рекомендации по гармонизации.",
        de: "Numerologische Analyse energetischer und psychologischer Ursachen für eine verzögerte Mutterschaft, Tipps zur Harmonisierung."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Анализ энергетического баланса организма", "Выявление психосоматических блоков", "Советы по раскрытию материнской энергии"],
        de: ["Analyse der energetischen Balance", "Erkennung psychosomatischer Blockaden", "Tipps zur Entfaltung der mütterlichen Energie"]
      }
    },
    {
      id: "service-num-years-forecast",
      name: {
        ru: "Прогноз и планирование: Следующие 5, 10, 15 лет",
        de: "Prognose & Planung: Die nächsten 5, 10, 15 Jahre"
      },
      description: {
        ru: "Анализ долгосрочных жизненных циклов, ключевых периодов возможностей и спадов для выстраивания эффективной стратегии жизни.",
        de: "Analyse langfristiger Lebenszyklen, wichtiger Chancen- und Krisenphasen zur Entwicklung einer effektiven Lebensstrategie."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Расчет долгосрочных жизненных циклов", "Прогноз периодов взлетов и спадов", "Рекомендации по планированию ключевых шагов"],
        de: ["Berechnung langfristiger Lebenszyklen", "Prognose von Höhen und Tiefen", "Empfehlungen zur Planung wichtiger Lebensschritte"]
      }
    },
    {
      id: "service-num-finances",
      name: {
        ru: "Финансовый нумерологический анализ: Денежный потенциал",
        de: "Finanzielle numerologische Analyse: Geldpotenzial"
      },
      description: {
        ru: "Детальный анализ вашего финансового канала по дате рождения. Рекомендации по выбору сфер деятельности и преодолению блоков бедности.",
        de: "Detaillierte Analyse Ihres Finanzkanals nach Geburtsdatum. Empfehlungen zur Berufswahl und Überwindung von Blockaden."
      },
      price: 90.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Полный анализ финансового канала", "Подбор успешных сфер для бизнеса", "Устранение подсознательных блоков бедности"],
        de: ["Vollständige Analyse des Finanzkanals", "Auswahl erfolgreicher Geschäftsfelder", "Beseitigung unterbewusster Geldblockaden"]
      }
    },
    {
      id: "service-num-child-simple",
      name: {
        ru: "Простая матрица ребенка",
        de: "Einfache Kindermatrix"
      },
      description: {
        ru: "Базовый разбор характера, темперамента и основных талантов ребенка для лучшего взаимопонимания родителей с детьми.",
        de: "Basis-Analyse von Charakter, Temperament und den wichtigsten Talenten des Kindes для лучшего взаимопонимания родителей с детьми."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-numerology.webp",
      category: "CONSULTATION" as const,
      subCategory: "NUMEROLOGY",
      isAvailable: true,
      features: {
        ru: ["Базовый разбор темперамента и характера", "Выявление ключевых детских способностей", "Простые советы по общению с ребенком"],
        de: ["Basis-Analyse von Temperament & Charakter", "Erkennung der wichtigsten Kinderfähigkeiten", "Einfache Tipps zur Kommunikation mit dem Kind"]
      }
    },

    // === КАРТЫ ТАРО (TAROT) ===
    {
      id: "service-tarot-love-diag",
      name: {
        ru: "Расклад Таро: Партнерские отношения, любовь и текущая ситуация",
        de: "Tarot-Legung: Partnerschaft, Liebe und aktuelle Situation"
      },
      description: {
        ru: "Диагностика текущего состояния отношений, чувств партнеров, возможных перспектив развития союза и скрытых факторов.",
        de: "Diagnose des aktuellen Beziehungsstatus, der Gefühle der Partner, der Entwicklungsperspektiven und verborgener Faktoren."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-tarot.webp",
      category: "CONSULTATION" as const,
      subCategory: "TAROT",
      isAvailable: true,
      features: {
        ru: ["Диагностика мыслей и чувств партнера", "Анализ скрытых мотивов и перспектив", "Рекомендации карт по улучшению союза"],
        de: ["Diagnose der Gedanken und Gefühle des Partners", "Analyse verborgener Motive & Perspektiven", "Kartenempfehlungen zur Verbesserung der Ehe"]
      }
    },
    {
      id: "service-tarot-yes-no",
      name: {
        ru: "Расклад Таро: Вопрос Да/Нет",
        de: "Tarot-Legung: Ja/Nein-Frage"
      },
      description: {
        ru: "Быстрый и точный ответ карт Таро на один конкретный жизненный вопрос с пояснением причин и возможных исходов.",
        de: "Schnelle und präzise Antwort der Tarotkarten auf eine konkrete Lebensfrage mit Erläuterung der Ursachen und Optionen."
      },
      price: 40.0,
      oldPrice: null,
      imageUrl: "/images/service-tarot.webp",
      category: "CONSULTATION" as const,
      subCategory: "TAROT",
      isAvailable: true,
      features: {
        ru: ["Быстрый и точный ответ на один вопрос", "Анализ причин текущего положения дел", "Совет карт для принятия верного решения"],
        de: ["Schnelle, präzise Antwort auf eine Frage", "Analyse der Ursachen der aktuellen Situation", "Rat der Karten zur richtigen Entscheidung"]
      }
    },
    {
      id: "service-tarot-fin-crisis",
      name: {
        ru: "Расклад Таро: Причина финансового кризиса и финансовый потолок",
        de: "Tarot-Legung: Ursache der Finanzkrise & Blockaden im Geldfluss"
      },
      description: {
        ru: "Глубокий анализ причин материальных трудностей, диагностика энергетических блоков и рекомендации карт для роста доходов.",
        de: "Tiefenanalyse materieller Probleme, Diagnose energetischer Blockaden und Kartenempfehlungen zur Steigerung des Einkommens."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-tarot.webp",
      category: "CONSULTATION" as const,
      subCategory: "TAROT",
      isAvailable: true,
      features: {
        ru: ["Глубокий разбор материальных трудностей", "Диагностика блоков в финансовом канале", "Рекомендации карт для роста заработка"],
        de: ["Tiefgehende Analyse materieller Krisen", "Diagnose von Blockaden im Finanzkanal", "Kartenempfehlungen zur Einkommenssteigerung"]
      }
    },
    {
      id: "service-tarot-job-change",
      name: {
        ru: "Расклад Таро: Будущее место работы и смена карьеры (4 карты)",
        de: "Tarot-Legung: Zukünftiger Arbeitsplatz & Karrierewechsel (4 Karten)"
      },
      description: {
        ru: "Анализ перспектив на текущей работе и шансов на новом месте. Расклад из 4 карт поможет принять верное карьерное решение.",
        de: "Analyse der Perspektiven im aktuellen Job und der Chancen am neuen Ort. Die Legung aus 4 Karten hilft bei der Karriereentscheidung."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-tarot.webp",
      category: "CONSULTATION" as const,
      subCategory: "TAROT",
      isAvailable: true,
      features: {
        ru: ["Разбор перспектив на старом/новом месте", "Анализ рисков при увольнении", "Пошаговый расклад из 4 карт Таро"],
        de: ["Chancenanalyse am alten/neuen Arbeitsplatz", "Risikoanalyse bei einer Kündigung", "Schritt-für-Schritt-Legung aus 4 Tarotkarten"]
      }
    },
    {
      id: "service-tarot-month-forecast",
      name: {
        ru: "Расклад Таро: Прогноз на следующий месяц",
        de: "Tarot-Legung: Prognose für den kommenden Monat"
      },
      description: {
        ru: "Ежемесячный прогноз ключевых событий, трудностей и благоприятных возможностей в сферах карьеры, здоровья и любви.",
        de: "Monatsprognose wichtiger Ereignisse, Herausforderungen und Chancen in den Bereichen Karriere, Gesundheit und Liebe."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-tarot.webp",
      category: "CONSULTATION" as const,
      subCategory: "TAROT",
      isAvailable: true,
      features: {
        ru: ["Ежемесячный точный прогноз событий", "Анализ сфер карьеры, здоровья и любви", "Советы карт и предостережения на месяц"],
        de: ["Präzise Monatsprognose aller Ereignisse", "Analyse der Karriere, Gesundheit & Liebe", "Ratschläge und Warnungen für den Monat"]
      }
    },
    {
      id: "service-tarot-year-forecast",
      name: {
        ru: "Расклад Таро: Прогноз на следующий год",
        de: "Tarot-Legung: Prognose für das kommende Jahr"
      },
      description: {
        ru: "Масштабный годовой расклад по 12 домам жизни. Ключевые тенденции, советы карт и предостережения на ближайшие 12 месяцев.",
        de: "Große Jahreslegung für alle 12 Lebensbereiche. Wichtige Trends, Ratschläge der Karten und Warnungen für die nächsten 12 Monate."
      },
      price: 90.0,
      oldPrice: null,
      imageUrl: "/images/service-tarot.webp",
      category: "CONSULTATION" as const,
      subCategory: "TAROT",
      isAvailable: true,
      features: {
        ru: ["Масштабный расклад по 12 домам жизни", "Главные годовые тенденции и уроки", "Предостережения и советы на 12 месяцев"],
        de: ["Große Legung für alle 12 Lebensbereiche", "Wichtigste Jahrestrends und Lektionen", "Warnungen und Tipps für die nächsten 12 Monate"]
      }
    },

    // === ВОСКОВЫЕ ОТЛИВКИ (WAX) ===
    {
      id: "service-wax-diagnostics",
      name: {
        ru: "Восковая отливка: Диагностика и чакральная диагностика",
        de: "Wachsguss: Diagnostik und Chakren-Diagnose"
      },
      description: {
        ru: "Выявление скрытых энергетических воздействий, негативных программ и сбоев в работе чакр с помощью отливки воском.",
        de: "Erkennung verborgener energetischer Einflüsse, negativer Muster und Störungen im Chakrensystem mithilfe von Wachsguss."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-wax.webp",
      category: "CONSULTATION" as const,
      subCategory: "WAX",
      isAvailable: true,
      features: {
        ru: ["Выявление скрытых негативных влияний", "Полный аудит работы всех чакр", "Отливка пчелиным воском по фотографии"],
        de: ["Erkennung verborgener negativer Einflüsse", "Umfassendes Audit aller Energiezentren", "Bienenwachsguss per Foto mit Analyse"]
      }
    },
    {
      id: "service-wax-cleaning",
      name: {
        ru: "Восковая чистка всех 7 чакр",
        de: "Wachsbasiertes Reinigen aller 7 Chakren"
      },
      description: {
        ru: "Глубокое очищение всей энергетической системы человека от накопленных блоков, застоев энергии и внешнего негатива.",
        de: "Tiefenreinigung des gesamten menschlichen Energiesystems von Blockaden, gestauten Energien und fremden Negativitäten."
      },
      price: 90.0,
      oldPrice: null,
      imageUrl: "/images/service-wax.webp",
      category: "CONSULTATION" as const,
      subCategory: "WAX",
      isAvailable: true,
      features: {
        ru: ["Глубокая чистка энергетических центров", "Устранение застоев жизненных сил", "Снятие внешнего ментального негатива"],
        de: ["Tiefenreinigung der Energiezentren", "Beseitigung von Stauungen der Lebenskraft", "Entfernung äußerer mentaler Negativität"]
      }
    },
    {
      id: "service-wax-filling",
      name: {
        ru: "Наполнение всех 7 чакр энергией",
        de: "Aufladung aller 7 Chakren mit Lebensenergie"
      },
      description: {
        ru: "Мягкое восковое и программное наполнение чакральной системы чистой жизненной силой для укрепления тонуса и здоровья.",
        de: "Sanfte Aufladung des Chakrensystems mit Lebensenergie zur Stärkung der Vitalität und Gesundheit nach dem Wachsguss."
      },
      price: 60.0,
      oldPrice: null,
      imageUrl: "/images/service-wax.webp",
      category: "CONSULTATION" as const,
      subCategory: "WAX",
      isAvailable: true,
      features: {
        ru: ["Наполнение чакр чистой силой жизни", "Укрепление физического тонуса тела", "Повышение иммунитета и бодрости"],
        de: ["Aufladung der Chakren mit Lebensenergie", "Stärkung der körperlichen Vitalität", "Stärkung der Immunität und der Frische"]
      }
    },
    {
      id: "service-wax-candles",
      name: {
        ru: "Снятие негатива и деструктивных программ свечами",
        de: "Beseitigung von Negativität & destruktiven Programmen durch Energiekerzen"
      },
      description: {
        ru: "Мощная практика очищения биополя от сглазов, порч, бытового негатива и разрушающих ментальных установок с помощью программных свечей.",
        de: "Starke Praxis zur Reinigung des Biofeldes von negativen Einflüssen und zerstörerischen Mustern mithilfe von programmierten Kerzen."
      },
      price: 70.0,
      oldPrice: null,
      imageUrl: "/images/service-wax.webp",
      category: "CONSULTATION" as const,
      subCategory: "WAX",
      isAvailable: true,
      features: {
        ru: ["Очищение ауры программными свечами", "Разрушение ментальных блоков и сглазов", "Восстановление защитной оболочки биополя"],
        de: ["Aura-Reinigung mit programmierten Kerzen", "Zerstörung mentaler Blockaden & Fremdeinflüsse", "Wiederherstellung der Schutzhülle des Biofeldes"]
      }
    },
    {
      id: "service-wax-ties",
      name: {
        ru: "Снятие деструктивных энергетических привязок",
        de: "Lösung energetischer Bindungen (Ex-Partner, Groll, alte Konflikte)"
      },
      description: {
        ru: "Энергетический обрыв связей с прошлыми партнерами, проработка застарелых обид, ссор и травмирующего общения для обретения свободы.",
        de: "Energetisches Durchtrennen von Bindungen zu Ex-Partnern, Aufarbeitung von Groll und Konflikten für emotionale Freiheit."
      },
      price: 90.0,
      oldPrice: null,
      imageUrl: "/images/service-wax.webp",
      category: "CONSULTATION" as const,
      subCategory: "WAX",
      isAvailable: true,
      features: {
        ru: ["Обрыв привязок к прошлым партнерам", "Очищение от старых ссор и обид", "Обретение внутренней легкости и свободы"],
        de: ["Lösen von Verbindungen zu Ex-Partnern", "Bereinigung alter Konflikte und Verletzungen", "Erlangung innerer Leichtigkeit und Freiheit"]
      }
    },

    // === ЛАДОВАНИЕ (LADING) ===
    {
      id: "service-lad-after-clean",
      name: {
        ru: "Ладование: Наполнение энергией после чисток",
        de: "Lading: Energieaufladung nach energetischen Reinigungen"
      },
      description: {
        ru: "Практика бережного восстановления жизненных сил и гармонизации ауры сразу после проведения очищающих сеансов.",
        de: "Praxis zur schonenden Wiederherstellung der Lebenskräfte und Harmonisierung der Aura direkt nach Reinigungssitzungen."
      },
      price: 40.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Восстановление ауры после сеансов чистки", "Мягкое наполнение чистыми потоками сил", "Закрепление положительного результата"],
        de: ["Wiederherstellung der Aura nach Reinigungen", "Sanfte Aufladung mit positiver Lebenskraft", "Festigung der positiven Wirkung"]
      }
    },
    {
      id: "service-lad-finance",
      name: {
        ru: "Ладование: На финансовую стабильность",
        de: "Lading: Für finanzielle Stabilität"
      },
      description: {
        ru: "Гармонизация денежного канала, привлечение стабильного потока благополучия и устранение внутренних страхов бедности.",
        de: "Harmonisierung des Geldkanals, Anziehung eines stabilen Wohlstandsflusses und Beseitigung innerer Ängste vor Mangel."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Гармонизация вашего денежного канала", "Привлечение стабильного благополучия", "Устранение страхов нехватки средств"],
        de: ["Harmonisierung Ihres Geldkanals", "Anziehung von stabilem Wohlstand", "Beseitigung von Mangelängsten"]
      }
    },
    {
      id: "service-lad-ways",
      name: {
        ru: "Ладование: На открытие дорог и возможностей",
        de: "Lading: Zur Wegöffnung (Studium, Business, Partnerwahl)"
      },
      description: {
        ru: "Энергетическая поддержка новых начинаний, устранение препятствий перед поступлением, стартом бизнеса или важным выбором.",
        de: "Energetische Unterstützung für Neuanfänge, Beseitigung von Hindernissen vor dem Studium, Business-Start oder wichtiger Partnerwahl."
      },
      price: 60.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Поддержка детей при поступлении в ВУЗы", "Энергетический импульс для нового бизнеса", "Помощь в правильном выборе партнера"],
        de: ["Energie-Support für Jugendliche vor dem Studium", "Energetischer Impuls für einen Business-Start", "Hilfe bei der richtigen Partnerwahl"]
      }
    },
    {
      id: "service-lad-chakras",
      name: {
        ru: "Энергетическое ладование чакральной системы",
        de: "Energetisches Lading des Chakrensystems"
      },
      description: {
        ru: "Комплексная балансировка и выравнивание всех энергетических центров для достижения душевного равновесия и здоровья.",
        de: "Umfassende Balancierung und Ausrichtung aller Energiezentren für seelisches Gleichgewicht und körperliche Gesundheit."
      },
      price: 90.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Комплексное выравнивание всех 7 центров", "Достижение глубокого душевного баланса", "Укрепление иммунной системы организма"],
        de: ["Komplettes Ausrichten aller 7 Zentren", "Erlangung tiefen seelischen Gleichgewichts", "Stärkung des Immunsystems des Körpers"]
      }
    },
    {
      id: "service-lad-beauty",
      name: {
        ru: "Ладование: На красоту и любовь",
        de: "Lading: Für Schönheit und Liebe"
      },
      description: {
        ru: "Раскрытие природного магнетизма, женственности, уверенности в себе и привлечение романтических отношений.",
        de: "Entfaltung des natürlichen Magnetismus, der Weiblichkeit, des Selbstvertrauens und Anziehung romantischer Beziehungen."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Раскрытие женственности и магнетизма", "Повышение уверенности и любви к себе", "Энергия привлечения счастливых отношений"],
        de: ["Entfaltung von Weiblichkeit & Magnetismus", "Steigerung des Selbstvertrauens", "Energie zur Anziehung glücklicher Beziehungen"]
      }
    },
    {
      id: "service-lad-health",
      name: {
        ru: "Ладование: На восстановление здоровья",
        de: "Lading: Zur Wiederherstellung der Gesundheit"
      },
      description: {
        ru: "Направление исцеляющих энергетических потоков для регенерации сил, ускорения выздоровления и укрепления иммунитета.",
        de: "Ausrichtung heilender Energieflüsse zur Regeneration der Kräfte, Beschleunigung der Genesung und Stärkung des Immunsystems."
      },
      price: 55.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Активация восстановительных процессов", "Ускорение реабилитации после болезней", "Прилив сил, бодрости и ясности разума"],
        de: ["Aktivierung der Selbstheilungskräfte", "Schnellere Regeneration nach Krankheiten", "Zustrom an Vitalität, Leichtigkeit und Klarheit"]
      }
    },
    {
      id: "service-lad-business",
      name: {
        ru: "Ладование: На успех в бизнесе и работе",
        de: "Lading: Für Erfolg in Business & Arbeit"
      },
      description: {
        ru: "Энергетическое сопровождение бизнес-процессов, привлечение надежных клиентов, выгодных контрактов и карьерного роста.",
        de: "Energetische Begleitung von Geschäftsprozessen, Gewinnung zuverlässiger Kunden, profitabler Verträge und Karrierewachstum."
      },
      price: 80.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Энергетическое сопровождение бизнеса", "Привлечение денежных клиентов и заказов", "Поддержка в карьерном продвижении"],
        de: ["Energetische Begleitung des Business", "Anziehung zahlungskräftiger Kunden & Anträge", "Unterstützung beim beruflichen Aufstieg"]
      }
    },
    {
      id: "service-lad-express",
      name: {
        ru: "Наполнение энергией (воск, свечи, здоровье, финансы, отношения)",
        de: "Energieaufladung (Wachs, Kerzen, Gesundheit, Finanzen, Beziehungen)"
      },
      description: {
        ru: "Экспресс-восстановление и гармонизация энергетики в трех ключевых сферах жизни с помощью воска и программных свечей.",
        de: "Express-Wiederherstellung und Harmonisierung der Energie in drei wichtigen Lebensbereichen durch Wachs und programmierte Kerzen."
      },
      price: 35.0,
      oldPrice: null,
      imageUrl: "/images/service-lading.webp",
      category: "CONSULTATION" as const,
      subCategory: "LADING",
      isAvailable: true,
      features: {
        ru: ["Экспресс-восстановление в 3 сферах жизни", "Проработка здоровья, финансов и любви", "Практика с воском и программными свечами"],
        de: ["Express-Aufladung in 3 Lebensbereichen", "Bearbeitung von Gesundheit, Finanzen & Liebe", "Praxis mit Wachs und programmierten Kerzen"]
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
