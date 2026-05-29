"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Тип поддерживаемых языков (легко расширяется в будущем, например 'ru' | 'de' | 'en')
export type Language = "ru" | "de";

// Словарь статических переводов для всего сайта khavich.com
const translations = {
  ru: {
    common: {
      loading: "Загрузка...",
      error: "Произошла ошибка",
      save: "Сохранить",
      cancel: "Отмена",
      back: "Назад",
    },
    header: {
      home: "Главная",
      shop: "Магазин",
      about: "Обо мне",
      services: "Услуги",
      testimonials: "Отзывы",
      certificates: "Сертификаты",
      cabinet: "Кабинет",
      ariaMenu: "Открыть меню",
      ariaCart: "Открыть корзину",
    },
    cart: {
      title: "Корзина",
      empty: "Ваша корзина пуста",
      continueShopping: "Продолжить покупки",
      price: "Цена",
      quantity: "Количество",
      total: "Сумма к оплате",
      checkout: "Оформить заказ",
      itemsCount: "товаров",
    },
    auth: {
      loginTitle: "Вход в личный кабинет",
      registerTitle: "Регистрация нового ученика",
      phone: "Номер телефона",
      email: "Ваш Email",
      emailPlaceholder: "example@example.com",
      passwordPlaceholder: "••••••",
      password: "Пароль",
      name: "Ваше Имя",
      namePlaceholder: "Иван Иванов",
      confirmPassword: "Подтвердите пароль",
      passwordMinLength: "Минимум 6 символов",
      submitLogin: "Войти в кабинет",
      submitLoginPending: "Вход...",
      submitRegister: "Зарегистрироваться",
      submitRegisterPending: "Регистрация...",
      noAccount: "Еще нет аккаунта?",
      hasAccount: "Уже есть аккаунт?",
      goToRegister: "Зарегистрироваться",
      goToLogin: "Войти в кабинет",
      validationPhone: "Введите корректный номер телефона",
      validationPassword: "Пароль должен быть не менее 6 символов",
      validationName: "Имя должно содержать не менее 2 символов",
      loginError: "Неверный Email или пароль",
      registerError: "Ошибка при регистрации",
      genericError: "Произошла непредвиденная ошибка",
      errorPasswordMismatch: "Пароли не совпадают",
      regSuccessTitle: "Регистрация успешна!",
      regSuccessDesc: "Вы успешно зарегистрировались. Сейчас вы будете перенаправлены на страницу входа...",
      goToLoginManual: "Перейти к входу вручную",
    },
    cabinet: {
      title: "Личный кабинет",
      welcome: "Добро пожаловать",
      myCourses: "Мои курсы",
      myOrders: "История заказов",
      logout: "Выйти из кабинета",
      accessUntil: "Доступ до",
      expired: "Срок действия истек",
      courseDetails: "Подробнее о курсе",
      noCourses: "У вас пока нет доступных курсов. Вы можете приобрести их в нашем магазине.",
      goToShop: "Перейти в магазин",
      orderNumber: "Заказ №",
      orderStatus: "Статус",
      orderDate: "Дата",
      orderTotal: "Сумма",
      statusPending: "Ожидает оплаты",
      statusPaid: "Оплачен",
      statusCancelled: "Отменен",
      backToCabinet: "Вернуться в кабинет",
      lessonsList: "Список уроков",
      lessonNum: "Урок",
      certificateBtn: "Получить сертификат",
      certificateSectionTitle: "🏆 Завершение обучения",
      certificateIssuedText: "Ваш именной сертификат об окончании курса успешно сформирован и сохранен.",
      downloadCertificateBtn: "📥 Скачать сертификат (PDF)",
      reissueCertificateBtn: "✏️ Изменить имя / Перевыпустить",
      certificatePromoText: "После окончания курса вы можете выпустить официальный именной сертификат школы Ольги Хавич.",
      issueCertificateBtn: "🎓 Выдать сертификат",
      certModalTitle: "Получение именного сертификата",
      certModalDesc: "Пожалуйста, введите ваше имя. Оно мгновенно отобразится на бланке предпросмотра ниже. Перед созданием PDF убедитесь, что имя написано без опечаток.",
      certInputLabel: "Ваше имя и фамилия",
      certInputPlaceholder: "Например, Екатерина Смирнова",
      certPreviewLabel: "Живой предпросмотр сертификата",
      certCancelBtn: "Отмена",
      certConfirmBtn: "🏆 Подтвердить и выдать сертификат",
      certGeneratingText: "Выдача сертификата...",
      certStep1: "Подготовка макета сертификата...",
      certStep2: "Отрисовка бланка в высоком разрешении...",
      certStep3: "Создание PDF-документа...",
      certStep4: "Сохранение в вашем личном кабинете...",
      certStep5: "Скачивание файла...",
      certSuccessTitle: "Поздравляем! Ваш сертификат готов",
      certSuccessText: "Именной сертификат о завершении курса успешно сформирован. Файл скачался на ваше устройство, а также сохранен в личном кабинете.",
      certSuccessOpen: "📥 Открыть / Скачать PDF",
      certSuccessClose: "Закрыть окно",
      certSchoolName: "Школа Духовного развития Ольги Хавич",
      certDocTitle: "Сертификат",
      certDocConfirm: "настоящим подтверждается, что",
      certDocCourseText: "успешно прошел(ла) обучение и завершил(а) программу курса",
      certDocDate: "Дата выдачи",
      certDocTeacher: "Преподаватель",
      certDocTeacherName: "Ольга Хавич",
      certDocDefaultName: "Имя Фамилия",
    },
    shop: {
      title: "Магазин практик и курсов",
      subtitle: "Авторские методики Ольги Хавич для гармонизации жизни",
      all: "Все предложения",
      consultations: "Консультации",
      bracelets: "Браслеты силы",
      courses: "Курсы и инициации",
      addToCart: "В корзину",
      inCart: "В корзине",
      featuresTitle: "Что входит:",
    },
    hero: {
      subtitle: "Ольга Хавич",
      title: "Сертифицированный Нумеролог, Таролог и Энерготерапевт",
      desc: "Помогаю найти ответы на жизненные вопросы, раскрыть ваш потенциал, гармонизировать энергетику и открыть пути к благополучию с помощью древних знаний и авторских методик.",
      cta: "Подобрать услугу",
    },
    quiz: {
      title: "Подберите идеальную практику за 1 минуту",
      subtitle: "Ответьте на 3 простых вопроса, и наша система порекомендует лучший инструмент для решения вашей текущей задачи.",
      question1: "Какая сфера вашей жизни сейчас требует наибольшего внимания?",
      q1_opt1: "Финансы и карьера (финансовый потолок, предназначение)",
      q1_opt2: "Личные отношения и семья (поиск любви, гармонизация)",
      q1_opt3: "Внутреннее состояние (усталость, апатия, блоки)",
      q1_opt4: "Поиск предназначения и скрытых талантов",
      question2: "Чувствуете ли вы нехватку энергии или застой в делах?",
      q2_opt1: "Да, ощущаю постоянный упадок сил или застой",
      q2_opt2: "Иногда чувствую усталость, но справляюсь",
      q2_opt3: "Нет, с энергией все хорошо, нужен расчет или совет",
      question3: "Какому методу работы вы интуитивно доверяете больше всего?",
      q3_opt1: "Точным расчетам по дате рождения (матрица судьбы)",
      q3_opt2: "Интуитивным подсказкам и символам (карты Таро)",
      q3_opt3: "Энергетическому очищению воском и огнем (отливки)",
      q3_opt4: "Мягкому наполнению силой и открытию путей (Ладование)",
      btnNext: "Далее",
      btnPrev: "Назад",
      btnResult: "Получить рекомендацию",
      resultTitle: "Рекомендуемая вам практика:",
      btnOrder: "Заказать практику",
      btnRestart: "Пройти тест заново",
    },
    about: {
      title: "Ольга Хавич",
      subtitle: "Ваш проводник в мир гармонии и личной силы",
      p1: "Я помогаю людям находить ответы на самые сложные жизненные вопросы через синергию точных математических расчетов нумерологии, глубокого символизма карт Таро и мягких энергетических правок.",
      p2: "Моя цель — не просто предсказать будущее, а дать вам реальные практические инструменты для его изменения. Мы убираем внутренние блоки, высвобождаем спящий потенциал и открываем новые дороги в финансах, отношениях и духовном росте.",
      stat1_val: "8+",
      stat1_lbl: "Лет практики",
      stat2_val: "3000+",
      stat2_lbl: "Довольных клиентов",
      stat3_val: "15+",
      stat3_lbl: "Авторских браслетов",
      stat4_val: "100%",
      stat4_lbl: "Конфиденциально",
      quote: "«Моя цель — не просто дать вам предсказание будущего, а вручить точную числовую карту судьбы и энергетические инструменты, чтобы вы построили свое счастливое будущее сами.»",
      text1: "Уже более 10 лет я помогаю людям по всей Европе и СНГ выходить из глубоких кризисов, находить свое предназначение, выстраивать гармоничные отношения в семье и пробивать финансовые потолки.",
      text2: "В своей практике я соединяю сухую математическую точность расчетов числовых матриц с глубоким чувствованием тонкого плана через восковое ладование и расклады карт Таро, в содействии с моими Духовными Наставниками.",
      feat1_title: "10+ лет опыта",
      feat1_desc: "Проверенные временем и тысячами клиентов практики нумерологии и тарологии.",
      feat2_title: "Индивидуальный расчет",
      feat2_desc: "Каждый амулет создается Ольгой под дату рождения конкретного человека.",
      feat3_title: "Энергетическая зарядка",
      feat3_desc: "Все изделия проходят обряд мягкого воскового ладования силой мастера.",
      feat4_title: "Удобный ЛК ученика",
      feat4_desc: "Собственная современная IT-платформа для качественного обучения.",
    },
    testimonials: {
      title: "Отзывы тех, чья жизнь изменилась",
      subtitle: "Реальные истории людей, прошедших консультации, курсы и энергетические ладования",
    },
    skills: {
      title: "Дипломы и сертификаты",
      subtitle: "Постоянное обучение и подтвержденная квалификация для предоставления услуг высшего уровня",
    },
    ctaBlock: {
      title: "Готовы сделать шаг навстречу новой реальности?",
      desc: "Запишитесь на персональный разбор или подберите ваш браслет силы прямо сейчас. Изменения начинаются с одного решения.",
      btn: "Связаться в Telegram",
    },
    problems: {
      title: "С какими запросами ко мне приходят?",
      subtitle: "В жизни каждого наступает момент застоя или кризиса. Моя задача — найти глубинную причину блокировки и дать вам точные ключи для её устранения.",
      quote: "«Каждая из этих проблем имеет четкую причину, скрытую в вашей дате рождения и энергоструктуре. Мы найдем её и трансформируем в ваш ресурс.»",
      finance: "Финансы и карьера",
      financeDesc: "Уперлись в финансовый потолок? Бизнес буксует? Не понимаете, в какое русло направить силы для привлечения материального изобилия?",
      relations: "Личные отношения",
      relationsDesc: "Наступаете на одни и те же грабли с партнерами? Ощущаете одиночество и непонимание? Переживаете болезненный разрыв или семейный кризис?",
      energy: "Энергия и здоровье",
      energyDesc: "Чувствуете хроническую усталость, опустошение или апатию? Ощущаете, что все дороги закрыты и удача буквально отвернулась от вас?",
      destiny: "Предназначение и дети",
      destinyDesc: "Не знаете, кто вы на самом деле и в чем ваша кармическая задача? Хотите понять таланты и особенности характера вашего ребенка?",
    },
    keysBlock: {
      title: "Система Четырех Ключей",
      subtitle: "Моя методика построена на интегральном подходе: от точной диагностики развилок вашей реальности и глубокого очищения воском до наполнения природной силой и детального расчета матрицы судьбы.",
      k1_title: "Диагностика (Таро)",
      k1_desc: "Сканируем текущие развилки вашей реальности. Видим скрытые мотивы людей, причины кризисов и помогаем сделать верный выбор прямо сейчас.",
      k2_title: "Очищение (Отливки)",
      k2_desc: "Бережно убираем энергетические блокировки, сглазы, деструктивные программы и привязки из прошлых травмирующих отношений.",
      k3_title: "Наполнение (Ладование)",
      k3_desc: "Заполняем очищенные каналы природной силой. Настраиваем ваше биополе на финансовую стабильность, здоровье и привлечение любви.",
      k4_title: "Расчет (Нумерология)",
      k4_desc: "Составляем точную ментальную карту вашей жизни по дате рождения. Находим сильные стороны, предназначение и кармические задачи.",
    },
    servicesBlock: {
      title: "Направления Помощи и Практик",
      subtitle: "Выберите подходящее направление для вашей личной трансформации. Вы можете заказать индивидуальную консультацию или полноценный энергетический обряд.",
      s1_title: "Карты Таро",
      s1_desc: "Точный анализ запутанных жизненных ситуаций и прогнозирование вероятностей. Расклады на партнерство, карьеру, причины финансовых кризисов и поиск правильного пути.",
      s1_btn: "Сделать расклад (от 40 €)",
      s2_title: "Восковые отливки",
      s2_desc: "Диагностика и глубокое очищение энергетических центров (чакр). Снятие негатива, деструктивных программ и разрушение привязок из прошлых токсичных отношений.",
      s2_btn: "Очистить поле (от 70 €)",
      s3_title: "Ладование биополя",
      s3_desc: "Практики наполнения чистой силой после очищений. Восстановление здоровья, настройка на финансовую стабильность, красоту и энергетическое «открытие дорог».",
      s3_btn: "Наполниться силой (от 70 €)",
      s4_title: "Нумерологический прогноз",
      s4_desc: "Глубокий анализ вашей личности и судьбы по дате рождения. Расчет предназначения, финансовых каналов, совместимости в любви и прогнозирование ключевых периодов жизни.",
      s4_btn: "Выбрать расчет (от 70 €)",
    },
    productsPowerBlock: {
      title: "Инструменты Силы и Сакральные Знания",
      subtitle: "Поддерживайте свое ресурсное состояние с помощью индивидуальных амулетов или начните самостоятельное обучение нумерологии и таро.",
      p1_badge: "Артефакты силы",
      p1_title: "Индивидуальные амулетные браслеты",
      p1_desc: "Браслеты из натуральных минералов премиального качества. Каждый камень подбирается Ольгой вручную строго под вашу дату рождения и конкретный запрос (финансы, защита биополя, любовь и гармония). Все браслеты проходят обряд воскового ладования.",
      p1_f1: "100% натуральные камни",
      p1_f2: "Индивидуальный расчет камней по вашей матрице",
      p1_f3: "Обряд активации и зарядка силой мастера",
      p1_btn: "Подобрать браслет (от 39 €)",
      p2_badge: "Авторское обучение",
      p2_title: "Онлайн-курсы по нумерологии и таро",
      p2_desc: "Станьте хозяином своей судьбы или освойте новую престижную помогающую профессию. Понятные видеоуроки без воды, детальные PDF-методички и удобный личный кабинет ученика с бессрочным или временным доступом.",
      p2_f1: "Видеоплеер Kinescope высокого качества без рекламы",
      p2_f2: "Готовые методические пособия для расчетов",
      p2_f3: "Личный кабинет для контроля сроков доступов",
      p2_btn: "Начать обучение (от 149 €)",
    },
    faq: {
      title: "Часто Задаваемые Вопросы",
      subtitle: "Ответы на ключевые вопросы о методах работы Ольги Хавич, доставке амулетов и процессе обучения.",
      q1: "Как проходят онлайн-консультации и сколько они длятся?",
      a1: "Индивидуальные консультации по нумерологии или Таро проходят в онлайн-формате (через Zoom, WhatsApp или Telegram) и длятся от 30 минут до часа, но не больше. Возможен аудиоформат. Ольга детально разбирает ваш запрос, дает пошаговые рекомендации и отвечает на ваши вопросы. Запись консультации и все методические материалы для расчетов остаются у вас навсегда.",
      q2: "Нужно ли мое личное присутствие при восковых отливках или ладовании?",
      a2: "Нет, ваше физическое присутствие на обряде не требуется. Ольга работает бесконтактно, используя вашу фотографию, полное имя и точную дату рождения. Это проверенная веками методика дистанционной энерготерапии. По завершении обряда вы получаете подробнейший аудиоотчет от Ольги с расшифровкой отливок и рекомендациями.",
      q3: "Как рассчитывается и создается индивидуальный амулетный браслет?",
      a3: "Сначала Ольга рассчитывает вашу числовую матрицу по дате рождения и определяет камни-покровители, соответствующие вашему запросу. Затем подбираются натуральные минералы премиум-класса (аметист, лазурит, тигровый глаз, гранат и др.). В завершение Ольга проводит обряд воскового ладования изделия, чтобы активировать его защитные и ресурсные свойства лично под вас.",
      q4: "Как быстро я получу доступ к курсам после подтверждения заказа?",
      a4: "Доступ предоставляется моментально. Сразу после оплаты и подтверждения заказа вы сможете авторизоваться в личном кабинете ученика на сайте. Там автоматически появится ваш видеокурс с уроками (через быстрый плеер Kinescope) и PDF-методичками. Ольга настраивает гибкий срок действия доступа в соответствии с тарифом.",
    },
    footer: {
      title: "Не знаете, с чего начать?",
      desc: "Напишите Ольге Хавич напрямую в мессенджерах. Кратко опишите вашу жизненную ситуацию, и она подскажет, какой инструмент (расчет, очищение или амулет) поможет вам быстрее всего.",
      wa: "Связаться в WhatsApp",
      tg: "Связаться в Telegram",
      logoDesc: "Интегральный анализ личности, энергопрактики воскового очищения и ладования для раскрытия вашего природного потенциала и гармонии в жизни.",
      contactsTitle: "Контакты для связи",
      germany: "Германия",
      copyright: "© 2026 Ольга Хавич. Все права защищены.",
      cabinetLink: "Вход для учеников и администратора",
    },
  },
  de: {
    common: {
      loading: "Laden...",
      error: "Ein Fehler ist aufgetreten",
      save: "Speichern",
      cancel: "Abbrechen",
      back: "Zurück",
    },
    header: {
      home: "Startseite",
      shop: "Shop",
      about: "Über mich",
      services: "Leistungen",
      testimonials: "Bewertungen",
      certificates: "Zertifikate",
      cabinet: "Kundenbereich",
      ariaMenu: "Menü öffnen",
      ariaCart: "Warenkorb öffnen",
    },
    cart: {
      title: "Warenkorb",
      empty: "Ihr Warenkorb ist leer",
      continueShopping: "Weiter einkaufen",
      price: "Preis",
      quantity: "Menge",
      total: "Gesamtsumme",
      checkout: "Zur Kasse",
      itemsCount: "Artikel",
    },
    auth: {
      loginTitle: "Login in den Kundenbereich",
      registerTitle: "Registrierung neuer Schüler",
      phone: "Telefonnummer",
      email: "Ihre E-Mail",
      emailPlaceholder: "beispiel@example.com",
      passwordPlaceholder: "••••••",
      password: "Passwort",
      name: "Ihr Name",
      namePlaceholder: "Max Mustermann",
      confirmPassword: "Passwort bestätigen",
      passwordMinLength: "Mindestens 6 Zeichen",
      submitLogin: "Einloggen",
      submitLoginPending: "Einloggen...",
      submitRegister: "Registrieren",
      submitRegisterPending: "Registrierung...",
      noAccount: "Noch kein Konto?",
      hasAccount: "Bereits ein Konto?",
      goToRegister: "Registrieren",
      goToLogin: "Zum Login",
      validationPhone: "Geben Sie eine gültige Telefonnummer ein",
      validationPassword: "Passwort muss mindestens 6 Zeichen lang sein",
      validationName: "Name muss mindestens 2 Zeichen lang sein",
      loginError: "Ungültige E-Mail-Adresse oder Passwort",
      registerError: "Fehler bei der Registrierung",
      genericError: "Ein unerwarteter Fehler ist aufgetreten",
      errorPasswordMismatch: "Passwörter stimmen nicht überein",
      regSuccessTitle: "Registrierung erfolgreich!",
      regSuccessDesc: "Sie haben sich erfolgreich registriert. Sie werden nun zur Login-Seite weitergeleitet...",
      goToLoginManual: "Manuell zum Login gehen",
    },
    cabinet: {
      title: "Kundenbereich",
      welcome: "Willkommen",
      myCourses: "Meine Kurse",
      myOrders: "Bestellverlauf",
      logout: "Abmelden",
      accessUntil: "Zugang bis",
      expired: "Abgelaufen",
      courseDetails: "Kursdetails",
      noCourses: "Sie haben derzeit keine aktiven Kurсе. Sie können diese im Shop erwerben.",
      goToShop: "Zum Shop",
      orderNumber: "Bestell-Nr.",
      orderStatus: "Status",
      orderDate: "Datum",
      orderTotal: "Betrag",
      statusPending: "Ausstehend",
      statusPaid: "Bezahlt",
      statusCancelled: "Storniert",
      backToCabinet: "Zurück zum Kundenbereich",
      lessonsList: "Lektionen",
      lessonNum: "Lektion",
      certificateBtn: "Zertifikat erhalten",
      certificateSectionTitle: "🏆 Abschluss des Studiums",
      certificateIssuedText: "Ihr personalisiertes Zertifikat über den Kursabschluss wurde erfolgreich erstellt und gespeichert.",
      downloadCertificateBtn: "📥 Zertifikat herunterladen (PDF)",
      reissueCertificateBtn: "✏️ Namen ändern / Neu ausstellen",
      certificatePromoText: "Nach Abschluss des Kurses können Sie ein offizielles personalisiertes Zertifikat der Schule von Olga Khavich ausstellen.",
      issueCertificateBtn: "🎓 Zertifikat ausstellen",
      certModalTitle: "Erhalt eines personalisierten Zertifikats",
      certModalDesc: "Bitte geben Sie Ihren Namen ein. Er wird sofort auf dem Vorschaubild angezeigt. Stellen Sie vor dem Erstellen des PDFs sicher, dass der Name fehlerfrei geschrieben ist.",
      certInputLabel: "Ihr Vorname und Nachname",
      certInputPlaceholder: "Z.B. Anna Müller",
      certPreviewLabel: "Live-Vorschau des Zertifikats",
      certCancelBtn: "Abbrechen",
      certConfirmBtn: "🏆 Bestätigen und Zertifikat ausstellen",
      certGeneratingText: "Zertifikat wird ausgestellt...",
      certStep1: "Vorbereitung des Zertifikatslayouts...",
      certStep2: "Rendering in hoher Auflösung...",
      certStep3: "PDF-Dokument wird erstellt...",
      certStep4: "Speichern im Kundenbereich...",
      certStep5: "Datei wird heruntergeladen...",
      certSuccessTitle: "Herzlichen Glückwunsch! Ihr Zertifikat ist bereit",
      certSuccessText: "Das personalisierte Zertifikat über den Kursabschluss wurde erfolgreich generiert. Die Datei wurde auf Ihr Gerät heruntergeladen und auch in Ihrem Kundenbereich gespeichert.",
      certSuccessOpen: "📥 PDF öffnen / herunterladen",
      certSuccessClose: "Schließen",
      certSchoolName: "Schule für geistige Entwicklung von Olga Khavich",
      certDocTitle: "Zertifikat",
      certDocConfirm: "hiermit wird bestätigt, dass",
      certDocCourseText: "das Studium erfolgreich absolviert und das Kursprogramm abgeschlossen hat",
      certDocDate: "Ausstellungsdatum",
      certDocTeacher: "Dozentin",
      certDocTeacherName: "Olga Khavich",
      certDocDefaultName: "Vorname Nachname",
    },
    shop: {
      title: "Shop für Praktiken und Kurse",
      subtitle: "Autorenmethoden von Olga Khavich zur Harmonisierung des Lebens",
      all: "Alle Angebote",
      consultations: "Beratungen",
      bracelets: "Armbänder der Kraft",
      courses: "Kurse und Einweihungen",
      addToCart: "In den Warenkorb",
      inCart: "Im Warenkorb",
      featuresTitle: "Was enthalten ist:",
    },
    hero: {
      subtitle: "Olga Khavich",
      title: "Zertifizierte Numerologin, Tarot-Expertin und Energietherapeutin",
      desc: "Ich helfe Ihnen, Antworten auf Lebensfragen zu finden, Ihr Potenzial zu entfalten, Ihre Energie zu harmonisieren und Wege zum Wohlbefinden mit altem Wissen und Autorenmethoden zu eröffnen.",
      cta: "Dienstleistung wählen",
    },
    quiz: {
      title: "Finden Sie die perfekte Praxis in 1 Minute",
      subtitle: "Beantworten Sie 3 einfache Fragen und unser System empfiehlt Ihnen das beste Werkzeug für Ihre aktuelle Lebensaufgabe.",
      question1: "Welcher Bereich Ihres Lebens erfordert derzeit die meiste Aufmerksamkeit?",
      q1_opt1: "Finanzen und Karriere (finanzielle Grenzen, Bestimmung)",
      q1_opt2: "Beziehungen und Familie (Liebe finden, Harmonisierung)",
      q1_opt3: "Innerer Zustand (Müdigkeit, Apathie, Blockaden)",
      q1_opt4: "Suche nach Bestimmung und verborgenen Talenten",
      question2: "Spüren Sie Energiemangel oder Stillstand in Ihren Angelegenheiten?",
      q2_opt1: "Ja, ich spüre ständigen Energiemangel oder Stillstand",
      q2_opt2: "Manchmal fühle ich mich müde, aber ich komme zurecht",
      q2_opt3: "Nein, mit der Energie ist alles bestens, ich brauche nur Rat",
      question3: "Welcher Arbeitsmethode vertrauen Sie intuitiv am meisten?",
      q3_opt1: "Genaue Berechnungen nach Geburtsdatum (Matrix des Schicksals)",
      q3_opt2: "Intuitive Hinweise und Symbole (Tarot-Karten)",
      q3_opt3: "Energetische Reinigung mit Wachs und Feuer (Wachsguss)",
      q3_opt4: "Sanfte Energieübertragung und Wegeöffnung (Ladowanie)",
      btnNext: "Weiter",
      btnPrev: "Zurück",
      btnResult: "Empfehlung erhalten",
      resultTitle: "Ihre empfohlene Praxis:",
      btnOrder: "Praxis bestellen",
      btnRestart: "Test wiederholen",
    },
    about: {
      title: "Olga Khavich",
      subtitle: "Ihre Begleiterin in die Welt der Harmonie und persönlichen Kraft",
      p1: "Ich helfe Menschen, Antworten auf die komplexesten Lebensfragen zu finden – durch die Synergie präziser mathematischer Berechnungen der Numerologie, der tiefen Symbolik der Tarot-Karten und sanfter energetischer Korrekturen.",
      p2: "Mein Ziel ist es nicht nur, die Zukunft vorherzusagen, sondern Ihnen echte praktische Werkzeuge an die Hand zu geben, um sie zu verändern. Wir lösen innere Blockaden, setzen schlummerndes Potenzial frei und ebnen neue Wege in Finanzen, Beziehungen und spirituellem Wachstum.",
      stat1_val: "8+",
      stat1_lbl: "Jahre Erfahrung",
      stat2_val: "3000+",
      stat2_lbl: "Zufriedene Kunden",
      stat3_val: "15+",
      stat3_lbl: "Kraftarmbänder",
      stat4_val: "100%",
      stat4_lbl: "Vertraulich",
      quote: "«Mein Ziel ist es nicht, Ihnen einfach die Zukunft vorherzusagen, sondern Ihnen eine präzise Zahlenkarte des Schicksals und energetische Werkzeuge an die Hand zu geben, damit Sie Ihre glückliche Zukunft selbst gestalten.»",
      text1: "Seit über 10 Jahren helfe ich Menschen in ganz Europa und der GUS, tiefe Krisen zu bewältigen, ihre Bestimmung zu finden, harmonische Familienbeziehungen aufzubauen und finanzielle Grenzen zu überwinden.",
      text2: "In meiner Praxis verbinde ich die mathematische Präzision numerologischer Matrixberechnungen mit dem tiefen Spüren der feinstofflichen Ebene durch Wachsguss und Tarot-Karten, unterstützt von meinen geistigen Führern.",
      feat1_title: "10+ Jahre Erfahrung",
      feat1_desc: "Zeitlich bewährte und von Tausenden Kunden erprobte Praktiken der Numerologie und Tarot-Deutung.",
      feat2_title: "Individuelle Berechnung",
      feat2_desc: "Jedes Amulett wird von Olga speziell für das Geburtsdatum der jeweiligen Person angefertigt.",
      feat3_title: "Energetische Aktivierung",
      feat3_desc: "Alle Produkte durchlaufen ein sanftes Ladowanie-Ritual, das vom Meister mit Kraft geladen wird.",
      feat4_title: "Moderner Kundenbereich",
      feat4_desc: "Eigene moderne IT-Plattform für eine qualitativ hochwertige Ausbildung.",
    },
    testimonials: {
      title: "Erfahrungsberichte von Menschen, deren Leben sich veränderte",
      subtitle: "Echte Geschichten von Menschen nach Beratungen, Kursen und energetischen Harmonisierungen",
    },
    skills: {
      title: "Diplome und Zertifikate",
      subtitle: "Ständige Weiterbildung und geprüfte Qualifikation für Dienstleistungen auf höchstem Niveau",
    },
    ctaBlock: {
      title: "Bereit für den Schritt in eine neue Realität?",
      desc: "Melden Sie sich für eine persönliche Beratung an oder wählen Sie jetzt Ihr Kraftarmband. Veränderungen beginnen mit einer Entscheidung.",
      btn: "Kontakt über Telegram",
    },
    problems: {
      title: "Mit welchen Anliegen kommen Menschen zu mir?",
      subtitle: "Im Leben eines jeden Menschen gibt es Momente des Stillstands oder der Krise. Meine Aufgabe ist es, die tiefe Ursache der Blockade zu finden und Ihnen die genauen Schlüssel zu ihrer Beseitigung zu geben.",
      quote: "«Jedes dieser Probleme hat eine klare Ursache, die in Ihrem Geburtsdatum und Ihrer Energiestruktur verborgen ist. Wir werden sie finden und in Ihre Ressource verwandeln.»",
      finance: "Finanzen und Karriere",
      financeDesc: "Stecken Sie an einer finanziellen Grenze fest? Das Geschäft stagniert? Sie wissen nicht, wohin Sie Ihre Energie lenken sollen, um materiellen Überfluss anzuziehen?",
      relations: "Persönliche Beziehungen",
      relationsDesc: "Wiederholen Sie die gleichen Fehler in Partnerschaften? Fühlen Sie sich einsam und unverstanden? Erleben Sie eine schmerzhafte Trennung oder eine Familienkrise?",
      energy: "Energie und Gesundheit",
      energyDesc: "Fühlen Sie sich chronisch müde, ausgelaugt oder apathisch? Haben Sie das Gefühl, dass alle Wege versperrt sind und das Glück Sie verlassen hat?",
      destiny: "Bestimmung und Kinder",
      destinyDesc: "Wissen Sie nicht, wer Sie wirklich sind und was Ihre karmische Aufgabe ist? Möchten Sie die Talente und Charaktereigenschaften Ihres Kindes verstehen?",
    },
    keysBlock: {
      title: "Das Vier-Schlüssel-System",
      subtitle: "Meine Methodik basiert auf einem integralen Ansatz: von der präziser Diagnose Ihrer Realitätswege und der tiefen Wachsreinigung bis hin zur Füllung mit Naturkraft und der detaillierten Berechnung der Schicksalsmatrix.",
      k1_title: "Diagnose (Tarot)",
      k1_desc: "Wir scannen die aktuellen Wege Ihrer Realität. Wir sehen die verborgenen Motive von Menschen, die Ursachen von Krisen und helfen Ihnen, jetzt die richtige Wahl zu treffen.",
      k2_title: "Reinigung (Wachsguss)",
      k2_desc: "Wir entfernen behutsam energetische Blockaden, negative Einflüsse, destruktive Programme und Anbindungen aus vergangenen traumatischen Beziehungen.",
      k3_title: "Füllung (Ladowanie)",
      k3_desc: "Wir füllen die gereinigten Kanäle mit Naturkraft. Wir richten Ihr Biofeld auf finanzielle Stabilität, Gesundheit und das Anziehen von Liebe aus.",
      k4_title: "Berechnung (Numerologie)",
      k4_desc: "Wir erstellen eine präzise mentale Karte Ihres Lebens nach Ihrem Geburtsdatum. Wir finden Ihre Stärken, Bestimmung und karmischen Aufgaben.",
    },
    servicesBlock: {
      title: "Hilfe- und Praxisbereiche",
      subtitle: "Wählen Sie den passenden Weg für Ihre persönliche Transformation. Sie können eine individuelle Beratung oder ein vollwertiges energetisches Ritual bestellen.",
      s1_title: "Tarot-Karten",
      s1_desc: "Präzise Analyse komplexer Lebenssituationen und Prognose von Wahrscheinlichkeiten. Beratung zu Partnerschaft, Karriere, Ursachen von Finanzkrisen und Lebenswegsuche.",
      s1_btn: "Tarot-Sitzung (ab 40 €)",
      s2_title: "Wachsguss",
      s2_desc: "Diagnose und tiefe Reinigung der Energiezentren (Chakren). Entfernung von Negativität, destruktiven Programmen und Bindungen aus toxischen Beziehungen.",
      s2_btn: "Biofeld reinigen (ab 70 €)",
      s3_title: "Ladowanie des Biofelds",
      s3_desc: "Praktiken zur Füllung mit reiner Kraft nach Reinigungen. Wiederherstellung der Gesundheit, Ausrichtung auf finanzielle Stabilität, Schönheit und Wegeöffnung.",
      s3_btn: "Kraft tanken (ab 70 €)",
      s4_title: "Numerologische Analyse",
      s4_desc: "Tiefgehende Analyse Ihrer Persönlichkeit und Ihres Schicksals nach Geburtsdatum. Berechnung von Bestimmung, Finanzkanälen, Partnerschaft und Schlüsselphasen.",
      s4_btn: "Analyse wählen (ab 70 €)",
    },
    productsPowerBlock: {
      title: "Werkzeuge der Kraft und Sakrales Wissen",
      subtitle: "Erhalten Sie Ihren Ressourcenzustand durch individuelle Amulette oder beginnen Sie Ihre eigene Ausbildung in Numerologie und Tarot.",
      p1_badge: "Kraft-Artefakte",
      p1_title: "Individuelle Kraftarmbänder",
      p1_desc: "Armbänder aus natürlichen Mineralien von Premium-Qualität. Jeder Stein wird von Olga manuell streng nach Ihrem Geburtsdatum und Anliegen (Finanzen, Schutz, Liebe) ausgewählt. Alle Armbänder werden energetisch aktiviert.",
      p1_f1: "100% natürliche Edelsteine",
      p1_f2: "Individuelle Steinberechnung nach Ihrer Matrix",
      p1_f3: "Aktivierungsritual und Ladung durch die Meisterin",
      p1_btn: "Armband wählen (ab 39 €)",
      p2_badge: "Autoren-Ausbildung",
      p2_title: "Online-Kurse in Numerologie und Tarot",
      p2_desc: "Werden Sie Herr Ihres Schicksals oder erlernen Sie einen neuen, angesehenen helfenden Beruf. Klare Video-Lektionen ohne unnötige Theorie, detaillierte PDF-Anleitungen und moderner Kundenbereich mit lebenslangem oder zeitlich begrenztem Zugang.",
      p2_f1: "Kinescope-Videoplayer in hoher Qualität ohne Werbung",
      p2_f2: "Fertige methodische Handbücher für Berechnungen",
      p2_f3: "Kundenbereich zur Kontrolle des Kurszugangs",
      p2_btn: "Ausbildung starten (ab 149 €)",
    },
    faq: {
      title: "Häufig gestellte Fragen",
      subtitle: "Antworten auf wichtige Fragen zu Olgas Arbeitsmethoden, dem Versand von Amuletten und dem Ausbildungsprozess.",
      q1: "Wie laufen Online-Beratungen ab und wie lange dauern sie?",
      a1: "Individuelle Beratungen für Numerologie oder Tarot finden online statt (über Zoom, WhatsApp oder Telegram) und dauern zwischen 30 und 60 Minuten. Ein Audioformat ist ebenfalls möglich. Olga analysiert Ihr Anliegen im Detail, gibt Schritt-für-Schritt-Empfehlungen und beantwortet Ihre Fragen. Die Aufzeichnung der Beratung und alle Berechnungsmaterialien bleiben dauerhaft in Ihrem Besitz.",
      q2: "Ist meine persönliche Anwesenheit beim Wachsguss oder Ladowanie erforderlich?",
      a2: "Nein, Ihre physische Anwesenheit beim Ritual ist nicht erforderlich. Olga arbeitet berührungslos mit Ihrem Foto, Ihrem vollständigen Namen und Ihrem Geburtsdatum. Dies ist eine jahrhundertealte Methode der Fern-Energietherapie. Nach Abschluss des Rituals erhalten Sie einen ausführlichen Audiobericht von Olga mit der Deutung des Wachsgusses und Empfehlungen.",
      q3: "Wie wird ein individuelles Kraftarmband berechnet und hergestellt?",
      a3: "Zuerst berechnet Olga Ihre Schicksalsmatrix nach Ihrem Geburtsdatum und bestimmt die Schutzsteine, die Ihrem Anliegen entsprechen. Anschließend werden hochwertige Naturmineralien ausgewählt (Amethyst, Lapislazuli, Tigerauge, Granat usw.). Zum Abschluss führt Olga ein energetisches Aktivierungsritual für das Armband durch, um seine Schutz- und Ressourceneigenschaften speziell für Sie freizusetzen.",
      q4: "Wie schnell erhalte ich nach der Bestellbestätigung Zugang zu den Kursen?",
      a4: "Der Zugang erfolgt sofort. Direkt nach der Zahlung und Bestellbestätigung können Sie sich in den Kundenbereich für Schüler einloggen. Dort finden Sie automatisch Ihren Videokurs mit Lektionen (über den schnellen Kinescope-Player) and PDF-Anleitungen. Olga legt die flexible Zugriffsdauer entsprechend dem gewählten Tarif fest.",
    },
    footer: {
      title: "Wissen Sie nicht, wo Sie anfangen sollen?",
      desc: "Schreiben Sie Olga Khavich direkt in den Messengern. Beschreiben Sie kurz Ihre Lebenssituation, und sie wird Ihnen sagen, welches Werkzeug (Analyse, Reinigung oder Amulett) Ihnen am schnellsten helfen kann.",
      wa: "Kontakt über WhatsApp",
      tg: "Kontakt über Telegram",
      logoDesc: "Ganzheitliche Persönlichkeitsanalyse, energetische Wachsreinigung und Ladowanie zur Entfaltung Ihres natürlichen Potenzials und Lebensharmonie.",
      contactsTitle: "Kontaktmöglichkeiten",
      germany: "Deutschland",
      copyright: "© 2026 Olga Khavich. Alle Rechte vorbehalten.",
      cabinetLink: "Login für Schüler und Administrator",
    },
  },
};

// Типы для автодополнения ключей переводов
export type TranslationKeys = typeof translations.ru;

interface ILanguageContext {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <K extends keyof TranslationKeys, S extends keyof TranslationKeys[K]>(
    section: K,
    key: S
  ) => string;
}

const LanguageContext = createContext<ILanguageContext | undefined>(undefined);

/**
 * Провайдер контекста локализации. Предоставляет выбранный язык, функцию его изменения
 * и безопасный метод t() для перевода строк.
 * 
 * @param props Дочерние элементы провайдера.
 * @returns JSX провайдера контекста.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("ru");
  const router = useRouter();

  // Инициализация языка пользователя
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("khavich_language") as Language | null;
      if (savedLang === "ru" || savedLang === "de") {
        setLanguageState(savedLang);
        document.cookie = `khavich_language=${savedLang};path=/;max-age=31536000;SameSite=Lax`;
      } else {
        // Проверяем язык браузера по умолчанию
        const browserLang = navigator.language.substring(0, 2).toLowerCase();
        const defaultLang = browserLang === "de" ? "de" : "ru";
        setLanguageState(defaultLang);
        document.cookie = `khavich_language=${defaultLang};path=/;max-age=31536000;SameSite=Lax`;
      }
    } catch (e) {
      // Игнорируем ошибки доступа в приватных режимах
    }
  }, []);

  /**
   * Функция установки и сохранения выбранного языка на клиенте и в куках.
   * 
   * @param lang Выбранный язык ('ru' | 'de')
   */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("khavich_language", lang);
      document.cookie = `khavich_language=${lang};path=/;max-age=31536000;SameSite=Lax`;
      // Принудительно заставляем Next.js обновить Server Components на текущей странице
      router.refresh();
    } catch (e) {
      // Игнорируем
    }
  };

  /**
   * Безопасный типизированный метод перевода строк с поддержкой фолбэка на русский язык.
   * 
   * @param section Раздел словаря
   * @param key Ключ строки в разделе
   * @returns Локализованная строка или сам ключ в случае ошибки
   */
  const t = <K extends keyof TranslationKeys, S extends keyof TranslationKeys[K]>(
    section: K,
    key: S
  ): string => {
    try {
      const sectionObj = translations[language][section];
      if (sectionObj) {
        const val = sectionObj[key];
        if (typeof val === "string") return val;
      }
      // Фолбэк на русский язык
      const fallbackVal = translations["ru"][section]?.[key];
      if (typeof fallbackVal === "string") return fallbackVal;
    } catch (e) {
      // Игнорируем
    }
    return String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
