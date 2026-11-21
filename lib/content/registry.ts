// Розділи сайту, які редагуються в адмінці (/admin/content). Кожен — опис полів + поточний вміст із коду.
// Додати новий розділ: defineContent(...) тут → сторінка сайту читає getContent("<key>").

import { CONTACTS } from "@/lib/contacts";
import { DIRECTIONS } from "@/lib/directions";
import { AWARD_GLOSSARY, AWARDS, NAGRADY_PAGE, VIDEO_AWARDS } from "@/lib/pages/nagrady";
import { IMMERSIVE_PAGE } from "@/lib/pages/immersivnyy-marketing";
import { KREATIV_PAGE } from "@/lib/pages/kreativ";
import { MARKETING_PAGE } from "@/lib/pages/marketing";
import { ONAS_PAGE, TEAM } from "@/lib/pages/o-nas";
import { PR_PAGE } from "@/lib/pages/pr";
import { ARTICLES, SMI_PAGE } from "@/lib/pages/smi";
import { USLUGI_PAGE } from "@/lib/pages/uslugi";
import { defineContent, img, type Field } from "./fields";

// ---------- спільні шматки ----------

/** Попап «Привет, это Вадим» на сторінці (тексти; телефони/фото — у «Контактах») */
const contactPopup: Field = {
  kind: "group",
  key: "contact",
  label: "Всплывающее окно «Привет, это Вадим»",
  fields: [
    { kind: "text", key: "title", label: "Заголовок", required: true, max: 120 },
    { kind: "textarea", key: "text", label: "Текст", required: true, rows: 3, max: 600 },
  ],
};

const pageHead = (opts: { intro?: boolean } = {}): Field[] => [
  { kind: "textarea", key: "word", label: "Большое слово на фоне", hint: "Серым под стрелкой «назад». Длинное — можно разбить на две строки (Enter).", required: true, rows: 2, max: 60 },
  { kind: "textarea", key: "title", label: "Заголовок страницы (H1)", required: true, rows: 2, max: 300 },
  ...(opts.intro ? [{ kind: "strings", key: "intro", label: "Вступление", item: "абзац", rows: 3 } as Field] : []),
];

const cta: Field = { kind: "text", key: "cta", label: "Надпись на большой кнопке", required: true, max: 80 };

// ---------- Контакты и соцсети ----------

const NETWORKS = [
  { value: "instagram", label: "Instagram" },
  { value: "telegram", label: "Telegram" },
  { value: "youtube", label: "YouTube" },
  { value: "vk", label: "ВКонтакте" },
  { value: "tiktok", label: "TikTok" },
] as const;

export const contactsContent = defineContent({
  key: "contacts",
  title: "Контакты и соцсети",
  group: "Настройки",
  hint: "Кто отвечает во всплывающем окне на всех страницах и иконки соцсетей внизу сайта.",
  paths: ["layout"],
  fields: [
    {
      kind: "group",
      key: "manager",
      label: "Менеджер во всплывающем окне",
      fields: [
        { kind: "text", key: "name", label: "Имя", required: true, max: 60 },
        { kind: "image", key: "photo", label: "Фото", required: true },
        { kind: "url", key: "telegram", label: "Telegram", required: true, placeholder: "https://t.me/…" },
        { kind: "url", key: "whatsapp", label: "WhatsApp", required: true, placeholder: "https://wa.me/7…" },
      ],
    },
    {
      kind: "list",
      key: "social",
      label: "Соцсети внизу страниц",
      item: "соцсеть",
      title: "network",
      subtitle: "href",
      max: 10,
      addTo: "end",
      fields: [
        { kind: "select", key: "network", label: "Сеть", options: NETWORKS },
        { kind: "url", key: "href", label: "Ссылка", required: true },
      ],
    },
  ],
  defaults: {
    manager: {
      name: CONTACTS.manager.name,
      photo: img(CONTACTS.manager.photo, 340, 340, "Вадим"),
      telegram: CONTACTS.manager.telegram,
      whatsapp: CONTACTS.manager.whatsapp,
    },
    social: CONTACTS.social.map((s) => ({ network: s.icon.replace(/^\/icons\/|\.svg$/g, ""), href: s.href })),
  },
});

export const NETWORK_LABEL = Object.fromEntries(NETWORKS.map((n) => [n.value, n.label])) as Record<string, string>;

// ---------- Статьи в СМИ ----------

export const smiContent = defineContent({
  key: "smi",
  title: "Статьи в СМИ",
  group: "Списки",
  hint: "Публикации о Sales Machine на /stati-v-smi — сгруппированы по годам (новый год появится сам).",
  paths: ["/stati-v-smi"],
  fields: [
    ...pageHead(),
    {
      kind: "list",
      key: "articles",
      label: "Публикации",
      item: "публикацию",
      title: "title",
      subtitle: "year",
      addTo: "start",
      fields: [
        { kind: "text", key: "year", label: "Год", required: true, max: 4, placeholder: "2026" },
        { kind: "text", key: "title", label: "Заголовок", required: true, max: 300 },
        { kind: "url", key: "href", label: "Ссылка на публикацию", required: true },
      ],
    },
    cta,
    contactPopup,
  ],
  defaults: {
    word: SMI_PAGE.word,
    title: SMI_PAGE.title,
    articles: ARTICLES.map((a) => ({ ...a })),
    cta: SMI_PAGE.cta,
    contact: { ...SMI_PAGE.contact },
  },
});

// ---------- О нас. Команда ----------

export const teamContent = defineContent({
  key: "team",
  title: "О нас. Команда",
  group: "Страницы",
  hint: "Страница /o-nas-kontakty: вступление и карточки команды.",
  paths: ["/o-nas-kontakty"],
  fields: [
    ...pageHead({ intro: true }),
    { kind: "text", key: "teamTitle", label: "Заголовок раздела команды", required: true, max: 120 },
    {
      kind: "list",
      key: "team",
      label: "Команда",
      item: "человека",
      title: "name",
      subtitle: "role",
      addTo: "end",
      fields: [
        { kind: "text", key: "name", label: "Имя", required: true, max: 80 },
        { kind: "text", key: "role", label: "Роль", required: true, max: 120 },
        { kind: "image", key: "photo", label: "Фото", required: true },
        { kind: "strings", key: "lines", label: "Описание", item: "тезис", rows: 2, min: 1 },
        { kind: "url", key: "instagram", label: "Instagram (необязательно)" },
      ],
    },
    cta,
    { kind: "text", key: "ctaBottom", label: "Надпись на нижней кнопке", required: true, max: 80 },
    contactPopup,
  ],
  defaults: {
    word: ONAS_PAGE.word,
    title: ONAS_PAGE.title,
    intro: [...ONAS_PAGE.intro],
    teamTitle: ONAS_PAGE.teamTitle,
    team: TEAM.map((m) => ({
      name: m.name,
      role: m.role,
      photo: img(m.photo.src, m.photo.w, m.photo.h, m.name),
      lines: [...m.lines],
      instagram: m.instagram ?? "",
    })),
    cta: ONAS_PAGE.cta,
    ctaBottom: ONAS_PAGE.ctaBottom,
    contact: { ...ONAS_PAGE.contact },
  },
});

// ---------- Сторінки напрямків: /pr, /kreativ, /marketing, /immersivnyy-marketing ----------
// Однакова будова: вступ → цитата засновника → (вставки) → текст → кейси → кнопка.

const quoteField: Field = {
  kind: "group",
  key: "quote",
  label: "Цитата",
  fields: [
    { kind: "image", key: "photo", label: "Фото автора (круглое)" },
    { kind: "text", key: "name", label: "Автор", required: true, max: 80 },
    { kind: "text", key: "role", label: "Подпись (необязательно)", max: 120 },
    { kind: "textarea", key: "text", label: "Цитата", required: true, rows: 3, max: 1000 },
  ],
};

const casesFields: Field[] = [
  { kind: "text", key: "casesTitle", label: "Заголовок раздела кейсов", required: true, max: 80 },
  {
    kind: "list",
    key: "cases",
    label: "Кейсы",
    item: "кейс",
    title: "title",
    subtitle: "href",
    addTo: "end",
    hint: "Ссылка на кейс на сайте (/stati/…) или на публикацию.",
    fields: [
      { kind: "text", key: "title", label: "Название", required: true, max: 300 },
      { kind: "url", key: "href", label: "Ссылка", required: true },
    ],
  },
];

type QuoteSrc = { role?: string; name: string; photo: string; text: string };
const quoteOf = (q: QuoteSrc, size: number) => ({ role: q.role ?? "", name: q.name, photo: img(q.photo, size, size, q.name), text: q.text });

const outroField: Field = { kind: "strings", key: "outro", label: "Текст после цитаты", item: "абзац", rows: 3 };

export const prContent = defineContent({
  key: "pr",
  title: "PR",
  group: "Страницы",
  hint: "Страница /pr.",
  paths: ["/pr"],
  fields: [...pageHead({ intro: true }), quoteField, outroField, ...casesFields, cta, contactPopup],
  defaults: {
    word: PR_PAGE.word,
    title: PR_PAGE.title,
    intro: [...PR_PAGE.intro],
    quote: quoteOf(PR_PAGE.quote, 92),
    outro: [...PR_PAGE.outro],
    casesTitle: PR_PAGE.casesTitle,
    cases: PR_PAGE.cases.map((c) => ({ ...c })),
    cta: PR_PAGE.cta,
    contact: { ...PR_PAGE.contact },
  },
});

export const kreativContent = defineContent({
  key: "kreativ",
  title: "Креатив",
  group: "Страницы",
  hint: "Страница /kreativ.",
  paths: ["/kreativ"],
  fields: [
    ...pageHead({ intro: true }),
    { kind: "textarea", key: "callout", label: "Выделенный тезис (серая плашка)", required: true, rows: 2, max: 300 },
    outroField,
    quoteField,
    ...casesFields,
    cta,
    contactPopup,
  ],
  defaults: {
    word: KREATIV_PAGE.word,
    title: KREATIV_PAGE.title,
    intro: [...KREATIV_PAGE.intro],
    callout: KREATIV_PAGE.callout,
    outro: [...KREATIV_PAGE.outro],
    quote: quoteOf(KREATIV_PAGE.quote, 265),
    casesTitle: KREATIV_PAGE.casesTitle,
    cases: KREATIV_PAGE.cases.map((c) => ({ ...c })),
    cta: KREATIV_PAGE.cta,
    contact: { ...KREATIV_PAGE.contact },
  },
});

export const marketingContent = defineContent({
  key: "marketing",
  title: "Маркетинг",
  group: "Страницы",
  hint: "Страница /marketing.",
  paths: ["/marketing"],
  fields: [...pageHead({ intro: true }), quoteField, outroField, ...casesFields, cta, contactPopup],
  defaults: {
    word: MARKETING_PAGE.word,
    title: MARKETING_PAGE.title,
    intro: [...MARKETING_PAGE.intro],
    quote: quoteOf(MARKETING_PAGE.quote as QuoteSrc, 92),
    outro: [...MARKETING_PAGE.outro],
    casesTitle: MARKETING_PAGE.casesTitle,
    cases: MARKETING_PAGE.cases.map((c) => ({ ...c })),
    cta: MARKETING_PAGE.cta,
    contact: { ...MARKETING_PAGE.contact },
  },
});

export const immersiveContent = defineContent({
  key: "immersive",
  title: "Иммерсивный маркетинг",
  group: "Страницы",
  hint: "Страница /immersivnyy-marketing.",
  paths: ["/immersivnyy-marketing"],
  fields: [
    ...pageHead({ intro: true }),
    quoteField,
    { kind: "textarea", key: "afterQuote", label: "Абзац после цитаты", required: true, rows: 3, max: 2000 },
    {
      kind: "group",
      key: "definition",
      label: "Определение",
      fields: [
        { kind: "text", key: "term", label: "Термин", required: true, max: 120 },
        { kind: "textarea", key: "text", label: "Определение", required: true, rows: 3, max: 2000 },
      ],
    },
    outroField,
    {
      kind: "group",
      key: "book",
      label: "Ссылка на книгу",
      fields: [
        { kind: "text", key: "text", label: "Текст", required: true, max: 200 },
        { kind: "text", key: "label", label: "Текст ссылки", required: true, max: 120 },
        { kind: "url", key: "href", label: "Ссылка", required: true },
      ],
    },
    ...casesFields,
    cta,
    contactPopup,
  ],
  defaults: {
    word: IMMERSIVE_PAGE.word,
    title: IMMERSIVE_PAGE.title,
    intro: [...IMMERSIVE_PAGE.intro],
    quote: quoteOf(IMMERSIVE_PAGE.quote, 92),
    afterQuote: IMMERSIVE_PAGE.afterQuote,
    definition: { ...IMMERSIVE_PAGE.definition },
    outro: [...IMMERSIVE_PAGE.outro],
    book: { ...IMMERSIVE_PAGE.book },
    casesTitle: IMMERSIVE_PAGE.casesTitle,
    cases: IMMERSIVE_PAGE.cases.map((c) => ({ ...c })),
    cta: IMMERSIVE_PAGE.cta,
    contact: { ...IMMERSIVE_PAGE.contact },
  },
});

// ---------- Услуги бизнесу ----------

export const uslugiContent = defineContent({
  key: "uslugi",
  title: "Услуги бизнесу",
  group: "Страницы",
  hint: "Страница /uslugi-biznesu: список услуг-аккордеон.",
  paths: ["/uslugi-biznesu"],
  fields: [
    ...pageHead(),
    { kind: "textarea", key: "intro", label: "Вступление", required: true, rows: 4, max: 3000 },
    { kind: "text", key: "callout", label: "Заголовок списка услуг (плашка)", required: true, max: 120 },
    {
      kind: "group",
      key: "price",
      label: "Как узнать стоимость",
      fields: [
        { kind: "textarea", key: "lead", label: "Текст", required: true, rows: 3, max: 2000 },
        { kind: "strings", key: "steps", label: "Шаги", item: "шаг", rows: 1, min: 1 },
      ],
    },
    {
      kind: "list",
      key: "services",
      label: "Услуги",
      item: "услугу",
      title: "name",
      addTo: "end",
      fields: [
        { kind: "text", key: "name", label: "Название", required: true, max: 120 },
        { kind: "textarea", key: "text", label: "Описание", required: true, rows: 4, max: 3000 },
      ],
    },
    { kind: "textarea", key: "outro", label: "Текст под списком", required: true, rows: 3, max: 2000 },
    { kind: "text", key: "discuss", label: "Кнопка в раскрытой услуге", required: true, max: 60 },
    cta,
    contactPopup,
  ],
  defaults: {
    word: USLUGI_PAGE.word,
    title: USLUGI_PAGE.title,
    intro: USLUGI_PAGE.intro,
    callout: USLUGI_PAGE.callout,
    price: { lead: USLUGI_PAGE.price.lead, steps: [...USLUGI_PAGE.price.steps] },
    services: USLUGI_PAGE.services.map((x) => ({ ...x })),
    outro: USLUGI_PAGE.outro,
    discuss: USLUGI_PAGE.discuss,
    cta: USLUGI_PAGE.cta,
    contact: { ...USLUGI_PAGE.contact },
  },
});

// ---------- Награды ----------

const awardFields: Field[] = [
  { kind: "image", key: "logo", label: "Логотип премии (необязательно — иначе крупно год)" },
  { kind: "text", key: "city", label: "Город (необязательно)", max: 80 },
  { kind: "text", key: "year", label: "Год", required: true, max: 9 },
  { kind: "strings", key: "items", label: "Номинации / за что", item: "строку", rows: 2, min: 1 },
  { kind: "text", key: "noteTitle", label: "Примечание: заголовок (необязательно)", max: 120 },
  { kind: "textarea", key: "noteText", label: "Примечание: текст", rows: 2, max: 1000 },
  { kind: "url", key: "href", label: "Ссылка (видео, публикация)", required: true },
];

type AwardSrc = (typeof AWARDS)[number];
const awardOf = (x: AwardSrc) => ({
  logo: x.logo ? img(x.logo.src, x.logo.w, x.logo.h, x.logo.alt) : null,
  city: x.city ?? "",
  year: x.year,
  items: [...x.items],
  noteTitle: x.note?.title ?? "",
  noteText: x.note?.text ?? "",
  href: x.href,
});

export const nagradyContent = defineContent({
  key: "nagrady",
  title: "Награды",
  group: "Страницы",
  hint: "Страница /nagrady: награды, справка о премиях и награды в сфере видео.",
  paths: ["/nagrady"],
  fields: [
    ...pageHead({ intro: true }),
    quoteField,
    { kind: "text", key: "awardsTitle", label: "Заголовок раздела наград", required: true, max: 80 },
    { kind: "list", key: "awards", label: "Награды", item: "награду", title: "year", subtitle: "city", addTo: "start", fields: awardFields },
    {
      kind: "list",
      key: "glossary",
      label: "Справка о премиях (под наградами)",
      item: "премию",
      title: "term",
      addTo: "end",
      fields: [
        { kind: "text", key: "term", label: "Премия", required: true, max: 120 },
        { kind: "textarea", key: "text", label: "Описание", required: true, rows: 3, max: 2000 },
      ],
    },
    { kind: "text", key: "videoTitle", label: "Заголовок раздела видео-наград", required: true, max: 120 },
    { kind: "list", key: "video", label: "Награды в сфере видео", item: "награду", title: "year", addTo: "start", fields: awardFields },
    cta,
    contactPopup,
  ],
  defaults: {
    word: NAGRADY_PAGE.word,
    title: NAGRADY_PAGE.title,
    intro: [...NAGRADY_PAGE.intro],
    quote: quoteOf(NAGRADY_PAGE.quote, 92),
    awardsTitle: NAGRADY_PAGE.awardsTitle,
    awards: AWARDS.map(awardOf),
    glossary: AWARD_GLOSSARY.map((g) => ({ ...g })),
    videoTitle: NAGRADY_PAGE.videoTitle,
    video: VIDEO_AWARDS.map(awardOf),
    cta: NAGRADY_PAGE.cta,
    contact: { ...NAGRADY_PAGE.contact },
  },
});

// ---------- Главная: пункты спирали ----------

export const homeContent = defineContent({
  key: "home",
  title: "Главная: меню-спираль",
  group: "Страницы",
  hint: "Пункты на главной странице. Порядок — перетаскиванием.",
  paths: ["/"],
  fields: [
    {
      kind: "list",
      key: "items",
      label: "Пункты",
      item: "пункт",
      title: "label",
      subtitle: "href",
      addTo: "end",
      max: 24,
      fields: [
        { kind: "textarea", key: "label", label: "Название", hint: "Длинное — можно разбить на две строки (Enter).", required: true, rows: 2, max: 60 },
        { kind: "text", key: "sub", label: "Подпись", required: true, max: 120 },
        { kind: "url", key: "href", label: "Ссылка", required: true, placeholder: "/kurs" },
      ],
    },
  ],
  defaults: { items: DIRECTIONS.map((d) => ({ ...d })) },
});

/** Усі розділи — для меню адмінки */
export const CONTENT = [
  homeContent,
  teamContent,
  nagradyContent,
  uslugiContent,
  prContent,
  kreativContent,
  marketingContent,
  immersiveContent,
  smiContent,
  contactsContent,
] as const;

export type ContentKey = (typeof CONTENT)[number]["key"];
export type ContentData<K extends ContentKey> = Extract<(typeof CONTENT)[number], { key: K }>["defaults"];

export const contentDef = (key: string) => CONTENT.find((c) => c.key === key) ?? null;
