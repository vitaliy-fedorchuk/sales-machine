import { z } from "zod";
import { CASE_CATEGORIES, caseBlockSchema, type CaseBlock, type CaseBlockType } from "./schema";

/**
 * Спільне для редактора (браузер) і серверних дій: дані кейсу в редакторі,
 * нові блоки, адреса з назви, перевірка перед публікацією.
 */

// ---------- Адреса з назви (транслитерация, как в адресах старого сайта) ----------

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  // украинские буквы — на всякий случай
  і: "i", ї: "yi", є: "ye", ґ: "g",
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[а-яёіїєґ]/g, (ch) => TRANSLIT[ch] ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/, "");

// ---------- Блоки ----------

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const emptyImage = () => ({ src: "", alt: "", width: 0, height: 0 });

/** Порожній блок потрібного типу — з усіма полями, щоб форми були керованими */
export const createBlock = (type: CaseBlockType): CaseBlock => {
  const id = newId();
  switch (type) {
    case "text":
      return { id, type, label: "", body: "" };
    case "image":
      return { id, type, image: emptyImage(), frame: false, narrow: false, caption: "" };
    case "gallery":
      return { id, type, images: [] };
    case "video":
      return { id, type, src: "", format: "wide", title: "" };
    case "audio":
      return { id, type, items: [{ title: "1й аудио-ролик", src: "" }] };
    case "review":
      return { id, type, label: "Смотреть отзыв", src: "", format: "vertical" };
    case "link":
      return { id, type, label: "Смотреть кейс", href: "" };
    case "press":
      return { id, type, items: [{ source: "", quote: "", href: "" }] };
  }
};

/** Блок із бази → блок для редактора (порожні необов'язкові поля) */
export const normalizeBlock = (block: CaseBlock): CaseBlock => ({ ...createBlock(block.type), ...block }) as CaseBlock;

export const duplicateBlock = (block: CaseBlock): CaseBlock => ({ ...structuredClone(block), id: newId() });

export const BLOCK_TYPES: CaseBlockType[] = ["text", "image", "gallery", "video", "audio", "review", "link", "press"];

// ---------- Дані кейсу в редакторі ----------

/** Чернетка може бути недописаною — тут лише структура. Повна перевірка — publishIssues(). */
export const draftBlockSchema = z.looseObject({ id: z.string().min(1), type: z.string() });

export const editorCaseSchema = z.object({
  title: z.string().max(300),
  slug: z.string().max(100),
  cats: z.array(z.enum(CASE_CATEGORIES)).max(7),
  coverSrc: z.string().max(500),
  coverAlt: z.string().max(300),
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  seoTitle: z.string().max(300),
  description: z.string().max(400),
  cta: z.string().max(120),
  blocks: z.array(draftBlockSchema).max(300),
});

export type EditorCase = Omit<z.infer<typeof editorCaseSchema>, "blocks"> & { blocks: CaseBlock[] };

// ---------- Перевірка перед публікацією ----------

export interface EditorIssue {
  /** Блок, до якого помилка; без нього — поле кейсу (field) */
  blockId?: string;
  field?: string;
  message: string;
}

/**
 * Перед публікацією прибираємо порожнє: необов'язкові поля ("") і порожні рядки —
 * щоб у базі лежали чисті дані, а сайт не малював порожніх підписів.
 */
export const cleanBlock = (block: CaseBlock): CaseBlock =>
  JSON.parse(
    JSON.stringify(block, (k, v) => {
      if (k !== "alt" && typeof v === "string" && v.trim() === "") return undefined;
      return v;
    }),
  );

const issueMessage = (issue: z.core.$ZodIssue) => {
  if (issue.message && !issue.message.startsWith("Invalid") && !issue.message.startsWith("Too")) return issue.message;
  const key = [...issue.path].reverse().find((p) => typeof p === "string") as string | undefined;
  const LABEL: Record<string, string> = {
    body: "Текст", label: "Заголовок", src: "Ссылка", href: "Ссылка", title: "Название", items: "Пункты", images: "Фото",
    source: "Источник", quote: "Цитата",
  };
  return `Заполните «${(key && LABEL[key]) || "поле"}»`;
};

/** Усе, що заважає опублікувати кейс. Порожній масив — можна. */
export const publishIssues = (c: EditorCase): EditorIssue[] => {
  const issues: EditorIssue[] = [];
  if (!c.title.trim()) issues.push({ field: "title", message: "Добавьте заголовок кейса" });
  if (!SLUG_PATTERN.test(c.slug)) issues.push({ field: "slug", message: "Адрес: только латиница в нижнем регистре, цифры и дефисы" });
  if (c.cats.length === 0) issues.push({ field: "cats", message: "Выберите хотя бы одну категорию — по ней кейс попадёт в раздел на /keysy" });
  if (c.blocks.length === 0) issues.push({ field: "blocks", message: "Добавьте хотя бы один блок" });
  for (const block of c.blocks) {
    const r = caseBlockSchema.safeParse(cleanBlock(block));
    if (!r.success) issues.push({ blockId: block.id, message: issueMessage(r.error.issues[0]) });
  }
  return issues;
};
