
export type Language = 'en' | 'uk' | 'sk';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// ==================================
// DEV NOTES
// ==================================
export type DevNote = {
  id: number;
  slug: string;
  date: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageHint: string;
  author?: string;
  tags?: string[];
  isVisible?: boolean;
  reactionCounts?: Record<string, number>;
};

// ==================================
// ROADMAP
// ==================================
export type RoadmapEvent = {
    date: string;
    title: string;
    description: string;
};

// ==================================
// FAQ
// ==================================
export type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

// ==================================
// CREATORS
// ==================================
export type FeaturedProject = {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  imageHint?: string;
};

export type Education = {
  institution: string;
  degree: string;
  year: string;
};

export type Certification = {
  name: string;
  authority: string;
  year: string;
};

export type GalleryImage = {
  imageUrl: string;
  description: string;
  imageHint: string;
};

export type Achievement = {
  icon: string;
  name: string;
  description: string;
};

export type Creator = {
  id: number;
  slug: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  imageHint: string;
  location?: string;
  languages?: string[];
  contributions?: string[];
  skills?: string[];
  education?: Education[];
  certifications?: Certification[];
  hobbies?: string[];
  gallery?: GalleryImage[];
  achievements?: Achievement[];
  cvUrl?: string;
  quote?: string;
  quoteAuthor?: string;
  music?: {
    spotify?: string;
    appleMusic?: string;
    youtubeMusic?: string;
  },
  socials: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  featuredProject?: FeaturedProject;
  isVisible?: boolean;
};

// ==================================
// ADVANTAGES
// ==================================
export type Advantage = {
  id: number;
  icon: string;
  title: string;
  description: string;
};

// ==================================
// ACTION SECTION
// ==================================
export type ActionSectionData = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  visible: boolean;
  buttonText: string;
  buttonUrl: string;
  buttonVisible: boolean;
};

// ==================================
// HERO SECTION
// ==================================
export type HeroSectionData = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageHint: string;
};

// ==================================
// PRODUCT SECTION
// ==================================
export type ProductComponent = {
  id: number;
  icon: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type ProductSectionData = {
  title: string;
  subtitle: string;
  components: ProductComponent[];
};


// ==================================
// INITIAL DATA FOR SEEDING
// ==================================

// This object contains all the initial data that will be used to seed the database.
// It is kept separate to clearly distinguish between the data types and the data itself.

const rawDevNotes: Record<Language, PartialBy<DevNote, 'slug' | 'date' | 'imageUrl' | 'imageHint' | 'isVisible' | 'reactionCounts'>[]> = {
  en: [
    { 
      id: 1, 
      slug: "backend-integration-update",
      date: "2024-07-22",
      title: "Backend Integration Nears Completion",
      summary: "The backend integration for our new stress detection API is now 75% complete. The team is now shifting focus to calibration and fine-tuning for the next sprint.",
      content: "We're excited to report significant progress on the new stress detection API. The core logic is in place, and we have successfully connected the frontend data streams to the backend processing services.\n\nOur next major hurdle is calibration. This involves testing with a diverse dataset to ensure accuracy across different lighting conditions and user demographics. We're on track for an internal beta next month.\n\n> We believe this feature will be a game-changer for proactive wellness management.\n\nStay tuned for more updates!",
      imageUrl: "/uploads/dev-notes/backend-integration-update/1721833898144-server_code.png",
      imageHint: "server code",
      author: "Anton Shyrko",
      tags: ["Backend", "API", "Update"],
      isVisible: true,
      reactionCounts: {},
    },
    { 
      id: 2,
      slug: "skin-analysis-refactor",
      date: "2024-07-18",
      title: "Refactoring the Skin Analysis Model",
      summary: "To improve performance in low-light conditions, we've begun refactoring the skin analysis model. Early results are very promising, showing a significant reduction in noise.",
      content: "User feedback indicated that our skin analysis feature could be unreliable in sub-optimal lighting. To address this, we are undertaking a complete refactor of the underlying machine learning model.\n\nBy incorporating new data augmentation techniques and a more robust architecture, we're already seeing a **40% improvement in accuracy** during our internal benchmarks. The image below shows a comparison of the old model (left) vs. the new model (right) on a low-light sample.\n\n![Model Comparison](https://placehold.co/800x300.png)\n\nThis enhancement will ensure that Spekulus Vision provides reliable insights regardless of the environment.",
      imageUrl: "/uploads/dev-notes/skin-analysis-refactor/1721833898145-machine_learning.png",
      imageHint: "machine learning",
      author: "Maksym Stetsenko",
      tags: ["AI/ML", "Research", "Update"],
      isVisible: true,
      reactionCounts: {},
    },
    { 
      id: 3,
      slug: "widget-store-design-finalized",
      date: "2024-07-15",
      title: "UI Team Finalizes Widget Store Design",
      summary: "The UI/UX team has officially signed off on the final designs for the Spekulus Widget Store. Development will begin next week, and we can't wait to share a sneak peek!",
      content: "After weeks of iteration and user testing, the final designs for our much-anticipated Widget Store are complete. The new interface is clean, intuitive, and makes it easy for users to discover and install new functionalities for their mirror.\n\n### Key Design Principles:\n\n- **Seamless Experience**: One-click installations and easy management of active widgets.\n- **Discoverability**: A clean, browsable interface to find new widgets.\n- **Consistency**: Adherence to the Spekulus design language.\n\nWe're building this with developers in mind. For more information, check out our [future developer portal](https://example.com).\n\nStay tuned for a preview in our next update!",
      imageUrl: "/uploads/dev-notes/widget-store-design-finalized/1721833898146-ui_design.png",
      imageHint: "ui design",
      author: "Andrii Kubai",
      tags: ["Design", "UI", "Feature"],
      isVisible: true,
      reactionCounts: {},
    },
    { 
      id: 4,
      slug: "pi-wifi-bug-fixed",
      date: "2024-07-12",
      title: "Critical Wi-Fi Bug Squashed",
      summary: "We've identified and fixed a critical bug in the Raspberry Pi OS image that was causing intermittent Wi-Fi connectivity issues for some of our alpha testers.",
      content: "A handful of our alpha testers reported sporadic Wi-Fi dropouts. After a deep dive into the driver-level logs on the Raspberry Pi OS, we discovered a conflict in the power management settings for the wireless chipset.\n\nWe have rolled out a patch that disables this aggressive power-saving feature, which has resolved the issue entirely. A new OS image will be available for download shortly.",
      imageUrl: "/uploads/dev-notes/pi-wifi-bug-fixed/1721833898146-circuit_board.png",
      imageHint: "circuit board",
      author: "Oleksandr Sokil",
      tags: ["Hardware", "Bug Fix", "Infra"],
      isVisible: true,
      reactionCounts: {},
    },
  ],
  uk: [
    {
        id: 1,
        title: "Інтеграція бекенду майже завершена",
        summary: "Інтеграція бекенду для нашого нового API виявлення стресу завершена на 75%. Команда переходить до калібрування та налаштування на наступний спринт.",
        content: "Ми раді повідомити про значний прогрес у розробці нового API для виявлення стресу. Основна логіка реалізована, і ми успішно підключили потоки даних з фронтенду до сервісів обробки на бекенді.\n\nНаступною великою перешкодою є калібрування. Це включає тестування з різноманітним набором даних для забезпечення точності за різних умов освітлення та демографічних характеристик користувачів. Ми плануємо вийти на внутрішню бету наступного місяця.\n\n> Ми віримо, що ця функція кардинально змінить підхід до проактивного управління здоров'ям.\n\nСлідкуйте за новинами!",
        author: "Антон Ширко",
        tags: ["Бекенд", "API", "Оновлення"],
    },
    {
        id: 2,
        title: "Рефакторинг моделі аналізу шкіри",
        summary: "Для покращення продуктивності в умовах недостатнього освітлення ми розпочали рефакторинг моделі аналізу шкіри. Перші результати дуже перспективні, показуючи значне зменшення шуму.",
        content: "Відгуки користувачів показали, що наша функція аналізу шкіри може бути ненадійною при недостатньому освітленні. Щоб вирішити цю проблему, ми проводимо повний рефакторинг базової моделі машинного навчання.\n\nЗавдяки впровадженню нових технік аугментації даних та більш надійної архітектури, ми вже бачимо **40% покращення точності** під час наших внутрішніх тестів. На зображенні нижче показано порівняння старої моделі (ліворуч) та нової моделі (праворуч) на зразку з низьким освітленням.\n\n![Порівняння моделей](https://placehold.co/800x300.png)\n\nЦе вдосконалення забезпечить надійні дані від Spekulus Vision незалежно від середовища.",
        author: "Максим Стеценко",
        tags: ["AI/ML", "Дослідження", "Оновлення"],
    },
    {
        id: 3,
        title: "Команда UI завершила дизайн магазину віджетів",
        summary: "Команда UI/UX офіційно затвердила фінальний дизайн для магазину віджетів Spekulus. Розробка розпочнеться наступного тижня, і ми не можемо дочекатися, щоб поділитися першим поглядом!",
        content: "Після тижнів ітерацій та тестування з користувачами, фінальний дизайн нашого довгоочікуваного магазину віджетів завершено. Новий інтерфейс чистий, інтуїтивно зрозумілий і дозволяє користувачам легко знаходити та встановлювати нові функції для свого дзеркала.\n\n### Ключові принципи дизайну:\n\n- **Безшовний досвід**: Встановлення одним кліком та легке управління активними віджетами.\n- **Легкість пошуку**: Чистий інтерфейс для перегляду та пошуку нових віджетів.\n- **Послідовність**: Дотримання мови дизайну Spekulus.\n\nМи створюємо це з думкою про розробників. Для отримання додаткової інформації відвідайте наш [майбутній портал для розробників](https://example.com).\n\nСлідкуйте за попереднім переглядом у нашому наступному оновленні!",
        author: "Андрій Кубай",
        tags: ["Дизайн", "UI", "Функція"],
    },
    {
        id: 4,
        title: "Виправлено критичну помилку Wi-Fi",
        summary: "Ми виявили та виправили критичну помилку в образі Raspberry Pi OS, яка спричиняла періодичні проблеми з підключенням до Wi-Fi у деяких наших альфа-тестерів.",
        content: "Декілька наших альфа-тестерів повідомили про спорадичні розриви з'єднання Wi-Fi. Після глибокого аналізу логів на рівні драйверів в Raspberry Pi OS ми виявили конфлікт у налаштуваннях керування живленням для бездротового чіпсета.\n\nМи випустили патч, який вимикає цю агресивну функцію енергозбереження, що повністю вирішило проблему. Новий образ ОС незабаром буде доступний для завантаження.",
        author: "Олександр Сокіл",
        tags: ["Обладнання", "Виправлення", "Інфра"],
    }
  ],
  sk: [
    {
        id: 1,
        title: "Integrácia backendu sa blíži ku koncu",
        summary: "Integrácia backendu pre naše nové API na detekciu stresu je teraz na 75% hotová. Tím sa teraz zameriava na kalibráciu a jemné ladenie na ďalší šprint.",
        content: "S radosťou oznamujeme významný pokrok v našom novom API na detekciu stresu. Jadro logiky je na mieste a úspešne sme prepojili dátové toky z frontendu so službami na spracovanie na backende.\n\nNašou ďalšou veľkou prekážkou je kalibrácia. To zahŕňa testovanie s rôznorodým súborom údajov, aby sa zabezpečila presnosť v rôznych svetelných podmienkach a u rôznych demografických skupín používateľov. Sme na dobrej ceste k internej beta verzii budúci mesiac.\n\n> Veríme, že táto funkcia zmení pravidlá hry v proaktívnom manažmente wellnessu.\n\nZostaňte naladení na ďalšie aktualizácie!",
        author: "Anton Shyrko",
        tags: ["Backend", "API", "Aktualizácia"],
    },
    {
        id: 2,
        title: "Refaktorovanie modelu analýzy pleti",
        summary: "S cieľom zlepšiť výkon v podmienkach slabého osvetlenia sme začali refaktorovať model analýzy pleti. Prvé výsledky sú veľmi sľubné a ukazujú výrazné zníženie šumu.",
        content: "Spätná väzba od používateľov naznačila, že naša funkcia analýzy pleti môže byť nespoľahlivá v neoptimálnom osvetlení. Na riešenie tohto problému sme sa pustili do kompletného refaktorovania základného modelu strojového učenia.\n\nZačlenením nových techník augmentácie dát a robustnejšej architektúry už teraz vidíme **40% zlepšenie presnosti** počas našich interných testov. Obrázok nižšie ukazuje porovnanie starého modelu (vľavo) a nového modelu (vpravo) na vzorke so slabým osvetlením.\n\n![Porovnanie modelov](https://placehold.co/800x300.png)\n\nToto vylepšenie zabezpečí, že Spekulus Vision bude poskytovať spoľahlivé poznatky bez ohľadu na prostredie.",
        author: "Maksym Stetsenko",
        tags: ["AI/ML", "Výskum", "Aktualizácia"],
    },
    {
        id: 3,
        title: "UI tím finalizuje dizajn Widget Store",
        summary: "Tím UI/UX oficiálne schválil finálne návrhy pre Spekulus Widget Store. Vývoj sa začne budúci týždeň a my sa už nevieme dočkať, kedy sa s vami podelíme o malú ukážku!",
        content: "Po týždňoch iterácií a testovania s používateľmi sú finálne návrhy nášho dlho očakávaného Widget Store hotové. Nové rozhranie je čisté, intuitívne a uľahčuje používateľom objavovanie a inštaláciu nových funkcionalít pre ich zrkadlo.\n\n### Kľúčové princípy dizajnu:\n\n- **Plynulý zážitok**: Inštalácie na jedno kliknutie a jednoduchá správa aktívnych widgetov.\n- **Objaviteľnosť**: Čisté, prehľadávateľné rozhranie na nájdenie nových widgetov.\n- **Konzistentnosť**: Dodržiavanie dizajnového jazyka Spekulus.\n\nTvoríme to s ohľadom na vývojárov. Pre viac informácií navštívte náš [budúci portál pre vývojárov](https://example.com).\n\nZostaňte naladení na ukážku v našej ďalšej aktualizácii!",
        author: "Andrii Kubai",
        tags: ["Dizajn", "UI", "Funkcia"],
    },
    {
        id: 4,
        title: "Kritická chyba Wi-Fi opravená",
        summary: "Identifikovali a opravili sme kritickú chybu v obraze Raspberry Pi OS, ktorá spôsobovala občasné problémy s pripojením Wi-Fi u niektorých našich alfa testerov.",
        content: "Niekoľko našich alfa testerov hlásilo sporadické výpadky Wi-Fi. Po hĺbkovom preskúmaní logov na úrovni ovládačov v Raspberry Pi OS sme objavili konflikt v nastaveniach správy napájania pre bezdrôtový čipset.\n\nVydali sme opravu, ktorá deaktivuje túto agresívnu funkciu šetrenia energie, čo problém úplne vyriešilo. Nový obraz OS bude čoskoro k dispozícii na stiahnutie.",
        author: "Oleksandr Sokil",
        tags: ["Hardvér", "Oprava chyby", "Infra"],
    }
  ]
};

const rawRoadmapEvents: Record<Language, PartialBy<RoadmapEvent, 'date'>[]> = {
  en: [
    { date: "2024-04-28", title: "Idea Creation", description: "The birth of Spekulus Vision. Initial concept and mission defined." },
    { date: "2024-07-16", title: "Demo Release", description: "First functional prototype demonstrated to early investors and partners." },
    { date: "2024-12-16", title: "Implementation Start", description: "Official start of the development phase. Core team assembled." },
    { date: "Q4 2025", title: "Widget Store Release", description: "Launch of the Spekulus widget store for third-party widgets and custom modules." },
    { date: "Q2 2026", title: "AI Makeup Tool", description: "Implementation of the virtual AI-driven makeup assistant with facial recognition." },
    { date: "Q3 2026", title: "Official Product Release", description: "Spekulus Vision smart mirror becomes publicly available." },
    { date: "Q4 2026", title: "Entry into Slovak Market", description: "Initial launch of Spekulus Vision in Slovakia as the first step in regional expansion." },
  ],
  uk: [
    { date: "2024-04-28", title: "Створення ідеї", description: "Народження Spekulus Vision. Визначено початкову концепцію та місію." },
    { date: "2024-07-16", title: "Випуск демо-версії", description: "Перший функціональний прототип продемонстровано раннім інвесторам та партнерам." },
    { date: "2024-12-16", title: "Початок реалізації", description: "Офіційний старт етапу розробки. Сформовано основну команду." },
    { date: "Q4 2025", title: "Запуск магазину віджетів", description: "Запуск магазину віджетів Spekulus для сторонніх віджетів та кастомних модулів." },
    { date: "Q2 2026", title: "Інструмент для макіяжу зі ШІ", description: "Впровадження віртуального асистента для макіяжу на основі ШІ з розпізнаванням обличчя." },
    { date: "Q3 2026", title: "Офіційний випуск продукту", description: "Розумне дзеркало Spekulus Vision стає доступним для широкого загалу." },
    { date: "Q4 2026", title: "Вихід на словацький ринок", description: "Початковий запуск Spekulus Vision у Словаччині як перший крок регіональної експансії." },
  ],
  sk: [
    { date: "2024-04-28", title: "Vytvorenie nápadu", description: "Zrod Spekulus Vision. Definovanie počiatočného konceptu a misie." },
    { date: "2024-07-16", title: "Vydanie dema", description: "Prvý funkčný prototyp demonštrovaný prvým investorom a partnerom." },
    { date: "2024-12-16", title: "Začiatok implementácie", description: "Oficiálny začiatok vývojovej fázy. Zostavenie hlavného tímu." },
    { date: "Q4 2025", title: "Spustenie Widget Store", description: "Spustenie obchodu s widgetmi Spekulus pre widgety tretích strán a vlastné moduly." },
    { date: "Q2 2026", title: "Nástroj na líčenie s AI", description: "Implementácia virtuálneho asistenta pre líčenie poháňaného AI s rozpoznávaním tváre." },
    { date: "Q3 2026", title: "Oficiálne vydanie produktu", description: "Inteligentné zrkadlo Spekulus Vision sa stáva verejne dostupným." },
    { date: "Q4 2026", title: "Vstup na slovenský trh", description: "Počiatočné spustenie Spekulus Vision na Slovensku ako prvý krok regionálnej expanzie." },
  ]
};

const rawFaqData: Record<Language, FaqItem[]> = {
  en: [
    { id: 'faq-what', question: 'What is Spekulus?', answer: 'Spekulus is an innovative smart mirror developed by us. It combines health monitoring, weather awareness, and smart home integration into a single, elegant device. With built-in AI and a camera, it delivers personalized insights to help you live smarter and healthier.' },
    { id: 'faq-how', question: 'How does Spekulus detect stress and analyze health?', answer: 'Spekulus uses a Raspberry Pi camera to capture facial data and our custom AI software to analyze it. The system detects visible signs of stress, fatigue, or skin issues, then offers practical wellness tips, such as breathing exercises or reminders to rest.' },
    { id: 'faq-widget', question: 'What is the Widget Store?', answer: 'The Widget Store is a unique Spekulus feature launching in Q4 2025. It allows users to customize their mirror experience by downloading various widgets. Think of it as your mirror’s app store. You can [learn more about our roadmap](#roadmap) for its release.' },
    { id: 'faq-diff', question: 'What makes Spekulus different from other smart mirrors?', answer: 'Unlike most competitors, Spekulus focuses not just on cosmetic features but on health and well-being. It offers a holistic daily assistant: stress tracking, weather forecasts, skincare analysis, and smart assistant functions all in one device.' },
    { id: 'faq-who', question: 'Who is behind Spekulus?', answer: 'Our team at S&S Creation includes developers, AI engineers, and tech visionaries passionate about improving daily life through smart technology. We’re currently seeking partnerships and funding to take Spekulus to the next level. [Meet the team](/creators).' },
  ],
  uk: [
    { id: 'faq-what', question: 'Що таке Spekulus?', answer: 'Spekulus — це інноваційне розумне дзеркало, розроблене нами. Воно поєднує моніторинг здоров\'я, інформацію про погоду та інтеграцію з розумним будинком в одному елегантному пристрої. Завдяки вбудованому ШІ та камері, воно надає персоналізовані поради, щоб допомогти вам жити розумніше та здоровіше.' },
    { id: 'faq-how', question: 'Як Spekulus виявляє стрес та аналізує здоров\'я?', answer: 'Spekulus використовує камеру Raspberry Pi для збору даних обличчя та наше власне програмне забезпечення ШІ для їх аналізу. Система виявляє видимі ознаки стресу, втоми чи проблем зі шкірою, а потім пропонує практичні поради для покращення самопочуття, наприклад, дихальні вправи або нагадування про відпочинок.' },
    { id: 'faq-widget', question: 'Що таке Widget Store?', answer: 'Widget Store — це унікальна функція Spekulus, яка запускається в 4-му кварталі 2025 року. Вона дозволяє користувачам налаштовувати своє дзеркало, завантажуючи різноманітні віджети. Вважайте це магазином додатків для вашого дзеркала. Ви можете [дізнатися більше про нашу дорожню карту](#roadmap) щодо його випуску.' },
    { id: 'faq-diff', question: 'Чим Spekulus відрізняється від інших розумних дзеркал?', answer: 'На відміну від більшості конкурентів, Spekulus зосереджується не лише на косметичних функціях, а й на здоров\'ї та добробуті. Він пропонує комплексного щоденного асистента: відстеження стресу, прогнози погоди, аналіз шкіри та функції розумного помічника — все в одному пристрої.' },
    { id: 'faq-who', question: 'Хто стоїть за Spekulus?', answer: 'Наша команда в S&S Creation складається з розробників, інженерів ШІ та технологічних візіонерів, які захоплені покращенням повсякденного життя за допомогою розумних технологій. Наразі ми шукаємо партнерства та фінансування, щоб вивести Spekulus на новий рівень. [Зустрічайте команду](/creators).' },
  ],
  sk: [
    { id: 'faq-what', question: 'Čo je Spekulus?', answer: 'Spekulus je inovatívne inteligentné zrkadlo, ktoré sme vyvinuli. Spája monitorovanie zdravia, informovanosť o počasí a integráciu s inteligentnou domácnosťou do jediného elegantného zariadenia. So zabudovanou umelou inteligenciou a kamerou poskytuje personalizované poznatky, ktoré vám pomôžu žiť inteligentnejšie a zdravšie.' },
    { id: 'faq-how', question: 'Ako Spekulus zisťuje stres a analyzuje zdravie?', answer: 'Spekulus používa kameru Raspberry Pi na zachytávanie údajov o tvári a náš vlastný softvér s umelou inteligenciou na ich analýzu. Systém zisťuje viditeľné známky stresu, únavy alebo kožných problémov a potom ponúka praktické wellness tipy, ako sú dychové cvičenia alebo pripomienky na odpočinok.' },
    { id: 'faq-widget', question: 'Čo je Widget Store?', answer: 'Widget Store je jedinečná funkcia Spekulus, ktorá bude spustená v 4. štvrťroku 2025. Umožňuje používateľom prispôsobiť si zážitok so zrkadlom sťahovaním rôznych widgetov. Predstavte si to ako obchod s aplikáciami pre vaše zrkadlo. Môžete sa [dozvedieť viac o našej cestovnej mape](#roadmap) pre jeho vydanie.' },
    { id: 'faq-diff', question: 'Čím sa Spekulus líši od ostatných inteligentných zrkadiel?', answer: 'Na rozdiel od väčšiny konkurentov sa Spekulus nezameriava len na kozmetické funkcie, ale aj na zdravie a pohodu. Ponúka komplexného denného asistenta: sledovanie stresu, predpovede počasia, analýzu pleti a funkcie inteligentného asistenta v jednom zariadení.' },
    { id: 'faq-who', question: 'Kto stojí za Spekulus?', answer: 'Náš tím v S&S Creation zahŕňa vývojárov, inžinierov umelej inteligencie a technologických vizionárov, ktorí sú nadšení pre zlepšovanie každodenného života prostredníctvom inteligentných technológií. V súčasnosti hľadáme partnerstvá a financovanie, aby sme posunuli Spekulus na ďalšiu úroveň. [Zoznámte sa s tímom](/creators).' },
  ]
};

type RawCreator = PartialBy<Creator, 'name' | 'role' | 'bio' | 'location' | 'languages' | 'contributions' | 'education' | 'certifications' | 'hobbies' | 'achievements' | 'quote' | 'quoteAuthor' | 'featuredProject' | 'gallery'>;

const rawCreatorsData: Record<Language, RawCreator[]> = {
  en: [
    {
      id: 1,
      slug: 'anton-shyrko',
      name: 'Anton Shyrko',
      role: 'CEO & Team Lead',
      bio: "Anton is the visionary behind Spekulus, guiding the team with a steady hand and a passion for innovative technology. He coordinates the overall project strategy, leads decision-making, and ensures the team's alignment with our ambitious goals. He believes in transparent development and building products that genuinely improve people's daily lives.\n\n### Core Philosophies\n\n- **User-Centric Design**: Every feature must solve a real user problem.\n- **Open Collaboration**: The best ideas can come from anywhere.\n- **Sustainable Growth**: Building a lasting company that values its people.",
      imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026850/spekulus/creators/anton-shyrko/man_portrait_ceo.png',
      imageHint: 'man portrait ceo',
      location: "Kyiv, Ukraine",
      languages: ["Ukrainian", "English", "Slovak"],
      contributions: [
          "Overall project strategy and vision",
          "Team leadership and coordination",
          "Stakeholder and investor relations",
          "Financial planning and resource management"
      ],
      skills: ["Leadership", "Project Management", "Business Strategy", "Public Speaking", "React", "Next.js", "Firebase", "Git"],
      education: [
          { institution: "Taras Shevchenko National University of Kyiv", degree: "Master's in Computer Science", year: "2020" }
      ],
      certifications: [
          { name: "Certified ScrumMaster (CSM)", authority: "Scrum Alliance", year: "2021" }
      ],
      hobbies: ["Hiking in the Carpathians", "Competitive Chess", "Reading sci-fi novels"],
      gallery: [
          { imageUrl: 'https://placehold.co/600x400.png', description: "Presenting at a tech conference", imageHint: "man presentation" },
          { imageUrl: 'https://placehold.co/600x400.png', description: "Team brainstorming session", imageHint: "team meeting" },
          { imageUrl: 'https://placehold.co/600x400.png', description: "Working on the initial prototype", imageHint: "man coding" }
      ],
      achievements: [
        { icon: 'Rocket', name: 'Pioneer', description: 'One of the first members to join the project.' },
        { icon: 'GitMerge', name: 'First Commit', description: 'Contributed to the initial codebase of the project.' },
        { icon: 'Lightbulb', name: 'Visionary', description: 'Defined the core mission and strategy of Spekulus.' },
      ],
      cvUrl: "/documents/anton-shyrko-cv.pdf",
      quote: "The best way to predict the future is to invent it.",
      quoteAuthor: "Alan Kay",
      music: {
        spotify: '37i9dQZF1DXcBWIGoYBM5M'
      },
      socials: {
          github: 'moolko123',
          twitter: 'https://twitter.com/spekulus',
          linkedin: 'https://www.linkedin.com/company/spekulus'
      },
      featuredProject: {
          title: "Initial Spekulus Prototype",
          description: "The very first proof-of-concept for Spekulus, built with a Raspberry Pi 3 and a basic Python script to test the core smart mirror functionality.",
          url: "#",
          imageUrl: 'https://placehold.co/1200x600.png',
          imageHint: "prototype circuit"
      },
      isVisible: true,
    },
    {
      id: 2,
      slug: 'oleksandr-sokil',
      name: 'Oleksandr Sokil',
      role: 'CTO',
      bio: "As CTO, Oleksandr is the technical architect of Spekulus. He is responsible for system architecture, hardware integration, and technical oversight of all the mirror’s components, ensuring a robust and scalable platform.",
      imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026850/spekulus/creators/oleksandr-sokil/man_portrait_cto.png',
      imageHint: 'man portrait cto',
      location: "Lviv, Ukraine",
      languages: ["Ukrainian", "English"],
      contributions: [
          "Designing the hardware-software architecture",
          "Selecting and integrating the Raspberry Pi and camera modules",
          "Overseeing technical development and quality assurance",
          "Performance optimization for embedded system"
      ],
      skills: ["System Architecture", "Hardware Integration", "Embedded Systems", "C++", "Linux", "Docker", "Git", "System Design"],
      education: [
          { institution: "Lviv Polytechnic National University", degree: "Bachelor's in Electrical Engineering", year: "2019" }
      ],
      hobbies: ["Building custom drones", "3D Printing"],
      achievements: [
        { icon: 'Rocket', name: 'Pioneer', description: 'One of the first members to join the project.' },
        { icon: 'Star', name: 'Top Contributor', description: 'Has the most commits in the main repository.' },
      ],
      quote: "Simplicity is the ultimate sophistication.",
      quoteAuthor: "Leonardo da Vinci",
      music: {
        spotify: '37i9dQZF1DWZeKCadgRdKQ'
      },
      socials: {},
      isVisible: true,
    },
    {
      id: 3,
      slug: 'andrii-kubai',
      name: 'Andrii Kubai',
      role: 'Web Developer',
      bio: "Andrii is the craftsman behind the Spekulus web presence. He builds and maintains the responsive frontend for the website and the powerful admin interface, with a keen eye for user experience and multilingual support.",
      imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026849/spekulus/creators/andrii-kubai/man_portrait_web_developer.png',
      imageHint: 'man portrait web developer',
      location: "Ivano-Frankivsk, Ukraine",
      languages: ["Ukrainian", "English"],
      contributions: [
          "Developing the public-facing website using Next.js",
          "Building the admin panel for content management",
          "Implementing the multilingual system for EN, UK, and SK",
          "Ensuring full responsiveness across all devices"
      ],
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vercel", "Figma", "HTML5", "CSS", "JavaScript"],
      certifications: [
          { name: "Advanced React", authority: "wesbos.com", year: "2023" }
      ],
      hobbies: ["Mountain biking", "Playing guitar"],
       achievements: [
        { icon: 'Users', name: 'Community Helper', description: 'Actively helps new members and answers questions.' },
      ],
      quote: "First, solve the problem. Then, write the code.",
      quoteAuthor: "John Johnson",
      music: {
        spotify: '37i9dQZF1DX0XUfTFmNBRM'
      },
      socials: {},
      isVisible: true,
    },
    {
      id: 4,
      slug: 'anton-makhniuk',
      name: 'Anton Makhniuk',
      role: 'Software Developer',
      bio: "Anton focuses on the core application logic that brings Spekulus to life. He connects the mirror’s complex functions with the backend services and plays a vital role in testing and ensuring software stability.",
      imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026849/spekulus/creators/anton-makhniuk/man_portrait_software_developer.png',
      imageHint: 'man portrait software developer',
      location: "Warsaw, Poland",
      languages: ["Ukrainian", "Polish", "English"],
      contributions: [
          "Implementing core application logic on the Raspberry Pi",
          "Integrating third-party APIs for weather and smart home control",
          "Writing unit and integration tests to ensure reliability",
          "Database management with Firebase"
      ],
      skills: ["Python", "JavaScript", "Node.js", "Firebase", "API Integration", "Java", "Git"],
      hobbies: ["Photography", "Exploring new restaurants"],
      achievements: [],
      quote: "Talk is cheap. Show me the code.",
      quoteAuthor: "Linus Torvalds",
      music: {
        spotify: '37i9dQZF1DWTyiBJ6yEqeu'
      },
      socials: {},
      isVisible: true,
    },
    {
      id: 5,
      slug: 'maksym-stetsenko',
      name: 'Maksym Stetsenko',
      role: 'AI Engineer',
      bio: "Maksym is the intelligence behind Spekulus's smartest features. He develops and trains the AI models for facial recognition, skin analysis, and stress detection, optimizing them for high performance on embedded hardware.",
      imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026850/spekulus/creators/maksym-stetsenko/man_portrait_ai_engineer.png',
      imageHint: 'man portrait ai engineer',
      location: "Remote",
      languages: ["Ukrainian", "English"],
      contributions: [
          "Developing computer vision models for facial analysis",
          "Training AI for skin health and stress detection",
          "Optimizing models for performance on Raspberry Pi using TensorFlow Lite",
          "Research and development of future AI features"
      ],
      skills: ["PyTorch", "TensorFlow Lite", "Computer Vision", "Python", "AI/ML", "Model Optimization", "Data Science"],
      education: [
          { institution: "Igor Sikorsky Kyiv Polytechnic Institute", degree: "M.Sc. in Artificial Intelligence", year: "2021" }
      ],
      hobbies: ["Go (board game)", "Contributing to open-source AI projects"],
      achievements: [
         { icon: 'Lightbulb', name: 'Innovator', description: 'Developed a novel approach for model optimization.' },
      ],
      quote: "The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.",
      quoteAuthor: "Edsger W. Dijkstra",
      music: {
        spotify: '37i9dQZF1EIdYscYfP3j6R'
      },
      socials: {},
      isVisible: true,
    },
  ],
  uk: [
    {
      id: 1,
      name: 'Антон Ширко',
      role: 'CEO & Керівник команди',
      bio: "Антон — візіонер, що стоїть за Spekulus, він керує командою твердою рукою та пристрастю до інноваційних технологій. Він координує загальну стратегію проєкту, очолює прийняття рішень та забезпечує відповідність команди нашим амбітним цілям. Він вірить у прозору розробку та створення продуктів, які справді покращують повсякденне життя людей.\n\n### Основні філософії\n\n- **Дизайн, орієнтований на користувача**: Кожна функція повинна вирішувати реальну проблему користувача.\n- **Відкрита співпраця**: Найкращі ідеї можуть прийти звідки завгодно.\n- **Сталий розвиток**: Побудова довготривалої компанії, яка цінує своїх людей.",
      location: "Київ, Україна",
      languages: ["Українська", "Англійська", "Словацька"],
      contributions: [
          "Загальна стратегія та бачення проєкту",
          "Керівництво командою та координація",
          "Відносини із зацікавленими сторонами та інвесторами",
          "Фінансове планування та управління ресурсами"
      ],
      education: [
          { institution: "Київський національний університет імені Тараса Шевченка", degree: "Магістр комп'ютерних наук", year: "2020" }
      ],
      certifications: [
          { name: "Сертифікований ScrumMaster (CSM)", authority: "Scrum Alliance", year: "2021" }
      ],
      hobbies: ["Походи в Карпатах", "Спортивні шахи", "Читання наукової фантастики"],
      gallery: [
          { imageUrl: 'https://placehold.co/600x400.png', description: "Презентація на технічній конференції", imageHint: "man presentation" },
          { imageUrl: 'https://placehold.co/600x400.png', description: "Командний мозковий штурм", imageHint: "team meeting" },
          { imageUrl: 'https://placehold.co/600x400.png', description: "Робота над початковим прототипом", imageHint: "man coding" }
      ],
      achievements: [
        { icon: 'Rocket', name: 'Піонер', description: 'Один з перших членів, що приєдналися до проєкту.' },
        { icon: 'GitMerge', name: 'Перший коміт', description: 'Зробив внесок у початкову кодову базу проєкту.' },
        { icon: 'Lightbulb', name: 'Візіонер', description: 'Визначив основну місію та стратегію Spekulus.' },
      ],
      quote: "Найкращий спосіб передбачити майбутнє — це винайти його.",
      quoteAuthor: "Алан Кей",
      featuredProject: {
          title: "Початковий прототип Spekulus",
          description: "Перший доказ концепції для Spekulus, створений на Raspberry Pi 3 з базовим скриптом на Python для тестування основної функціональності розумного дзеркала.",
          url: "#",
          imageUrl: 'https://placehold.co/1200x600.png',
          imageHint: "prototype circuit"
      },
    },
    {
      id: 2,
      name: 'Олександр Сокіл',
      role: 'Технічний директор (CTO)',
      bio: "Як технічний директор, Олександр є технічним архітектором Spekulus. Він відповідає за архітектуру системи, інтеграцію апаратного забезпечення та технічний нагляд за всіма компонентами дзеркала, забезпечуючи надійну та масштабовану платформу.",
      location: "Львів, Україна",
      languages: ["Українська", "Англійська"],
      contributions: [
          "Проєктування архітектури апаратного та програмного забезпечення",
          "Вибір та інтеграція модулів Raspberry Pi та камери",
          "Нагляд за технічною розробкою та забезпеченням якості",
          "Оптимізація продуктивності для вбудованої системи"
      ],
      education: [
          { institution: "Національний університет «Львівська політехніка»", degree: "Бакалавр електротехніки", year: "2019" }
      ],
      hobbies: ["Створення власних дронів", "3D-друк"],
      achievements: [
        { icon: 'Rocket', name: 'Піонер', description: 'Один з перших членів, що приєдналися до проєкту.' },
        { icon: 'Star', name: 'Топ-контриб\'ютор', description: 'Має найбільше комітів у головному репозиторії.' },
      ],
      quote: "Простота — це найвища витонченість.",
      quoteAuthor: "Леонардо да Вінчі",
    },
    {
      id: 3,
      name: 'Андрій Кубай',
      role: 'Веб-розробник',
      bio: "Андрій — майстер, що стоїть за веб-присутністю Spekulus. Він створює та підтримує адаптивний фронтенд для веб-сайту та потужний адміністративний інтерфейс, з гострим оком на користувацький досвід та багатомовну підтримку.",
      location: "Івано-Франківськ, Україна",
      languages: ["Українська", "Англійська"],
      contributions: [
          "Розробка публічного веб-сайту з використанням Next.js",
          "Створення панелі адміністратора для управління контентом",
          "Впровадження багатомовної системи для EN, UK, та SK",
          "Забезпечення повної адаптивності на всіх пристроях"
      ],
      certifications: [
          { name: "Advanced React", authority: "wesbos.com", year: "2023" }
      ],
      hobbies: ["Гірський велосипед", "Гра на гітарі"],
       achievements: [
        { icon: 'Users', name: 'Помічник спільноти', description: 'Активно допомагає новим учасникам та відповідає на запитання.' },
      ],
      quote: "Спочатку вирішіть проблему. Потім напишіть код.",
      quoteAuthor: "Джон Джонсон",
    },
    {
      id: 4,
      name: 'Антон Махнюк',
      role: 'Розробник програмного забезпечення',
      bio: "Антон зосереджується на основній логіці додатку, яка втілює Spekulus у життя. Він з'єднує складні функції дзеркала з бекенд-сервісами та відіграє важливу роль у тестуванні та забезпеченні стабільності програмного забезпечення.",
      location: "Варшава, Польща",
      languages: ["Українська", "Польська", "Англійська"],
      contributions: [
          "Реалізація основної логіки додатку на Raspberry Pi",
          "Інтеграція сторонніх API для погоди та керування розумним будинком",
          "Написання юніт- та інтеграційних тестів для забезпечення надійності",
          "Управління базою даних за допомогою Firebase"
      ],
      hobbies: ["Фотографія", "Відвідування нових ресторанів"],
      quote: "Розмови дешеві. Покажи мені код.",
      quoteAuthor: "Лінус Торвальдс",
    },
    {
      id: 5,
      name: 'Максим Стеценко',
      role: 'Інженер зі штучного інтелекту',
      bio: "Максим — це інтелект, що стоїть за найрозумнішими функціями Spekulus. Він розробляє та навчає моделі ШІ для розпізнавання облич, аналізу шкіри та виявлення стресу, оптимізуючи їх для високої продуктивності на вбудованому обладнанні.",
      location: "Віддалено",
      languages: ["Українська", "Англійська"],
      contributions: [
          "Розробка моделей комп'ютерного зору для аналізу обличчя",
          "Навчання ШІ для аналізу здоров'я шкіри та виявлення стресу",
          "Оптимізація моделей для продуктивності на Raspberry Pi з використанням TensorFlow Lite",
          "Дослідження та розробка майбутніх функцій ШІ"
      ],
      education: [
          { institution: "Національний технічний університет України «Київський політехнічний інститут імені Ігоря Сікорського»", degree: "Магістр наук зі штучного інтелекту", year: "2021" }
      ],
      hobbies: ["Гра в Го", "Внесок у відкриті проєкти ШІ"],
      achievements: [
         { icon: 'Lightbulb', name: 'Інноватор', description: 'Розробив новий підхід до оптимізації моделей.' },
      ],
      quote: "Питання про те, чи може комп'ютер думати, не цікавіше, ніж питання про те, чи може підводний човен плавати.",
      quoteAuthor: "Едсгер В. Дейкстра",
    },
  ],
  sk: [
    {
      id: 1,
      name: 'Anton Shyrko',
      role: 'CEO & Vedúci tímu',
      bio: "Anton je vizionárom za projektom Spekulus, vedie tím pevnou rukou a s vášňou pre inovatívne technológie. Koordinuje celkovú stratégiu projektu, vedie rozhodovanie a zabezpečuje súlad tímu s našimi ambicióznymi cieľmi. Verí v transparentný vývoj a budovanie produktov, ktoré skutočne zlepšujú každodenný život ľudí.\n\n### Základné filozofie\n\n- **Dizajn zameraný na používateľa**: Každá funkcia musí riešiť skutočný problém používateľa.\n- **Otvorená spolupráca**: Najlepšie nápady môžu prísť odkiaľkoľvek.\n- **Udržateľný rast**: Budovanie trvalej spoločnosti, ktorá si váži svojich ľudí.",
      location: "Kyjev, Ukrajina",
      languages: ["Ukrajinčina", "Angličtina", "Slovenčina"],
      contributions: [
          "Celková stratégia a vízia projektu",
          "Vedenie tímu a koordinácia",
          "Vzťahy so zainteresovanými stranami a investormi",
          "Finančné plánovanie a riadenie zdrojov"
      ],
      education: [
          { institution: "Taras Shevchenko National University of Kyiv", degree: "Magister v odbore počítačové vedy", year: "2020" }
      ],
      certifications: [
          { name: "Certifikovaný ScrumMaster (CSM)", authority: "Scrum Alliance", year: "2021" }
      ],
      hobbies: ["Turistika v Karpatoch", "Súťažný šach", "Čítanie sci-fi románov"],
      gallery: [
          { imageUrl: 'https://placehold.co/600x400.png', description: "Prezentácia na technickej konferencii", imageHint: "man presentation" },
          { imageUrl: 'https://placehold.co/600x400.png', description: "Tímový brainstorming", imageHint: "team meeting" },
          { imageUrl: 'https://placehold.co/600x400.png', description: "Práca na počiatočnom prototype", imageHint: "man coding" }
      ],
      achievements: [
        { icon: 'Rocket', name: 'Pionier', description: 'Jeden z prvých členov, ktorí sa pripojili k projektu.' },
        { icon: 'GitMerge', name: 'Prvý commit', description: 'Prispel k počiatočnej kódovej základni projektu.' },
        { icon: 'Lightbulb', name: 'Vizionár', description: 'Definoval základnú misiu a stratégiu Spekulus.' },
      ],
      quote: "Najlepší spôsob, ako predpovedať budúcnosť, je vynájsť ju.",
      quoteAuthor: "Alan Kay",
      featuredProject: {
          title: "Počiatočný prototyp Spekulus",
          description: "Úplne prvý proof-of-concept pre Spekulus, postavený na Raspberry Pi 3 a základnom Python skripte na otestovanie základnej funkcionality inteligentného zrkadla.",
          url: "#",
          imageUrl: 'https://placehold.co/1200x600.png',
          imageHint: "prototype circuit"
      },
    },
    {
      id: 2,
      name: 'Oleksandr Sokil',
      role: 'Technický riaditeľ (CTO)',
      bio: "Ako CTO je Oleksandr technickým architektom Spekulus. Je zodpovedný za systémovú architektúru, integráciu hardvéru a technický dohľad nad všetkými komponentmi zrkadla, čím zabezpečuje robustnú a škálovateľnú platformu.",
      location: "Ľvov, Ukrajina",
      languages: ["Ukrajinčina", "Angličtina"],
      contributions: [
          "Navrhovanie hardvérovo-softvérovej architektúry",
          "Výber a integrácia modulov Raspberry Pi a kamery",
          "Dohľad nad technickým vývojom a zabezpečením kvality",
          "Optimalizácia výkonu pre embedded systém"
      ],
      education: [
          { institution: "Lviv Polytechnic National University", degree: "Bakalár v elektrotechnike", year: "2019" }
      ],
      hobbies: ["Stavba vlastných dronov", "3D tlač"],
      achievements: [
        { icon: 'Rocket', name: 'Pionier', description: 'Jeden z prvých členov, ktorí sa pripojili k projektu.' },
        { icon: 'Star', name: 'Top prispievateľ', description: 'Má najviac commitov v hlavnom repozitári.' },
      ],
      quote: "Jednoduchosť je najvyššia forma sofistikovanosti.",
      quoteAuthor: "Leonardo da Vinci",
    },
    {
      id: 3,
      name: 'Andrii Kubai',
      role: 'Webový vývojár',
      bio: "Andrii je remeselníkom za webovou prezentáciou Spekulus. Vytvára a udržiava responzívny frontend pre webovú stránku a výkonné admin rozhranie, s dôrazom na používateľský zážitok a viacjazyčnú podporu.",
      location: "Ivano-Frankivsk, Ukrajina",
      languages: ["Ukrajinčina", "Angličtina"],
      contributions: [
          "Vývoj verejnej webovej stránky pomocou Next.js",
          "Vytvorenie admin panelu na správu obsahu",
          "Implementácia viacjazyčného systému pre EN, UK a SK",
          "Zabezpečenie plnej responzivity na všetkých zariadeniach"
      ],
      certifications: [
          { name: "Advanced React", authority: "wesbos.com", year: "2023" }
      ],
      hobbies: ["Horská cyklistika", "Hra na gitare"],
       achievements: [
        { icon: 'Users', name: 'Pomocník komunity', description: 'Aktívne pomáha novým členom a odpovedá na otázky.' },
      ],
      quote: "Najprv vyrieš problém. Potom napíš kód.",
      quoteAuthor: "John Johnson",
    },
    {
      id: 4,
      name: 'Anton Makhniuk',
      role: 'Softvérový vývojár',
      bio: "Anton sa zameriava na logiku jadra aplikácie, ktorá oživuje Spekulus. Spája komplexné funkcie zrkadla s backend službami a hrá dôležitú úlohu v testovaní a zabezpečovaní stability softvéru.",
      location: "Varšava, Poľsko",
      languages: ["Ukrajinčina", "Poľština", "Angličtina"],
      contributions: [
          "Implementácia logiky jadra aplikácie na Raspberry Pi",
          "Integrácia API tretích strán pre počasie a ovládanie inteligentnej domácnosti",
          "Písanie jednotkových a integračných testov na zabezpečenie spoľahlivosti",
          "Správa databázy pomocou Firebase"
      ],
      hobbies: ["Fotografovanie", "Objavovanie nových reštaurácií"],
      quote: "Reči sú lacné. Ukáž mi kód.",
      quoteAuthor: "Linus Torvalds",
    },
    {
      id: 5,
      name: 'Maksym Stetsenko',
      role: 'Inžinier umelej inteligencie',
      bio: "Maksym je inteligencia za najchytrejšími funkciami Spekulus. Vyvíja a trénuje modely AI na rozpoznávanie tváre, analýzu pleti a detekciu stresu, pričom ich optimalizuje pre vysoký výkon na embedded hardvéri.",
      location: "Vzdialene",
      languages: ["Ukrajinčina", "Angličtina"],
      contributions: [
          "Vývoj modelov počítačového videnia na analýzu tváre",
          "Trénovanie AI na analýzu zdravia pleti a detekciu stresu",
          "Optimalizácia modelov pre výkon na Raspberry Pi pomocou TensorFlow Lite",
          "Výskum a vývoj budúcich funkcií AI"
      ],
      education: [
          { institution: "Igor Sikorsky Kyiv Polytechnic Institute", degree: "M.Sc. v umelej inteligencii", year: "2021" }
      ],
      hobbies: ["Hra Go", "Prispievanie do open-source AI projektov"],
      achievements: [
         { icon: 'Lightbulb', name: 'Inovátor', description: 'Vyvinul nový prístup k optimalizácii modelov.' },
      ],
      quote: "Otázka, či počítač dokáže myslieť, nie je o nič zaujímavejšia ako otázka, či ponorka dokáže plávať.",
      quoteAuthor: "Edsger W. Dijkstra",
    },
  ]
};

const rawAdvantagesData: Record<Language, PartialBy<Advantage, 'icon'>[]> = {
  en: [
    {
      id: 1,
      icon: 'ScanFace',
      title: 'AI-Powered Skin Diagnostics',
      description: 'Analyze your skin in real time and receive personalized beauty and skincare recommendations using AI.',
    },
    {
      id: 2,
      icon: 'Activity',
      title: 'Stress & Health Monitoring',
      description: 'Spekulus evaluates your emotional and physical state and gives you feedback to help reduce stress and fatigue.',
    },
    {
      id: 3,
      icon: 'Home',
      title: 'Smart Environment Sync',
      description: 'Integrates with your smart home, allowing control over lighting, music, calendars, weather, and more.',
    },
    {
      id: 4,
      icon: 'Frame',
      title: 'Elegant Minimalist Design',
      description: 'Designed to fit into any interior with premium materials and a sleek, modern look.',
    },
    {
      id: 5,
      icon: 'Languages',
      title: 'Multilingual Experience',
      description: 'Use Spekulus in English, Ukrainian, or Slovak with a single click—customized to your language preference.',
    },
    {
      id: 6,
      icon: 'GitMerge',
      title: 'Transparent & Community-Driven',
      description: 'Track development progress and features in real time via our public roadmap and dev notes.',
    },
  ],
  uk: [
    {
        id: 1,
        title: 'Діагностика шкіри за допомогою ШІ',
        description: 'Аналізуйте свою шкіру в реальному часі та отримуйте персоналізовані рекомендації щодо краси та догляду за шкірою за допомогою ШІ.',
    },
    {
        id: 2,
        title: 'Моніторинг стресу та здоров\'я',
        description: 'Spekulus оцінює ваш емоційний та фізичний стан і надає зворотний зв\'язок, щоб допомогти зменшити стрес та втому.',
    },
    {
        id: 3,
        title: 'Синхронізація з розумним середовищем',
        description: 'Інтегрується з вашим розумним будинком, дозволяючи керувати освітленням, музикою, календарями, погодою тощо.',
    },
    {
        id: 4,
        title: 'Елегантний мінімалістичний дизайн',
        description: 'Розроблено для будь-якого інтер\'єру з преміальних матеріалів та витонченим, сучасним виглядом.',
    },
    {
        id: 5,
        title: 'Багатомовний досвід',
        description: 'Використовуйте Spekulus англійською, українською або словацькою мовами одним кліком — налаштовано відповідно до ваших мовних уподобань.',
    },
    {
        id: 6,
        title: 'Прозорість та орієнтація на спільноту',
        description: 'Відстежуйте прогрес розробки та нові функції в реальному часі через нашу публічну дорожню карту та нотатки розробників.',
    },
  ],
  sk: [
    {
        id: 1,
        title: 'Diagnostika pleti pomocou AI',
        description: 'Analyzujte svoju pleť v reálnom čase a získajte personalizované odporúčania pre krásu a starostlivosť o pleť pomocou AI.',
    },
    {
        id: 2,
        title: 'Monitorovanie stresu a zdravia',
        description: 'Spekulus hodnotí váš emocionálny a fyzický stav a poskytuje spätnú väzbu, ktorá vám pomôže znížiť stres a únavu.',
    },
    {
        id: 3,
        title: 'Synchronizácia s inteligentným prostredím',
        description: 'Integruje sa s vašou inteligentnou domácnosťou a umožňuje ovládanie osvetlenia, hudby, kalendárov, počasia a ďalších.',
    },
    {
        id: 4,
        title: 'Elegantný minimalistický dizajn',
        description: 'Navrhnuté tak, aby sa hodilo do každého interiéru s prémiovými materiálmi a elegantným, moderným vzhľadom.',
    },
    {
        id: 5,
        title: 'Viacjazyčný zážitok',
        description: 'Používajte Spekulus v angličtine, ukrajinčine alebo slovenčine jediným kliknutím – prispôsobené vašim jazykovým preferenciám.',
    },
    {
        id: 6,
        title: 'Transparentnosť a orientácia na komunitu',
        description: 'Sledujte pokrok vo vývoji a funkcie v reálnom čase prostredníctvom našej verejnej cestovnej mapy a poznámok vývojárov.',
    },
  ]
};

const rawActionSectionData: Record<Language, Partial<ActionSectionData>> = {
  en: {
    title: 'See Spekulus in Action',
    subtitle: 'A glimpse of how our smart mirror fits into your everyday life.',
    description: 'Our smart mirror seamlessly integrates into any modern living space. With its edge-to-edge display and minimalist design, Spekulus is both a functional centerpiece and a work of art, providing essential information without disrupting your home\'s aesthetic.',
    imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026848/spekulus/action-section/smart_mirror_lifestyle.png',
    imageHint: 'smart mirror lifestyle',
    visible: true,
    buttonText: 'Learn More',
    buttonUrl: 'https://antot-12.github.io/Spekulus-Presentation/',
    buttonVisible: true,
  },
  uk: {
    title: 'Spekulus в дії',
    subtitle: 'Погляд на те, як наше розумне дзеркало вписується у ваше повсякденне життя.',
    description: 'Наше розумне дзеркало бездоганно інтегрується в будь-який сучасний житловий простір. Завдяки дисплею від краю до краю та мінімалістичному дизайну, Spekulus є одночасно функціональним центральним елементом та витвором мистецтва, надаючи важливу інформацію, не порушуючи естетику вашого дому.',
    buttonText: 'Дізнатися більше',
  },
  sk: {
    title: 'Pozrite sa na Spekulus v akcii',
    subtitle: 'Náhľad na to, ako sa naše inteligentné zrkadlo hodí do vášho každodenného života.',
    description: 'Naše inteligentné zrkadlo sa bez problémov integruje do každého moderného obytného priestoru. S displejom od okraja po okraj a minimalistickým dizajnom je Spekulus funkčným stredobodom aj umeleckým dielom, ktoré poskytuje dôležité informácie bez narušenia estetiky vášho domova.',
    buttonText: 'Zistiť viac',
  }
};

const rawHeroSectionData: Record<Language, Partial<HeroSectionData>> = {
  en: {
    title: 'Spekulus: Reflect Smarter, Live Better.',
    subtitle: 'The world\'s most advanced smart mirror, designed to be the center of your wellness and daily routine.',
    imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026850/spekulus/hero/smart_mirror.png',
    imageHint: 'smart mirror',
  },
  uk: {
    title: 'Spekulus: Роздумуйте розумніше, живіть краще.',
    subtitle: 'Найсучасніше у світі розумне дзеркало, розроблене, щоб стати центром вашого здоров\'я та щоденної рутини.',
  },
  sk: {
    title: 'Spekulus: Odrážajte inteligentnejšie, žite lepšie.',
    subtitle: 'Najpokročilejšie inteligentné zrkadlo na svete, navrhnuté ako centrum vášho wellness a dennej rutiny.',
  }
};

const rawProductSectionData: Record<Language, Partial<ProductSectionData>> = {
  en: {
    title: 'The Anatomy of a Smart Mirror',
    subtitle: 'Four core components working in harmony for an unparalleled experience.',
    components: [
      {
        id: 1,
        icon: 'ScanEye',
        title: 'Body: The Display',
        description: 'A stunning, crystal-clear 4K display that transforms from a perfect mirror to a vibrant information hub seamlessly.',
        imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026850/spekulus/product/body-the-display/mirror_display.png',
        imageHint: 'mirror display'
      },
      {
        id: 2,
        icon: 'Cpu',
        title: 'Brains: The Compute',
        description: 'Powered by a Raspberry Pi 5 with 8GB of RAM, ensuring swift, responsive performance for all your apps and analyses.',
        imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026851/spekulus/product/brains-the-compute/raspberry_pi.png',
        imageHint: 'raspberry pi'
      },
      {
        id: 3,
        icon: 'BrainCircuit',
        title: 'Eyes: The Camera',
        description: 'A high-resolution camera array for precise facial recognition and in-depth skin analysis, with a physical privacy shutter.',
        imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026849/spekulus/product/eyes-the-camera/camera_lens.png',
        imageHint: 'camera lens'
      },
      {
        id: 4,
        icon: 'HeartPulse',
        title: 'Heart: The AI',
        description: 'Our proprietary AI software that learns and adapts to you, providing personalized insights and wellness recommendations.',
        imageUrl: 'https://res.cloudinary.com/dmytrzu4t/image/upload/v1722026850/spekulus/product/heart-the-ai/software_code.png',
        imageHint: 'software code'
      },
    ]
  },
  uk: {
    title: 'Анатомія розумного дзеркала',
    subtitle: 'Чотири основні компоненти, що працюють в гармонії для неперевершеного досвіду.',
    components: [
        { id: 1, title: 'Тіло: Дисплей', description: 'Вражаючий, кришталево чистий 4K-дисплей, який плавно перетворюється з ідеального дзеркала на яскравий інформаційний центр.' },
        { id: 2, title: 'Мозок: Обчислювальний модуль', description: 'Працює на Raspberry Pi 5 з 8 ГБ оперативної пам\'яті, забезпечуючи швидку та чутливу продуктивність для всіх ваших додатків та аналізів.' },
        { id: 3, title: 'Очі: Камера', description: 'Масив камер високої роздільної здатності для точного розпізнавання обличчя та поглибленого аналізу шкіри, з фізичною шторкою для конфіденційності.' },
        { id: 4, title: 'Серце: ШІ', description: 'Наше власне програмне забезпечення ШІ, яке навчається та адаптується до вас, надаючи персоналізовані поради та рекомендації щодо здоров\'я.' },
    ]
  },
  sk: {
    title: 'Anatómia inteligentného zrkadla',
    subtitle: 'Štyri základné komponenty, ktoré pracujú v harmónii pre neprekonateľný zážitok.',
    components: [
        { id: 1, title: 'Telo: Displej', description: 'Ohromujúci, krištáľovo čistý 4K displej, ktorý sa plynule mení z dokonalého zrkadla na živé informačné centrum.' },
        { id: 2, title: 'Mozog: Výpočtový modul', description: 'Poháňaný Raspberry Pi 5 s 8 GB RAM, čo zaručuje rýchly a citlivý výkon pre všetky vaše aplikácie a analýzy.' },
        { id: 3, title: 'Oči: Kamera', description: 'Sústava kamier s vysokým rozlíšením pre presné rozpoznávanie tváre a hĺbkovú analýzu pleti, s fyzickým krytom pre súkromie.' },
        { id: 4, title: 'Srdce: AI', description: 'Náš vlastný softvér s umelou inteligenciou, ktorý sa učí a prispôsobuje vám, poskytujúc personalizované poznatky a wellness odporúčania.' },
    ]
  }
};


const mergeData = <T extends { id: number }>(baseData: T[], langData: PartialBy<T, keyof T>[]) => {
  return baseData.map(baseItem => {
    const langItem = langData.find(item => item.id === baseItem.id);
    return { ...baseItem, ...langItem };
  }) as T[];
};

const devNotes: Record<Language, DevNote[]> = {
  en: rawDevNotes.en as DevNote[],
  uk: mergeData(rawDevNotes.en as DevNote[], rawDevNotes.uk),
  sk: mergeData(rawDevNotes.en as DevNote[], rawDevNotes.sk),
};

const roadmapEvents: Record<Language, RoadmapEvent[]> = {
    en: rawRoadmapEvents.en as RoadmapEvent[],
    uk: rawRoadmapEvents.en.map((base, i) => ({...base, ...rawRoadmapEvents.uk[i]})) as RoadmapEvent[],
    sk: rawRoadmapEvents.en.map((base, i) => ({...base, ...rawRoadmapEvents.sk[i]})) as RoadmapEvent[],
}

const faqData: Record<Language, FaqItem[]> = {
    en: rawFaqData.en,
    uk: rawFaqData.uk,
    sk: rawFaqData.sk
};

const mergeCreators = (base: RawCreator, lang: RawCreator): Creator => {
  const merged = { ...base, ...lang } as Creator;
  if (lang.featuredProject || base.featuredProject) {
    merged.featuredProject = {
      ...(base.featuredProject || { title: '', url: '', description: '', imageUrl: '', imageHint: ''}),
      ...(lang.featuredProject || {}),
    } as FeaturedProject
  }
  if (lang.gallery || base.gallery) {
    merged.gallery = (base.gallery || []).map((baseImg, i) => ({
      ...baseImg,
      ...(lang.gallery?.[i] || {}),
    }))
  }
  return merged;
}

const creatorsData: Record<Language, Creator[]> = {
  en: rawCreatorsData.en as Creator[],
  uk: rawCreatorsData.en.map(baseCreator => {
    const langCreator = rawCreatorsData.uk.find(c => c.id === baseCreator.id);
    return mergeCreators(baseCreator, langCreator || { id: baseCreator.id, socials: {} });
  }),
  sk: rawCreatorsData.en.map(baseCreator => {
    const langCreator = rawCreatorsData.sk.find(c => c.id === baseCreator.id);
    return mergeCreators(baseCreator, langCreator || { id: baseCreator.id, socials: {} });
  }),
}

const advantagesData: Record<Language, Advantage[]> = {
  en: rawAdvantagesData.en as Advantage[],
  uk: mergeData(rawAdvantagesData.en as Advantage[], rawAdvantagesData.uk),
  sk: mergeData(rawAdvantagesData.en as Advantage[], rawAdvantagesData.sk),
};

const actionSectionData: Record<Language, ActionSectionData> = {
    en: rawActionSectionData.en as ActionSectionData,
    uk: { ...rawActionSectionData.en, ...rawActionSectionData.uk } as ActionSectionData,
    sk: { ...rawActionSectionData.en, ...rawActionSectionData.sk } as ActionSectionData,
}

const heroSectionData: Record<Language, HeroSectionData> = {
    en: rawHeroSectionData.en as HeroSectionData,
    uk: { ...rawHeroSectionData.en, ...rawHeroSectionData.uk } as HeroSectionData,
    sk: { ...rawHeroSectionData.en, ...rawHeroSectionData.sk } as HeroSectionData,
};

const mergeProductData = (lang: Language): ProductSectionData => {
    const baseData = rawProductSectionData.en as ProductSectionData;
    const langData = rawProductSectionData[lang];
    return {
        ...baseData,
        ...langData,
        components: baseData.components.map(baseComponent => {
            const langComponent = langData.components?.find(c => c.id === baseComponent.id);
            return { ...baseComponent, ...langComponent };
        })
    }
}

const productSectionData: Record<Language, ProductSectionData> = {
    en: rawProductSectionData.en as ProductSectionData,
    uk: mergeProductData('uk'),
    sk: mergeProductData('sk'),
};

export const initialData = {
    devNotes,
    roadmapEvents,
    faqData,
    creatorsData,
    advantagesData,
    actionSectionData,
    heroSectionData,
    productSectionData,
};
