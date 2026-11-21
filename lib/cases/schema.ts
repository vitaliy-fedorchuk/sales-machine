import { z } from "zod";

/*
 * Модель кейсу (/stati/<slug>) = заголовок + метадані + список блоків.
 * Набір блоків зібрано з усіх 24 кейсів старого сайту.
 * Ця схема — і перевірка при збереженні в адмінці, і при читанні з бази на сайті.
 */

/**
 * Текст із простим форматуванням (поле «Текст» у редакторі):
 *   порожній рядок — новий абзац, одиночний перенос — <br>,
 *   **жирный**, *курсив*, [текст](https://ссылка).
 */
const richText = z.string().trim().min(1).max(20000);

export const caseImageSchema = z.object({
  src: z.string().trim().min(1, "Выберите фото").max(500),
  alt: z.string().max(300),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const url = z.string().trim().url("Нужна ссылка вида https://…").max(1000);
/** Файл з медіатеки: локально — /uploads/…, на проді — https://…blob… */
const fileUrl = z.string().trim().regex(/^(https?:\/\/|\/)\S+$/, "Выберите файл или вставьте ссылку").max(1000);
const videoFormat = z.enum(["wide", "vertical"]);

export const caseBlockSchema = z.discriminatedUnion("type", [
  /** Абзаци з необов'язковою жирною міткою: «Задача:», «Результат:»… Лише мітка — підзаголовок. */
  z.object({
    id: z.string(),
    type: z.literal("text"),
    label: z.string().trim().max(120).optional(),
    body: richText.optional(),
  }).refine((b) => b.label || b.body, { message: "Заполните заголовок или текст" }),
  /** Одне зображення; frame — тонка рамка (логотипи на білому); narrow — вузьке (вертикальні фото, логотипи) */
  z.object({
    id: z.string(),
    type: z.literal("image"),
    image: caseImageSchema,
    frame: z.boolean().optional(),
    narrow: z.boolean().optional(),
    caption: z.string().trim().max(300).optional(),
  }),
  /** Кілька зображень — слайдер */
  z.object({
    id: z.string(),
    type: z.literal("gallery"),
    images: z.array(caseImageSchema).min(2, "Галерея: нужно минимум 2 фото").max(40),
  }),
  /** Відео у плеєрі на сторінці (YouTube / Vimeo / Rutube) */
  z.object({
    id: z.string(),
    type: z.literal("video"),
    src: url,
    format: videoFormat,
    title: z.string().trim().max(200).optional(),
  }),
  /** Аудіоролики (радіореклама) */
  z.object({
    id: z.string(),
    type: z.literal("audio"),
    items: z.array(z.object({ title: z.string().trim().min(1, "Название ролика").max(120), src: fileUrl })).min(1).max(40),
  }),
  /** «▶ Смотреть отзыв» — відео відгуку в попапі */
  z.object({
    id: z.string(),
    type: z.literal("review"),
    label: z.string().trim().min(1).max(80),
    src: url,
    format: videoFormat,
  }),
  /** Кнопка-посилання: «Смотреть кейс», публікація */
  z.object({
    id: z.string(),
    type: z.literal("link"),
    label: z.string().trim().min(1, "Текст кнопки").max(120),
    href: z.string().trim().min(1, "Ссылка").max(1000),
  }),
  /** Сітка цитат зі ЗМІ */
  z.object({
    id: z.string(),
    type: z.literal("press"),
    items: z
      .array(z.object({ source: z.string().trim().min(1, "Источник").max(120), quote: z.string().trim().min(1, "Цитата").max(1000), href: url }))
      .min(1)
      .max(20),
  }),
]);

export type CaseBlock = z.infer<typeof caseBlockSchema>;
export type CaseBlockType = CaseBlock["type"];
export type CaseImage = z.infer<typeof caseImageSchema>;
export type VideoFormat = z.infer<typeof videoFormat>;
export type RichText = string;

export const CASE_CATEGORIES = ["marketing", "kreativ", "pr", "brending", "reklama", "rebranding", "office"] as const;

/** Кейс, як його бачить сайт */
export type CaseArticle = {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  cats: string[];
  cover?: { src: string; alt: string };
  blocks: CaseBlock[];
  cta?: string;
  publishedAt: string | null;
};

/** Блоки з бази: биті (не за схемою) пропускаємо, а не валимо сторінку */
export const parseBlocks = (raw: unknown): CaseBlock[] => {
  if (!Array.isArray(raw)) return [];
  const out: CaseBlock[] = [];
  for (const b of raw) {
    const r = caseBlockSchema.safeParse(b);
    if (r.success) out.push(r.data);
    else console.warn("[cases] skip invalid block", (b as { type?: string })?.type, r.error.issues[0]?.message);
  }
  return out;
};
