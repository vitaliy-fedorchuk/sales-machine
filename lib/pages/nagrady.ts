// Контент сторінки /nagrady (перенесено з sales-machine.team/nagrady). Пізніше — з CMS.

export type Award = {
  logo?: { src: string; w: number; h: number; alt: string };
  city?: string;
  year: string;
  items: string[];
  note?: { title: string; text: string };
  href: string;
};

export const NAGRADY_PAGE = {
  word: "Награды",
  title: "Настоящая награда в жизни — это иметь интеллект, способный побеждать",
  intro: [
    "Получение наград — это заслуженное признание своего труда и достижений на мировой и внутренней арене. Это маркер, который говорит о том, что мы для клиентов делаем крутой продукт, который не только замечают, но и который побеждает в престижных соревнованиях.",
    "Все награды, которые здесь представлены, — это работа команды Sales Machine, помноженная на отвагу наших заказчиков, которые доверились нам, нашим компетенциям, нашей системе «Иммерсивного маркетинга» и нашей ответственности.",
  ],
  quote: {
    role: "Основатель Sales Machine",
    name: "Василий Боев",
    photo: "/img/vasiliy-boev.png",
    text: "«В конечном счете, каждая новая победа мотивирует нас быть лучшей версией себя, двигаясь к следующей вершине, чтобы её покорить».",
  },
  awardsTitle: "Награды",
  videoTitle: "Награды в сфере «Видео»",
  cta: "Клик, который поможет бизнесу",
  contact: {
    title: "Привет, это Вадим.",
    text: "Участие и победы в конкурсах — это часть маркетинговой стратегии любого бизнеса. Так давайте покажем всем, у кого БОЛЬШЕ… наград!",
  },
};

const L = (src: string, w: number, h: number, alt: string) => ({ src: `/img/awards/${src}`, w, h, alt });

export const AWARDS: readonly Award[] = [
  {
    logo: L("wow-awards.png", 235, 150, "WOW Awards"),
    city: "Москва",
    year: "2026",
    items: ["Лучшие в номинации «Наружная реклама: Статика» за кейс «Битва баннеров. Серия». Заказчик — «Унистрой»"],
    href: "https://wowfest.ru/news/obyavlyaem-pobediteley-yubileynoy-premii-wow-awards-2026/",
  },
  {
    logo: L("developer-goda.png", 800, 186, "Девелопер года"),
    city: "Тюмень",
    year: "2024",
    items: ["Лучший ребрендинг года"],
    href: "https://t.rbc.ru/tyumen/05/03/2025/67c6f77d9a79470349011216",
  },
  {
    logo: L("epa-2020-2021.png", 258, 150, "European Property Awards, Winner 2020–2021"),
    city: "Лондон",
    year: "2021",
    items: [
      "Лучшая архитектура малоэтажного дома",
      "Лучший генплан жилого комплекса",
      "Лучшая маркетинговая кампания жилого комплекса",
    ],
    href: "https://www.youtube.com/watch?v=EO8R01YGhdg",
  },
  {
    logo: L("epa-2019-2020.png", 258, 148, "European Property Awards, Winner 2019–2020"),
    city: "Лондон",
    year: "2020",
    items: ["Лучшая маркетинговая кампания жилого комплекса в Восточной Европе"],
    href: "https://www.youtube.com/watch?v=_U241ddNNYc&t=27s",
  },
  {
    logo: L("epa-2017-2018.png", 253, 144, "European Property Awards, Winner 2017–2018"),
    city: "Лондон",
    year: "2018",
    items: ["Лучшая маркетинговая кампания многоквартирного дома в России"],
    href: "https://www.youtube.com/watch?v=lbb_gPRkic0&t=4s",
  },
  {
    logo: L("removie-awards.png", 216, 150, "ReMovie Awards"),
    city: "Москва",
    year: "2021",
    items: ["Лучший режиссер фильма про недвижимость"],
    href: "https://www.youtube.com/watch?v=OiidA_7dOUE",
  },
  {
    logo: L("wow-awards.png", 235, 150, "WOW Awards"),
    city: "Москва",
    year: "2020",
    items: ["Победитель в номинации «Нестандартное продвижение: digital» за кейс «Как продать квартиру через PornHub»"],
    href: "https://vimeo.com/761619089",
  },
  {
    logo: L("urban-awards.png", 146, 150, "Urban Awards"),
    city: "Москва",
    year: "2018",
    items: ["Награда в категории «Инновации в недвижимости» за кейс «Первый робот-консьерж России в „ТеслаДом“»"],
    href: "https://www.youtube.com/watch?v=S3tgWCcsz6I&t=12s",
  },
];

/** Що це за премії — коротка довідка під сіткою. */
export const AWARD_GLOSSARY = [
  { term: "Девелопер года", text: "Отраслевая премия под эгидой РБК. Проводится в столице российского девелопмента — Тюмени, как городе с самой высокой конкурентной средой в девелопменте." },
  { term: "European Property Awards", text: "Это настоящий «Оскар» в сфере недвижимости, который получают за самые высокие достижения компании и специалисты, работающие в различных секторах жилой и коммерческой недвижимости." },
  { term: "ReMovie Awards", text: "Это модная и современная площадка, созданная для презентации лучших видеороликов строительной отрасли и рынка недвижимости." },
  { term: "WOW Awards", text: "Премия в области маркетинга и рекламы, определяющая топовые коммуникационные проекты и наиболее эффектный креатив на рынке недвижимости." },
  { term: "Urban Awards", text: "Это стандарт качества на рынке жилой недвижимости, объективная премия, которая определяет лучшие проекты, помогая в их реализации, а также способствуя укреплению имиджа компании в профессиональной среде." },
] as const;

export const VIDEO_AWARDS: readonly Award[] = [
  {
    year: "2021",
    items: ["Отраслевая награда за видео в сфере недвижимости ReMovie Awards в номинации «Творец года»"],
    href: "https://www.youtube.com/watch?v=mUvI1Imn0iM",
  },
  {
    year: "2020",
    items: ["Полнометражный фильм в стиле мокьюментари «Russians. Big Game» — участник международных фестивалей"],
    note: {
      title: "Участник и финалист фестивалей",
      text: "Aphrodite Film Awards (Нью-Йорк), MLC Awards (США), Anatolia International Film Festival (Турция), Roma Prisma Festival (Рим), Top Indie Film Awards (Токио), полуфиналист «Near Nazareth Festival» (Назарет)",
    },
    href: "https://www.youtube.com/watch?v=BPB62ABfzqo",
  },
  {
    year: "2020",
    items: ["Короткометражный фильм «Две или три вещи, которые я знаю о Ростове» — лучший документальный фильм об архитектуре «Venice Architecture Short Film Awards» (Венеция), участник кинофестиваля BeatFilmFest (Москва)"],
    href: "https://vimeo.com/480520207",
  },
  {
    year: "2019",
    items: ["Ответ банку «Точка»"],
    href: "https://youtu.be/wppgMYiZr6s",
  },
  {
    year: "2018",
    items: ["«V means 8» — корпоративный фильм на 8-летие компании. Озвучка — Андрей Гаврилов, «золотой голос» боевиков из 90-х"],
    href: "https://vimeo.com/331014729",
  },
];
