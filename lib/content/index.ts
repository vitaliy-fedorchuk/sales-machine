import "server-only";
import { cache } from "react";
import { db } from "@/lib/server/db";
import { objectSchema } from "./fields";
import { contentDef, type ContentData, type ContentKey } from "./registry";

/**
 * Вміст розділу сайту: з бази (якщо змінювали в адмінці) або з коду.
 * Нові поля, яких ще немає в збереженому записі, беруться з коду; битий запис — теж код (і попередження в лог).
 */
export const getContent = cache(async <K extends ContentKey>(key: K): Promise<ContentData<K>> => {
  const def = contentDef(key)!;
  let row: { data: unknown } | null = null;
  try {
    row = await db.content.findUnique({ where: { key }, select: { data: true } });
  } catch (e) {
    // База недоступна (наприклад, збірка без DATABASE_URL) — сайт усе одно працює на текстах із коду
    console.warn(`[content] ${key}: база недоступна, беру тексти из кода`, (e as Error).message);
  }
  if (!row) return def.defaults as ContentData<K>;
  const merged = { ...(def.defaults as object), ...(row.data as object) };
  const parsed = objectSchema(def.fields).safeParse(merged);
  if (!parsed.success) {
    console.warn(`[content] ${key}: запись не прошла проверку, беру тексты из кода`, parsed.error.issues[0]);
    return def.defaults as ContentData<K>;
  }
  return parsed.data as ContentData<K>;
});
