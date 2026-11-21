// Розділи сайту, які редагуються в адмінці (/admin/content). Кожен — опис полів + поточний вміст із коду.
// Додати новий розділ: defineContent(...) тут → сторінка сайту читає getContent("<key>").

import { CONTACTS } from "@/lib/contacts";
import { ONAS_PAGE, TEAM } from "@/lib/pages/o-nas";
import { ARTICLES, SMI_PAGE } from "@/lib/pages/smi";
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

/** Усі розділи — для меню адмінки */
export const CONTENT = [teamContent, smiContent, contactsContent] as const;

export type ContentKey = (typeof CONTENT)[number]["key"];
export type ContentData<K extends ContentKey> = Extract<(typeof CONTENT)[number], { key: K }>["defaults"];

export const contentDef = (key: string) => CONTENT.find((c) => c.key === key) ?? null;
