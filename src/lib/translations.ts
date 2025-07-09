export type Translation = {
  nav: { home: string; product: string; advantages: string; devNotes: string; roadmap: string; faq: string; creators: string; contact: string; };
  hero: {
    title: string;
    subtitle: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    cta: string;
  };
  advantages: {
    title: string;
    subtitle: string;
  };
  actionSection: {
    title: string;
    subtitle: string;
  };
  devNotes: {
    title: string;
    subtitle: string;
    readMore: string;
    allNotes: string;
    postedOn: string;
    searchPlaceholder: string;
    sortBy: string;
    sortNewest: string;
    sortOldest: string;
    noResults: string;
    noResultsSubtitle: string;
    noNotesFound: string;
    noNotesFoundSubtitle: string;
  };
  roadmap: {
    title: string;
    subtitle: string;
  };
  faq: {
    title: string;
    subtitle: string;
  };
  creators: {
    title: string;
    subtitle: string;
    allCreators: string;
    viewAll: string;
  };
  contact: {
    title: string;
    subtitle: string;
    emailTitle: string;
    emailDesc: string;
    formTitle: string;
    formDesc: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitButton: string;
    submitButtonSending: string;
  };
};

export const translations: Record<'en' | 'uk' | 'sk', Translation> = {
  en: {
    nav: { home: 'Home', product: 'Product', advantages: 'Advantages', devNotes: 'Dev Notes', roadmap: 'Roadmap', faq: 'FAQ', creators: 'Our Team', contact: 'Contact' },
    hero: {
      title: 'Spekulus: Reflect Smarter, Live Better.',
      subtitle: 'The world\'s most advanced smart mirror, designed to be the center of your wellness and daily routine.',
      feature1: 'Skin & Health Analysis',
      feature2: 'Stress Detection',
      feature3: 'Weather Awareness',
      feature4: 'Smart-Home Hub',
      cta: 'Discover Spekulus',
    },
    advantages: {
      title: 'Our Key Advantages',
      subtitle: 'Here’s what makes Spekulus more than just a mirror.',
    },
    actionSection: {
      title: 'See Spekulus in Action',
      subtitle: 'A glimpse of how our smart mirror fits into your everyday life.',
    },
    devNotes: {
      title: 'From the Developers',
      subtitle: 'Latest updates, thoughts, and technical deep-dives from the Spekulus team.',
      readMore: 'Read More',
      allNotes: 'View All Notes',
      postedOn: 'Posted on',
      searchPlaceholder: 'Search notes...',
      sortBy: 'Sort by',
      sortNewest: 'Newest first',
      sortOldest: 'Oldest first',
      noResults: 'No notes match your search.',
      noResultsSubtitle: 'Try a different keyword or clear the search.',
      noNotesFound: 'No developer notes have been published yet.',
      noNotesFoundSubtitle: 'Check back soon for the latest updates from the team!',
    },
    roadmap: {
      title: 'Our Journey & Future',
      subtitle: 'Charting the course for the future of smart living.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to common inquiries about Spekulus.',
    },
    creators: {
        title: 'Meet the Team',
        subtitle: 'The team behind the vision — S & S Creation',
        allCreators: 'All Team Members',
        viewAll: 'Meet the Full Team'
    },
    contact: {
        title: 'Get in Touch',
        subtitle: 'We’d love to hear from you. Whether you have a question, feedback, or a partnership proposal, feel free to reach out.',
        emailTitle: 'Contact Us By Email',
        emailDesc: 'For general inquiries, support, or feedback, please send us an email. We typically respond within 24-48 hours.',
        formTitle: 'Send a Direct Message',
        formDesc: 'Alternatively, you can use the form below to send us a message right away.',
        nameLabel: 'Your Name',
        namePlaceholder: 'e.g., John Doe',
        emailLabel: 'Your Email',
        emailPlaceholder: 'e.g., john.doe@example.com',
        messageLabel: 'Your Message',
        messagePlaceholder: 'Tell us what\'s on your mind...',
        submitButton: 'Send Message',
        submitButtonSending: 'Sending...',
    }
  },
  uk: {
    nav: { home: 'Головна', product: 'Продукт', advantages: 'Переваги', devNotes: 'Нотатки розробників', roadmap: 'Дорожня карта', faq: 'ЧЗП', creators: 'Наша команда', contact: 'Контакти' },
    hero: {
        title: 'Spekulus: Роздумуйте розумніше, живіть краще.',
        subtitle: 'Найсучасніше у світі розумне дзеркало, розроблене, щоб стати центром вашого здоров\'я та щоденної рутини.',
        feature1: 'Аналіз шкіри та здоров\'я',
        feature2: 'Виявлення стресу',
        feature3: 'Поінформованість про погоду',
        feature4: 'Центр розумного будинку',
        cta: 'Відкрийте для себе Spekulus',
    },
    advantages: {
      title: 'Наші ключові переваги',
      subtitle: 'Ось що робить Spekulus більше, ніж просто дзеркалом.',
    },
    actionSection: {
      title: 'Spekulus в дії',
      subtitle: 'Погляд на те, як наше розумне дзеркало вписується у ваше повсякденне життя.',
    },
    devNotes: {
        title: 'Від розробників',
        subtitle: 'Останні оновлення, думки та технічні огляди від команди Spekulus.',
        readMore: 'Читати далі',
        allNotes: 'Переглянути всі нотатки',
        postedOn: 'Опубліковано',
        searchPlaceholder: 'Шукати нотатки...',
        sortBy: 'Сортувати за',
        sortNewest: 'Спочатку новіші',
        sortOldest: 'Спочатку старіші',
        noResults: 'За вашим запитом нотаток не знайдено.',
        noResultsSubtitle: 'Спробуйте інше ключове слово або очистіть пошук.',
        noNotesFound: 'Нотатки розробників ще не опубліковані.',
        noNotesFoundSubtitle: 'Завітайте незабаром, щоб дізнатися про останні оновлення від команди!',
    },
    roadmap: {
        title: 'Наша подорож і майбутнє',
        subtitle: 'Прокладаючи курс у майбутнє розумного життя.',
    },
    faq: {
        title: 'Часті запитання',
        subtitle: 'Відповіді на поширені запитання про Spekulus.',
    },
    creators: {
        title: 'Знайомтеся з командою',
        subtitle: 'Команда, що стоїть за візією — S & S Creation',
        allCreators: 'Всі члени команди',
        viewAll: 'Познайомитись з усією командою'
    },
    contact: {
      title: 'Зв\'яжіться з нами',
      subtitle: 'Ми будемо раді почути вас. Якщо у вас є питання, відгук або пропозиція про партнерство, не соромтеся звертатися.',
      emailTitle: 'Зв\'яжіться з нами поштою',
      emailDesc: 'Для загальних запитів, підтримки або відгуків, будь ласка, надішліть нам електронний лист. Зазвичай ми відповідаємо протягом 24-48 годин.',
      formTitle: 'Надіслати пряме повідомлення',
      formDesc: 'Крім того, ви можете скористатися формою нижче, щоб негайно надіслати нам повідомлення.',
      nameLabel: 'Ваше ім\'я',
      namePlaceholder: 'напр., Іван Іванов',
      emailLabel: 'Ваша електронна пошта',
      emailPlaceholder: 'напр., ivan.ivanov@example.com',
      messageLabel: 'Ваше повідомлення',
      messagePlaceholder: 'Розкажіть нам, що у вас на думці...',
      submitButton: 'Надіслати повідомлення',
      submitButtonSending: 'Надсилання...',
    }
  },
  sk: {
    nav: { home: 'Domov', product: 'Produkt', advantages: 'Výhody', devNotes: 'Poznámky vývojárov', roadmap: 'Cestovná mapa', faq: 'FAQ', creators: 'Náš tím', contact: 'Kontakt' },
    hero: {
        title: 'Spekulus: Odrážajte inteligentnejšie, žite lepšie.',
        subtitle: 'Najpokročilejšie inteligentné zrkadlo na svete, navrhnuté ako centrum vášho wellness a dennej rutiny.',
        feature1: 'Analýza pleti a zdravia',
        feature2: 'Detekcia stresu',
        feature3: 'Povedomie o počasí',
        feature4: 'Centrum inteligentnej domácnosti',
        cta: 'Objavte Spekulus',
    },
    advantages: {
      title: 'Naše kľúčové výhody',
      subtitle: 'Toto je to, čo robí Spekulus viac než len zrkadlom.',
    },
    actionSection: {
      title: 'Pozrite sa na Spekulus v akcii',
      subtitle: 'Náhľad na to, ako sa naše inteligentné zrkadlo hodí do vášho každodenného života.',
    },
    devNotes: {
        title: 'Od vývojárov',
        subtitle: 'Najnovšie aktualizácie, myšlienky a technické pohľady od tímu Spekulus.',
        readMore: 'Čítať viac',
        allNotes: 'Zobraziť všetky poznámky',
        postedOn: 'Uverejnené dňa',
        searchPlaceholder: 'Hľadať poznámky...',
        sortBy: 'Zoradiť podľa',
        sortNewest: 'Najnovšie prvé',
        sortOldest: 'Najstaršie prvé',
        noResults: 'Žiadne poznámky nezodpovedajú vášmu vyhľadávaniu.',
        noResultsSubtitle: 'Skúste iné kľúčové slovo alebo vymažte vyhľadávanie.',
        noNotesFound: 'Zatiaľ neboli zverejnené žiadne poznámky od vývojárov.',
        noNotesFoundSubtitle: 'Skontrolujte čoskoro pre najnovšie aktualizácie od tímu!',
    },
    roadmap: {
        title: 'Naša cesta a budúcnosť',
        subtitle: 'Vytýčenie kurzu pre budúcnosť inteligentného bývania.',
    },
    faq: {
        title: 'Často kladené otázky',
        subtitle: 'Odpovede na bežné otázky o Spekulus.',
    },
    creators: {
        title: 'Zoznámte sa s tímom',
        subtitle: 'Tím, ktorý stojí za víziou — S & S Creation',
        allCreators: 'Všetci členovia tímu',
        viewAll: 'Zoznámte sa s celým tímom'
    },
    contact: {
      title: 'Kontaktujte nás',
      subtitle: 'Budeme radi, ak sa nám ozvete. Či už máte otázku, spätnú väzbu alebo návrh na partnerstvo, neváhajte nás kontaktovať.',
      emailTitle: 'Kontaktujte nás e-mailom',
      emailDesc: 'Pre všeobecné otázky, podporu alebo spätnú väzbu nám, prosím, pošlite e-mail. Zvyčajne odpovedáme do 24-48 hodín.',
      formTitle: 'Poslať priamu správu',
      formDesc: 'Prípadne môžete použiť formulár nižšie a poslať nám správu okamžite.',
      nameLabel: 'Vaše meno',
      namePlaceholder: 'napr., Ján Vážny',
      emailLabel: 'Váš e-mail',
      emailPlaceholder: 'napr., jan.vazny@example.com',
      messageLabel: 'Vaša správa',
      messagePlaceholder: 'Povedzte nám, čo máte na mysli...',
      submitButton: 'Odoslať správu',
      submitButtonSending: 'Odosielam...',
    }
  },
};
