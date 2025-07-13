
export type Language = 'en' | 'uk' | 'sk';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// ==================================
// DEV NOTES
// ==================================
export type DevNote = {
  id: number;
  slug: string;
  date: Date;
  title: string;
  summary: string;
  content: string;
  imageId?: number | null;
  author?: string;
  tags?: string[];
  isVisible?: boolean;
  reactionCounts?: Record<string, number>;
};

// ==================================
// ROADMAP
// ==================================
export type RoadmapEvent = {
    id: number;
    date: string;
    title: string;
    description: string;
};

// ==================================
// FAQ
// ==================================
export type FaqItem = {
    id: number;
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
  imageId: number;
  description: string;
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
  imageId?: number | null;
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
  featuredProjectImageId?: number | null;
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
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageId?: number | null;
  visible: boolean;
  buttonText: string;
  buttonUrl: string;
  buttonVisible: boolean;
};

// ==================================
// HERO SECTION
// ==================================
export type HeroFeature = {
  id: number;
  text: string;
  icon: string;
};

export type HeroSectionData = {
  id: number;
  title: string;
  subtitle: string;
  imageId?: number | null;
  features: HeroFeature[];
};

// ==================================
// PRODUCT SECTION
// ==================================
export type ProductComponent = {
  id: number;
  icon: string;
  title: string;
  description: string;
  imageId?: number | null;
};

export type ProductSectionData = {
  title: string;
  subtitle: string;
  components: ProductComponent[];
};

// ==================================
// SCENARIOS
// ==================================
export type Scenario = {
  id: number;
  icon: string;
  question: string;
  answer: string;
};

// ==================================
// COMPETITOR COMPARISON
// ==================================
export type CompetitorFeature = {
    id: number;
    feature: string;
    spekulus: boolean;
    himirror: boolean;
    simplehuman: boolean;
    mirrocool: boolean;
}

export type ComparisonSectionData = {
  id: number;
  title: string;
  subtitle: string;
}

// ==================================
// PARTNER CTA
// ==================================
export type PartnerSectionData = {
  id: number;
  title: string;
  text: string;
  ctaLabel: string;
  ctaUrl?: string | null;
  imageId?: number | null;
};

// ==================================
// INITIAL DATA FOR SEEDING
// ==================================

// This object contains all the initial data that will be used to seed the database.
// It is kept separate to clearly distinguish between the data types and the data itself.

const rawDevNotes: Record<Language, PartialBy<DevNote, 'id'>[]> = {
  en: [
    { 
      slug: "backend-integration-update",
      date: new Date("2024-07-22"),
      title: "Backend Integration Nears Completion",
      summary: "The backend integration for our new stress detection API is now 75% complete. The team is now shifting focus to calibration and fine-tuning for the next sprint.",
      content: "We're excited to report significant progress on the new stress detection API. The core logic is in place, and we have successfully connected the frontend data streams to the backend processing services.\\n\\nOur next major hurdle is calibration. This involves testing with a diverse dataset to ensure accuracy across different lighting conditions and user demographics. We're on track for an internal beta next month.\\n\\n> We believe this feature will be a game-changer for proactive wellness management.\\n\\nStay tuned for more updates!",
      author: "Anton Shyrko",
      tags: ["Backend", "API", "Update"],
      isVisible: true,
      reactionCounts: {},
    },
    { 
      slug: "skin-analysis-refactor",
      date: new Date("2024-07-18"),
      title: "Refactoring the Skin Analysis Model",
      summary: "To improve performance in low-light conditions, we've begun refactoring the skin analysis model. Early results are very promising, showing a significant reduction in noise.",
      content: "User feedback indicated that our skin analysis feature could be unreliable in sub-optimal lighting. To address this, we are undertaking a complete refactor of the underlying machine learning model.\\n\\nBy incorporating new data augmentation techniques and a more robust architecture, we're already seeing a **40% improvement in accuracy** during our internal benchmarks. The image below shows a comparison of the old model (left) vs. the new model (right) on a low-light sample.\\n\\nThis enhancement will ensure that Spekulus provides reliable insights regardless of the environment.",
      author: "Maksym Stetsenko",
      tags: ["AI/ML", "Research", "Update"],
      isVisible: true,
      reactionCounts: {},
    },
  ],
  uk: [
    {
        slug: "backend-integration-update",
        date: new Date("2024-07-22"),
        title: "Інтеграція бекенду майже завершена",
        summary: "Інтеграція бекенду для нашого нового API виявлення стресу завершена на 75%. Команда переходить до калібрування та налаштування на наступний спринт.",
        content: "Ми раді повідомити про значний прогрес у розробці нового API для виявлення стресу. Основна логіка реалізована, і ми успішно підключили потоки даних з фронтенду до сервісів обробки на бекенді.\\n\\nНаступною великою перешкодою є калібрування. Це включає тестування з різноманітним набором даних для забезпечення точності за різних умов освітлення та демографічних характеристик користувачів. Ми плануємо вийти на внутрішню бету наступного місяця.\\n\\n> Ми віримо, що ця функція кардинально змінить підхід до проактивного управління здоров'ям.\\n\\nСлідкуйте за новинами!",
        author: "Антон Ширко",
        tags: ["Бекенд", "API", "Оновлення"],
    },
    {
        slug: "skin-analysis-refactor",
        date: new Date("2024-07-18"),
        title: "Рефакторинг моделі аналізу шкіри",
        summary: "Для покращення продуктивності в умовах недостатнього освітлення ми розпочали рефакторинг моделі аналізу шкіри. Перші результати дуже перспективні, показуючи значне зменшення шуму.",
        content: "Відгуки користувачів показали, що наша функція аналізу шкіри може бути ненадійною при недостатньому освітленні. Щоб вирішити цю проблему, ми проводимо повний рефакторинг базової моделі машинного навчання.\\n\\nЗавдяки впровадженню нових технік аугментації даних та більш надійної архітектури, ми вже бачимо **40% покращення точності** під час наших внутрішніх тестів. На зображенні нижче показано порівняння старої моделі (ліворуч) та нової моделі (праворуч) на зразку з низьким освітленням.\\n\\nЦе вдосконалення забезпечить надійні дані від Spekulus незалежно від середовища.",
        author: "Максим Стеценко",
        tags: ["AI/ML", "Дослідження", "Оновлення"],
    },
  ],
  sk: [
    {
        slug: "backend-integration-update",
        date: new Date("2024-07-22"),
        title: "Integrácia backendu sa blíži ku koncu",
        summary: "Integrácia backendu pre naše nové API na detekciu stresu je teraz na 75% hotová. Tím sa teraz zameriava na kalibráciu a jemné ladenie na ďalší šprint.",
        content: "S radosťou oznamujeme významný pokrok v našom novom API na detekciu stresu. Jadro logiky je na mieste a úspešne sme prepojili dátové toky z frontendu so službami na spracovanie na backende.\\n\\nNašou ďalšou veľkou prekážkou je kalibrácia. To zahŕňa testovanie s rôznorodým súborom údajov, aby sa zabezpečila presnosť v rôznych svetelných podmienkach a u rôznych demografických skupín používateľov. Sme na dobrej ceste k internej beta verzii budúci mesiac.\\n\\n> Veríme, že táto funkcia zmení pravidlá hry v proaktívnom manažmente wellnessu.\\n\\nZostaňte naladení na ďalšie aktualizácie!",
        author: "Anton Shyrko",
        tags: ["Backend", "API", "Aktualizácia"],
    },
    {
        slug: "skin-analysis-refactor",
        date: new Date("2024-07-18"),
        title: "Refaktorovanie modelu analýzy pleti",
        summary: "S cieľom zlepšiť výkon v podmienkach slabého osvetlenia sme začali refaktorovať model analýzy pleti. Prvé výsledky sú veľmi sľubné a ukazujú výrazné zníženie šumu.",
        content: "Spätná väzba od používateľov naznačila, že naša funkcia analýzy pleti môže byť nespoľahlivá v neoptimálnom osvetlení. Na riešenie tohto problému sme sa pustili do kompletného refaktorovania základného modelu strojového učenia.\\n\\nZačlenením nových techník augmentácie dát a robustnejšej architektúry už teraz vidíme **40% zlepšenie presnosti** počas našich interných testov. Obrázok nižšie ukazuje porovnanie starého modelu (vľavo) a nového modelu (vpravo) na vzorke so slabým osvetlením.\\n\\nToto vylepšenie zabezpečí, že Spekulus bude poskytovať spoľahlivé poznatky bez ohľadu na prostredie.",
        author: "Maksym Stetsenko",
        tags: ["AI/ML", "Výskum", "Aktualizácia"],
    },
  ]
};

const rawRoadmapEvents: Record<Language, PartialBy<RoadmapEvent, 'id'>[]> = {
  en: [
    { date: "2024-04-28", title: "Idea Creation", description: "The birth of Spekulus. Initial concept and mission defined." },
    { date: "2024-07-16", title: "Demo Release", description: "First functional prototype demonstrated to early investors and partners." },
    { date: "2024-12-16", title: "Implementation Start", description: "Official start of the development phase. Core team assembled." },
    { date: "Q4 2025", title: "Widget Store Release", description: "Launch of the Spekulus widget store for third-party widgets and custom modules." },
    { date: "Q2 2026", title: "AI Makeup Tool", description: "Implementation of the virtual AI-driven makeup assistant with facial recognition." },
    { date: "Q3 2026", title: "Official Product Release", description: "Spekulus smart mirror becomes publicly available." },
    { date: "Q4 2026", title: "Entry into Slovak Market", description: "Initial launch of Spekulus in Slovakia as the first step in regional expansion." },
  ],
  uk: [
    { date: "2024-04-28", title: "Створення ідеї", description: "Народження Spekulus. Визначено початкову концепцію та місію." },
    { date: "2024-07-16", title: "Випуск демо-версії", description: "Перший функціональний прототип продемонстровано раннім інвесторам та партнерам." },
    { date: "2024-12-16", title: "Початок реалізації", description: "Офіційний старт етапу розробки. Сформовано основну команду." },
    { date: "Q4 2025", title: "Запуск магазину віджетів", description: "Запуск магазину віджетів Spekulus для сторонніх віджетів та кастомних модулів." },
    { date: "Q2 2026", title: "Інструмент для макіяжу зі ШІ", description: "Впровадження віртуального асистента для макіяжу на основі ШІ з розпізнаванням обличчя." },
    { date: "Q3 2026", title: "Офіційний випуск продукту", description: "Розумне дзеркало Spekulus стає доступним для широкого загалу." },
    { date: "Q4 2026", title: "Вихід на словацький ринок", description: "Початковий запуск Spekulus у Словаччині як перший крок регіональної експанзії." },
  ],
  sk: [
    { date: "2024-04-28", title: "Vytvorenie nápadu", description: "Zrod Spekulus. Definovanie počiatočného konceptu a misie." },
    { date: "2024-07-16", title: "Vydanie dema", description: "Prvý funkčný prototyp demonštrovaný prvým investorom a partnerom." },
    { date: "2024-12-16", title: "Začiatok implementácie", description: "Oficiálny začiatok vývojovej fázy. Zostavenie hlavného tímu." },
    { date: "Q4 2025", title: "Spustenie Widget Store", description: "Spustenie obchodu s widgetmi Spekulus pre widgety tretích strán a vlastné moduly." },
    { date: "Q2 2026", title: "Nástroj na líčenie s AI", description: "Implementácia virtuálneho asistenta pre líčenie poháňaného AI s rozpoznávaním tváre." },
    { date: "Q3 2026", title: "Oficiálne vydanie produktu", description: "Inteligentné zrkadlo Spekulus sa stáva verejne dostupným." },
    { date: "Q4 2026", title: "Vstup na slovenský trh", description: "Počiatočné spustenie Spekulus na Slovensku ako prvý krok regionálnej expanzie." },
  ]
};

const rawFaqData: Record<Language, PartialBy<FaqItem, 'id'>[]> = {
  en: [
    { question: 'What is Spekulus?', answer: 'Spekulus is an innovative smart mirror developed by us. It combines health monitoring, weather awareness, and smart home integration into a single, elegant device. With built-in AI and a camera, it delivers personalized insights to help you live smarter and healthier.' },
    { question: 'How does Spekulus detect stress and analyze health?', answer: 'Spekulus uses a Raspberry Pi camera to capture facial data and our custom AI software to analyze it. The system detects visible signs of stress, fatigue, or skin issues, then offers practical wellness tips, such as breathing exercises or reminders to rest.' },
    { question: 'What is the Widget Store?', answer: 'The Widget Store is a unique Spekulus feature launching in Q4 2025. It allows users to customize their mirror experience by downloading various widgets. Think of it as your mirror’s app store. You can [learn more about our roadmap](#roadmap) for its release.' },
    { question: 'What makes Spekulus different from other smart mirrors?', answer: 'Unlike most competitors, Spekulus focuses not just on cosmetic features but on health and well-being. It offers a holistic daily assistant: stress tracking, weather forecasts, skincare analysis, and smart assistant functions all in one device.' },
    { question: 'Who is behind Spekulus?', answer: 'Our team at S&S Creation includes developers, AI engineers, and tech visionaries passionate about improving daily life through smart technology. We’re currently seeking partnerships and funding to take Spekulus to the next level. [Meet the team](/creators).' },
  ],
  uk: [
    { question: 'Що таке Spekulus?', answer: 'Spekulus — це інноваційне розумне дзеркало, розроблене нами. Воно поєднує моніторинг здоров\'я, інформацію про погоду та інтеграцію з розумним будинком в одному елегантному пристрої. Завдяки вбудованому ШІ та камері, воно надає персоналізовані поради, щоб допомогти вам жити розумніше та здоровіше.' },
    { question: 'Як Spekulus виявляє стрес та аналізує здоров\'я?', answer: 'Spekulus використовує камеру Raspberry Pi для збору даних обличчя та наше власне програмне забезпечення ШІ для їх аналізу. Система виявляє видимі ознаки стресу, втоми чи проблем зі шкірою, а потім пропонує практичні поради для покращення самопочуття, наприклад, дихальні вправи або нагадування про відпочинок.' },
    { question: 'Що таке Widget Store?', answer: 'Widget Store — це унікальна функція Spekulus, яка запускається в 4-му кварталі 2025 року. Вона дозволяє користувачам налаштовувати своє дзеркало, завантажуючи різноманітні віджети. Вважайте це магазином додатків для вашого дзеркала. Ви можете [дізнатися більше про нашу дорожню карту](#roadmap) щодо його випуску.' },
    { question: 'Чим Spekulus відрізняється від інших розумних дзеркал?', answer: 'На відміну від більшості конкурентів, Spekulus зосереджується не лише на косметичних функціях, а й на здоров\'ї та добробуті. Він пропонує комплексного щоденного асистента: відстеження стресу, прогнози погоди, аналіз шкіри та функції розумного помічника — все в одному пристрої.' },
    { question: 'Хто стоїть за Spekulus?', answer: 'Наша команда в S&S Creation складається з розробників, інженерів ШІ та технологічних візіонерів, які захоплені покращенням повсякденного життя за допомогою розумних технологій. Наразі ми шукаємо партнерства та фінансування, щоб вивести Spekulus на новий рівень. [Зустрічайте команду](/creators).' },
  ],
  sk: [
    { question: 'Čo je Spekulus?', answer: 'Spekulus je inovatívne inteligentné zrkadlo, ktoré sme vyvinuli. Spája monitorovanie zdravia, informovanosť o počasí a integráciu s inteligentnou domácnosťou do jediného elegantného zariadenia. So zabudovanou umelou inteligenciou a kamerou poskytuje personalizované poznatky, ktoré vám pomôžu žiť inteligentnejšie a zdravšie.' },
    { question: 'Ako Spekulus zisťuje stres a analyzuje zdravie?', answer: 'Spekulus používa kameru Raspberry Pi na zachytávanie údajov o tvári a náš vlastný softvér s umelou inteligenciou na ich analýzu. Systém zisťuje viditeľné známky stresu, únavy alebo kožných problémov a potom ponúka praktické wellness tipy, ako sú dychové cvičenia alebo pripomienky na odpočinok.' },
    { question: 'Čo je Widget Store?', answer: 'Widget Store je jedinečná funkcia Spekulus, ktorá bude spustená v 4. štvrťroku 2025. Umožňuje používateľom prispôsobiť si zážitok so zrkadlom sťahovaním rôznych widgetov. Predstavte si to ako obchod s aplikáciami pre vaše zrkadlo. Môžete sa [dozvedieť viac o našej cestovnej mape](#roadmap) pre jeho vydanie.' },
    { question: 'Čím sa Spekulus líši od ostatných inteligentných zrkadiel?', answer: 'Na rozdiel od väčšiny konkurentov sa Spekulus nezameriava len na kozmetické funkcie, ale aj na zdravie a pohodu. Ponúka komplexného denného asistenta: sledovanie stresu, predpovede počasia, analýzu pleti a funkcie inteligentného asistenta v jednom zariadení.' },
    { question: 'Kto stojí za Spekulus?', answer: 'Náš tím v S&S Creation zahŕňa vývojárov, inžinierov umelej inteligencie a technologických vizionárov, ktorí sú nadšení pre zlepšovanie každodenného života prostredníctvom inteligentných technológií. V súčasnosti hľadáme partnerstvá a financovanie, aby sme posunuli Spekulus na ďalšiu úroveň. [Zoznámte sa s tímom](/creators).' },
  ]
};

const rawCreatorsData: Record<Language, PartialBy<Creator, 'id'>[]> = {
  en: [
    {
      slug: 'anton-shyrko',
      name: 'Anton Shyrko',
      role: 'CEO & Team Lead',
      bio: "Anton is the visionary behind Spekulus, guiding the team with a steady hand and a passion for innovative technology. He coordinates the overall project strategy, leads decision-making, and ensures the team's alignment with our ambitious goals. He believes in transparent development and building products that genuinely improve people's daily lives.\\n\\n### Core Philosophies\\n\\n- **User-Centric Design**: Every feature must solve a real user problem.\\n- **Open Collaboration**: The best ideas can come from anywhere.\\n- **Sustainable Growth**: Building a lasting company that values its people.",
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
      gallery: [],
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
      },
      isVisible: true,
    },
  ],
  uk: [
    {
      slug: 'anton-shyrko',
      name: 'Антон Ширко',
      role: 'CEO & Керівник команди',
      bio: "Антон — візіонер, що стоїть за Spekulus, він керує командою твердою рукою та пристрастю до інноваційних технологій. Він координує загальну стратегію проєкту, очолює прийняття рішень та забезпечує відповідність команди нашим амбітним цілям. Він вірить у прозору розробку та створення продуктів, які справді покращують повсякденне життя людей.\\n\\n### Основні філософії\\n\\n- **Дизайн, орієнтований на користувача**: Кожна функція повинна вирішувати реальну проблему користувача.\\n- **Відкрита співпраця**: Найкращі ідеї можуть прийти звідки завгодно.\\n- **Сталий розвиток**: Побудова довготривалої компанії, яка цінує своїх людей.",
      location: "Київ, Україна",
      socials: {}
    },
  ],
  sk: [
    {
      slug: 'anton-shyrko',
      name: 'Anton Shyrko',
      role: 'CEO & Vedúci tímu',
      bio: "Anton je vizionárom za projektom Spekulus, vedie tím pevnou rukou a s vášňou pre inovatívne technológie. Koordinuje celkovú stratégiu projektu, vedie rozhodovanie a zabezpečuje súlad tímu s našimi ambicióznymi cieľmi. Verí v transparentný vývoj a budovanie produktov, ktoré skutočne zlepšujú každodenný život ľudí.\\n\\n### Základné filozofie\\n\\n- **Dizajn zameraný na používateľa**: Každá funkcia musí riešiť skutočný problém používateľa.\\n- **Otvorená spolupráca**: Najlepšie nápady môžu prísť odkiaľkoľvek.\\n- **Udržateľný rast**: Budovanie trvalej spoločnosti, ktorá si váži svojich ľudí.",
      location: "Kyjev, Ukrajina",
      socials: {}
    },
  ]
};

const rawAdvantagesData: Record<Language, Advantage[]> = {
  en: [
    { id: 1, icon: 'ScanFace', title: 'AI-Powered Skin Diagnostics', description: 'Analyze your skin in real time and receive personalized beauty and skincare recommendations using AI.'},
    { id: 2, icon: 'Activity', title: 'Stress & Health Monitoring', description: 'Spekulus evaluates your emotional and physical state and gives you feedback to help reduce stress and fatigue.'},
    { id: 3, icon: 'Home', title: 'Smart Environment Sync', description: 'Integrates with your smart home, allowing control over lighting, music, calendars, weather, and more.'},
  ],
  uk: [
    { id: 4, icon: 'ScanFace', title: 'Діагностика шкіри за допомогою ШІ', description: 'Аналізуйте свою шкіру в реальному часі та отримуйте персоналізовані рекомендації щодо краси та догляду за шкірою за допомогою ШІ.'},
    { id: 5, icon: 'Activity', title: 'Моніторинг стресу та здоров\'я', description: 'Spekulus оцінює ваш емоційний та фізичний стан і дає вам зворотний зв\'язок, щоб допомогти зменшити стрес і втому.'},
    { id: 6, icon: 'Home', title: 'Синхронізація з розумним середовищем', description: 'Інтегрується з вашим розумним будинком, дозволяючи керувати освітленням, музикою, календарями, погодою та іншим.'},
  ],
  sk: [
    { id: 7, icon: 'ScanFace', title: 'Diagnostika pleti pomocou AI', description: 'Analyzujte svoju pleť v reálnom čase a získajte personalizované odporúčania pre krásu a starostlivosť o pleť pomocou AI.'},
    { id: 8, icon: 'Activity', title: 'Monitorovanie stresu a zdravia', description: 'Spekulus hodnotí váš emocionálny a fyzický stav a poskytuje vám spätnú väzbu, ktorá vám pomôže znížiť stres a únavu.'},
    { id: 9, icon: 'Home', title: 'Synchronizácia s inteligentným prostredím', description: 'Integruje sa s vaším inteligentným domom, čo umožňuje ovládanie osvetlenia, hudby, kalendárov, počasia a ďalších funkcií.'},
  ]
};

const rawActionSectionData: Record<Language, Omit<ActionSectionData, 'id'>> = {
  en: {
    title: 'See Spekulus in Action',
    subtitle: 'A glimpse of how our smart mirror fits into your everyday life.',
    description: 'Our smart mirror seamlessly integrates into any modern living space. With its edge-to-edge display and minimalist design, Spekulus is both a functional centerpiece and a work of art, providing essential information without disrupting your home\'s aesthetic.',
    visible: true,
    buttonText: 'Learn More',
    buttonUrl: 'https://antot-12.github.io/Spekulus-Presentation/',
    buttonVisible: true,
  },
  uk: {
    title: 'Spekulus в дії',
    subtitle: 'Погляд на те, як наше розумне дзеркало вписується у ваше повсякденне життя.',
    description: 'Наше розумне дзеркало бездоганно інтегрується в будь-який сучасний житловий простір. Завдяки дисплею від краю до краю та мінімалістичному дизайну, Spekulus є одночасно функціональним центральним елементом та витвором мистецтва, надаючи важливу інформацію, не порушуючи естетику вашого дому.',
    visible: true,
    buttonText: 'Дізнатися більше',
    buttonUrl: 'https://antot-12.github.io/Spekulus-Presentation/',
    buttonVisible: true,
  },
  sk: {
    title: 'Pozrite sa na Spekulus v akcii',
    subtitle: 'Náhľad na to, ako sa naše inteligentné zrkadlo hodí do vášho každodenného života.',
    description: 'Naše inteligentné zrkadlo sa bez problémov integruje do každého moderného obytného priestoru. S displejom od okraja po okraj a minimalistickým dizajnom je Spekulus funkčným stredobodom aj umeleckým dielom, ktoré poskytuje dôležité informácie bez narušenia estetiky vášho domova.',
    visible: true,
    buttonText: 'Zistiť viac',
    buttonUrl: 'https://antot-12.github.io/Spekulus-Presentation/',
    buttonVisible: true,
  }
};

const rawHeroFeaturesData: Record<Language, Omit<HeroFeature, 'id'>[]> = {
  en: [
    { text: 'Skin & Health Analysis', icon: 'CheckCircle' },
    { text: 'Stress Detection', icon: 'CheckCircle' },
    { text: 'Weather Awareness', icon: 'CheckCircle' },
    { text: 'Smart-Home Hub', icon: 'CheckCircle' },
  ],
  uk: [
    { text: 'Аналіз шкіри та здоров\'я', icon: 'CheckCircle' },
    { text: 'Виявлення стресу', icon: 'CheckCircle' },
    { text: 'Інформація про погоду', icon: 'CheckCircle' },
    { text: 'Центр розумного будинку', icon: 'CheckCircle' },
  ],
  sk: [
    { text: 'Analýza pleti a zdravia', icon: 'CheckCircle' },
    { text: 'Detekcia stresu', icon: 'CheckCircle' },
    { text: 'Informácie o počasí', icon: 'CheckCircle' },
    { text: 'Centrum inteligentnej domácnosti', icon: 'CheckCircle' },
  ],
};


const rawHeroSectionData: Record<Language, Omit<HeroSectionData, 'id' | 'features'>> = {
  en: {
    title: 'Spekulus: Reflect Smarter, Live Better.',
    subtitle: 'The world\'s most advanced smart mirror, designed to be the center of your wellness and daily routine.',
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
      },
      {
        id: 2,
        icon: 'Cpu',
        title: 'Brains: The Compute',
        description: 'Powered by a Raspberry Pi 5 with 8GB of RAM, ensuring swift, responsive performance for all your apps and analyses.',
      },
      {
        id: 3,
        icon: 'BrainCircuit',
        title: 'Eyes: The Camera',
        description: 'A high-resolution camera array for precise facial recognition and in-depth skin analysis, with a physical privacy shutter.',
      },
      {
        id: 4,
        icon: 'HeartPulse',
        title: 'Heart: The AI',
        description: 'Our proprietary AI software that learns and adapts to you, providing personalized insights and wellness recommendations.',
      },
    ]
  },
  uk: {
    title: 'Анатомія розумного дзеркала',
    subtitle: 'Чотири основні компоненти, що працюють в гармонії для неперевершеного досвіду.',
    components: [
        { id: 1, icon: 'ScanEye', title: 'Тіло: Дисплей', description: 'Вражаючий, кришталево чистий 4K-дисплей, який плавно перетворюється з ідеального дзеркала на яскравий інформаційний центр.' },
        { id: 2, icon: 'Cpu', title: 'Мозок: Обчислювальний модуль', description: 'Працює на Raspberry Pi 5 з 8 ГБ оперативної пам\'яті, забезпечуючи швидку та чутливу продуктивність для всіх ваших додатків та аналізів.' },
        { id: 3, icon: 'BrainCircuit', title: 'Очі: Камера', description: 'Масив камер високої роздільної здатності для точного розпізнавання обличчя та поглибленого аналізу шкіри, з фізичною шторкою для конфіденційності.' },
        { id: 4, icon: 'HeartPulse', title: 'Серце: ШІ', description: 'Наше власне програмне забезпечення ШІ, яке навчається та адаптується до вас, надаючи персоналізовані поради та рекомендації щодо здоров\'я.' },
    ]
  },
  sk: {
    title: 'Anatómia inteligentného zrkadla',
    subtitle: 'Štyri základné komponenty, ktoré pracujú v harmónii pre neprekonateľný zážitok.',
    components: [
        { id: 1, icon: 'ScanEye', title: 'Telo: Displej', description: 'Ohromujúci, krištáľovo čistý 4K displej, ktorý sa plynule mení z dokonalého zrkadla na živé informačné centrum.' },
        { id: 2, icon: 'Cpu', title: 'Mozog: Výpočtový modul', description: 'Poháňaný Raspberry Pi 5 s 8 GB RAM, čo zaručuje rýchly a citlivý výkon pre všetky vaše aplikácie a analýzy.' },
        { id: 3, icon: 'BrainCircuit', title: 'Oči: Kamera', description: 'Sústava kamier s vysokým rozlíšením pre presné rozpoznávanie tváre a hĺbkovú analýzu pleti, s fyzickým krytom pre súkromie.' },
        { id: 4, icon: 'HeartPulse', title: 'Srdce: AI', description: 'Náš vlastný softvér s umelou inteligenciou, ktorý sa učí a prispôsobuje vám, poskytujúc personalizované poznatky a wellness odporúčania.' },
    ]
  }
};

const rawScenariosData: Record<Language, Scenario[]> = {
  en: [
    { id: 1, icon: 'Coffee', question: "Feeling stressed after a long day?", answer: "Spekulus suggests a guided breathing exercise to help you unwind and lower your cortisol levels." },
    { id: 2, icon: 'Thermometer', question: "Not sure what to wear today?", answer: "Get an instant, real-time weather forecast and personalized outfit suggestions based on your calendar." },
    { id: 3, icon: 'Zap', question: "Notice a new blemish on your skin?", answer: "The AI-powered skin analysis identifies potential issues and recommends targeted care routines." },
    { id: 4, icon: 'Home', question: "Need to adjust the room's ambiance?", answer: "Use voice commands to dim the lights, play your favorite playlist, and prepare for your evening." },
  ],
  uk: [
    { id: 1, icon: 'Coffee', question: "Відчуваєте стрес після довгого дня?", answer: "Spekulus пропонує керовану дихальну вправу, щоб допомогти вам розслабитися та знизити рівень кортизолу." },
    { id: 2, icon: 'Thermometer', question: "Не знаєте, що одягнути сьогодні?", answer: "Отримайте миттєвий прогноз погоди в реальному часі та персоналізовані пропозиції щодо одягу на основі вашого календаря." },
    { id: 3, icon: 'Zap', question: "Помітили новий прищик на шкірі?", answer: "Аналіз шкіри на основі ШІ виявляє потенційні проблеми та рекомендує цільові процедури догляду." },
    { id: 4, icon: 'Home', question: "Потрібно налаштувати атмосферу в кімнаті?", answer: "Використовуйте голосові команди, щоб приглушити світло, увімкнути улюблений плейлист і підготуватися до вечора." },
  ],
  sk: [
    { id: 1, icon: 'Coffee', question: "Cítite sa v strese po dlhom dni?", answer: "Spekulus navrhuje riadené dychové cvičenie, ktoré vám pomôže uvoľniť sa a znížiť hladinu kortizolu." },
    { id: 2, icon: 'Thermometer', question: "Nie ste si istí, čo si dnes obliecť?", answer: "Získajte okamžitú predpoveď počasia v reálnom čase a personalizované návrhy oblečenia na základe vášho kalendára." },
    { id: 3, icon: 'Zap', question: "Všimli ste si novú nedokonalosť na pleti?", answer: "Analýza pleti poháňaná AI identifikuje potenciálne problémy a odporučí cielené rutiny starostlivosti." },
    { id: 4, icon: 'Home', question: "Potrebujete upraviť atmosféru v miestnosti?", answer: "Použite hlasové príkazy na stlmenie svetiel, prehranie obľúbeného playlistu a prípravu na večer." },
  ],
};

const rawComparisonSectionData: Record<Language, Omit<ComparisonSectionData, 'id'>> = {
    en: {
        title: "How We Compare",
        subtitle: "A side-by-side look at how Spekulus stacks up against the competition.",
    },
    uk: {
        title: "Як ми порівнюємося",
        subtitle: "Порівняльний погляд на те, як Spekulus виглядає на тлі конкурентів.",
    },
    sk: {
        title: "Ako sa porovnávame",
        subtitle: "Pohľad vedľa seba na to, ako Spekulus obstojí v porovnaní s konkurenciou.",
    },
};

const rawCompetitorFeaturesData: Record<Language, CompetitorFeature[]> = {
    en: [
        { id: 1, feature: "AI Skin Analysis", spekulus: true, himirror: true, simplehuman: false, mirrocool: false },
        { id: 2, feature: "Stress Detection", spekulus: true, himirror: false, simplehuman: false, mirrocool: false },
        { id: 3, feature: "Voice Control", spekulus: true, himirror: true, simplehuman: true, mirrocool: true },
        { id: 4, feature: "Smart Home Hub", spekulus: true, himirror: false, simplehuman: false, mirrocool: true },
        { id: 5, feature: "Personalized Lighting", spekulus: true, himirror: true, simplehuman: true, mirrocool: false },
        { id: 6, feature: "Gesture Control", spekulus: true, himirror: false, simplehuman: false, mirrocool: true },
        { id: 7, feature: "Third-Party App Store", spekulus: true, himirror: true, simplehuman: false, mirrocool: false },
    ],
    uk: [
        { id: 1, feature: "Аналіз шкіри за допомогою ШІ", spekulus: true, himirror: true, simplehuman: false, mirrocool: false },
        { id: 2, feature: "Виявлення стресу", spekulus: true, himirror: false, simplehuman: false, mirrocool: false },
        { id: 3, feature: "Голосове керування", spekulus: true, himirror: true, simplehuman: true, mirrocool: true },
        { id: 4, feature: "Центр розумного будинку", spekulus: true, himirror: false, simplehuman: false, mirrocool: true },
        { id: 5, feature: "Персоналізоване освітлення", spekulus: true, himirror: true, simplehuman: true, mirrocool: false },
        { id: 6, feature: "Керування жестами", spekulus: true, himirror: false, simplehuman: false, mirrocool: true },
        { id: 7, feature: "Магазин сторонніх додатків", spekulus: true, himirror: true, simplehuman: false, mirrocool: false },
    ],
    sk: [
        { id: 1, feature: "Analýza pleti pomocou AI", spekulus: true, himirror: true, simplehuman: false, mirrocool: false },
        { id: 2, feature: "Detekcia stresu", spekulus: true, himirror: false, simplehuman: false, mirrocool: false },
        { id: 3, feature: "Hlasové ovládanie", spekulus: true, himirror: true, simplehuman: true, mirrocool: true },
        { id: 4, feature: "Centrum inteligentnej domácnosti", spekulus: true, himirror: false, simplehuman: false, mirrocool: true },
        { id: 5, feature: "Personalizované osvetlenie", spekulus: true, himirror: true, simplehuman: true, mirrocool: false },
        { id: 6, feature: "Ovládanie gestami", spekulus: true, himirror: false, simplehuman: false, mirrocool: true },
        { id: 7, feature: "Obchod s aplikáciami tretích strán", spekulus: true, himirror: true, simplehuman: false, mirrocool: false },
    ],
};

const rawPartnerSectionData: Record<Language, Omit<PartnerSectionData, 'id'>> = {
    en: {
        title: "Partner with Us",
        text: "We are actively seeking strategic partners, investors, and collaborators who share our vision for the future of smart living. If you're interested in helping us scale, innovate, and bring Spekulus to a global market, we'd love to hear from you.",
        ctaLabel: "Contact Our Founders",
        ctaUrl: "mailto:spekulus.mirror@gmail.com",
        imageId: null,
    },
    uk: {
        title: "Станьте нашим партнером",
        text: "Ми активно шукаємо стратегічних партнерів, інвесторів та співробітників, які поділяють наше бачення майбутнього розумного життя. Якщо ви зацікавлені в допомозі нам масштабуватися, впроваджувати інновації та виводити Spekulus на світовий ринок, ми будемо раді вас почути.",
        ctaLabel: "Зв'язатися із засновниками",
        ctaUrl: "mailto:spekulus.mirror@gmail.com",
        imageId: null,
    },
    sk: {
        title: "Staňte sa naším partnerom",
        text: "Aktívne hľadáme strategických partnerov, investorov a spolupracovníkov, ktorí zdieľajú našu víziu budúcnosti inteligentného bývania. Ak máte záujem pomôcť nám rásť, inovovať a priniesť Spekulus na globálny trh, radi by sme sa s vami spojili.",
        ctaLabel: "Kontaktujte našich zakladateľov",
        ctaUrl: "mailto:spekulus.mirror@gmail.com",
        imageId: null,
    },
};

const mergeData = <T extends { [key: string]: any }, U extends Partial<T>>(baseData: T[], langData: U[], idKey: keyof T & keyof U): T[] => {
  const langMap = new Map(langData.map(item => [item[idKey], item]));
  return baseData.map(baseItem => ({
    ...baseItem,
    ...(langMap.get(baseItem[idKey]) || {}),
  }));
};

const devNotes: Record<Language, DevNote[]> = {
  en: rawDevNotes.en as DevNote[],
  uk: mergeData(rawDevNotes.en as DevNote[], rawDevNotes.uk, 'slug'),
  sk: mergeData(rawDevNotes.en as DevNote[], rawDevNotes.sk, 'slug'),
};

const roadmapEvents: Record<Language, PartialBy<RoadmapEvent, 'id'>[]> = {
    en: rawRoadmapEvents.en,
    uk: mergeData(rawRoadmapEvents.en, rawRoadmapEvents.uk, 'title'),
    sk: mergeData(rawRoadmapEvents.en, rawRoadmapEvents.sk, 'title'),
}

const faqData: Record<Language, PartialBy<FaqItem, 'id'>[]> = {
    en: rawFaqData.en,
    uk: rawFaqData.uk,
    sk: rawFaqData.sk
};

const mergeCreators = (base: Creator, lang: Partial<Creator>): Creator => {
  const merged = { ...base, ...lang } as Creator;
  if (lang.featuredProject || base.featuredProject) {
    merged.featuredProject = {
      ...(base.featuredProject || { title: '', url: '', description: ''}),
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
  uk: (rawCreatorsData.en as Creator[]).map((baseCreator) => {
    const langCreator = rawCreatorsData.uk.find(c => c.slug === baseCreator.slug);
    return mergeCreators(baseCreator, langCreator || {});
  }),
  sk: (rawCreatorsData.en as Creator[]).map((baseCreator) => {
    const langCreator = rawCreatorsData.sk.find(c => c.slug === baseCreator.slug);
    return mergeCreators(baseCreator, langCreator || {});
  }),
}

const advantagesData: Record<Language, Advantage[]> = {
  en: rawAdvantagesData.en,
  uk: mergeData(rawAdvantagesData.en, rawAdvantagesData.uk, 'title') as Advantage[],
  sk: mergeData(rawAdvantagesData.en, rawAdvantagesData.sk, 'title') as Advantage[],
};

const actionSectionData: Record<Language, Omit<ActionSectionData, 'id'>> = {
    en: rawActionSectionData.en,
    uk: { ...rawActionSectionData.en, ...rawActionSectionData.uk },
    sk: { ...rawActionSectionData.en, ...rawActionSectionData.sk },
}

const heroSectionData: Record<Language, Omit<HeroSectionData, 'id' | 'features'>> = {
    en: rawHeroSectionData.en,
    uk: { ...rawHeroSectionData.en, ...rawHeroSectionData.uk },
    sk: { ...rawHeroSectionData.en, ...rawHeroSectionData.sk },
};

const heroFeaturesData: Record<Language, Omit<HeroFeature, 'id'>[]> = {
    en: rawHeroFeaturesData.en,
    uk: rawHeroFeaturesData.uk,
    sk: rawHeroFeaturesData.sk,
};

const mergeProductData = (lang: Language): ProductSectionData => {
    const baseData = rawProductSectionData.en as ProductSectionData;
    const langData = rawProductSectionData[lang];
    return {
        title: langData.title || baseData.title,
        subtitle: langData.subtitle || baseData.subtitle,
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
    heroFeaturesData,
    productSectionData,
    scenariosData: rawScenariosData,
    comparisonSectionData: rawComparisonSectionData,
    competitorFeaturesData: rawCompetitorFeaturesData,
    partnerSectionData: rawPartnerSectionData,
};
