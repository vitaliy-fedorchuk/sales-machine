export type Direction = {
  /** `\n` — перенос: кожен рядок стає окремим рядком стрічки зі своїм кутом. */
  label: string;
  sub: string;
  href: string;
};

// Пізніше ці дані підуть з CMS — компонент Spiral приймає масив пропсом.
export const DIRECTIONS: readonly Direction[] = [
  { label: "PR",                     sub: "Влияем на мнения и формируем поведение",               href: "/pr" },
  { label: "Книга",                  sub: "Иммерсивный маркетинг: система хищных продаж",        href: "/kniga" },
  { label: "Кейсы",                  sub: "Кейсы, которые принесли результат",                   href: "/keysy" },
  { label: "Школа",                  sub: "Курс «Иммерсивный маркетинг» для практиков",          href: "/kurs" },
  { label: "Отзывы",                 sub: "Голоса клиентов громче любой рекламы",                href: "/otzyvy" },
  { label: "Креатив",                sub: "Креативность ждёт, пока выдохнется заурядность",      href: "/kreativ" },
  { label: "Награды",                sub: "Интеллект, способный побеждать",                      href: "/nagrady" },
  { label: "Маркетинг",              sub: "Деньги в маркетинг должны приносить ещё больше денег", href: "/marketing" },
  { label: "Иммерсивный\nмаркетинг", sub: "Люди покупают эмоцию владения",                       href: "/immersivnyy-marketing" },
  { label: "Статьи в СМИ",           sub: "О нас пишут с 2016 года",                             href: "/stati-v-smi" },
  { label: "Услуги бизнесу",         sub: "Не лучше других. Лучшие для вас",                     href: "/uslugi-biznesu" },
  { label: "О нас. Контакты",        sub: "Ядро Sales Machine",                                  href: "/o-nas-kontakty" },
  { label: "404",                    sub: "Страницы нет. Зато есть мухи — сбейте их все",        href: "/404" },
];
