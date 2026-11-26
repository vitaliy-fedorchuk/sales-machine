"use server";

import { revalidatePath } from "next/cache";
import { objectSchema } from "@/lib/content/fields";
import { contentDef } from "@/lib/content/registry";
import { Prisma } from "../../generated/prisma/client";
import { requireUser } from "../auth/session";
import { db } from "../db";

export type ContentSaveResult = { ok: true; updatedAt: string } | { ok: false; errors: { path: string; message: string }[] };

const ADMIN_ONLY = new Set(["code"]);

const refresh = (paths: readonly string[]) => {
  for (const p of paths) {
    if (p === "layout") revalidatePath("/", "layout");
    else revalidatePath(p);
  }
};

/** Зберегти розділ: повна перевірка за описом полів → запис → оновлення сторінок сайту */
export async function saveContent(key: string, data: unknown): Promise<ContentSaveResult> {
  const user = await requireUser();
  const def = contentDef(key);
  if (!def) return { ok: false, errors: [{ path: "", message: "Раздел не найден" }] };
  // Код на сайті = довільні скрипти на всіх сторінках — лише адміністратор
  if (ADMIN_ONLY.has(key) && user.role !== "ADMIN") {
    return { ok: false, errors: [{ path: "", message: "Этот раздел может менять только администратор" }] };
  }

  const parsed = objectSchema(def.fields).safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.slice(0, 20).map((i) => ({ path: i.path.join("."), message: i.message })),
    };
  }

  const row = await db.content.upsert({
    where: { key },
    create: { key, data: parsed.data as Prisma.InputJsonValue, updatedById: user.id },
    update: { data: parsed.data as Prisma.InputJsonValue, updatedById: user.id },
  });
  refresh(def.paths);
  return { ok: true, updatedAt: row.updatedAt.toISOString() };
}

/** Вернуть тексты из кода (удалить сохранённую версию) */
export async function resetContent(key: string) {
  const user = await requireUser();
  const def = contentDef(key);
  if (!def) return;
  if (ADMIN_ONLY.has(key) && user.role !== "ADMIN") return;
  await db.content.delete({ where: { key } }).catch(() => {});
  refresh(def.paths);
}
