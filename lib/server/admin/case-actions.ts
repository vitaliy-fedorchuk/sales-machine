"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../db";
import { requireUser } from "../auth/session";
import { Prisma } from "../../generated/prisma/client";
import { cleanBlock, editorCaseSchema, publishIssues, type EditorCase, type EditorIssue } from "@/lib/cases/editor";
import type { CaseBlock } from "@/lib/cases/schema";
import { getCaseHistory, logCaseEvent, type HistoryEntry } from "./history";

export type SaveResult =
  | { ok: true; status: "DRAFT" | "PUBLISHED"; publishedAt: string | null; updatedAt: string; history: HistoryEntry[] }
  | { ok: false; issues: EditorIssue[] };

const fail = (message: string, field?: string): SaveResult => ({ ok: false, issues: [{ message, field }] });

/** Скинути кеш сайту: сторінка кейсу (стара й нова адреса) і список на /keysy */
const refreshSite = (...slugs: (string | undefined)[]) => {
  for (const s of new Set(slugs.filter(Boolean))) revalidatePath(`/stati/${s}`);
  revalidatePath("/keysy");
};

/** «Проверено»: зняти позначку «На проверке» (або повернути її) */
export async function setCaseReviewed(id: string, reviewed: boolean) {
  await requireUser();
  await db.case.update({ where: { id }, data: { needsReview: !reviewed } });
  revalidatePath("/admin/cases");
  revalidatePath(`/admin/cases/${id}`);
}

/** «Новый кейс»: порожня чернетка → одразу в редактор */
export async function createCase() {
  const user = await requireUser();
  const row = await db.case.create({
    data: {
      title: "",
      slug: `chernovik-${Date.now().toString(36)}`,
      cats: [],
      blocks: [],
      createdById: user.id,
      updatedById: user.id,
    },
  });
  await logCaseEvent(row.id, user.id, "CREATED");
  redirect(`/admin/cases/${row.id}`);
}

const toData = (c: EditorCase, blocks: CaseBlock[]) => ({
  title: c.title.trim(),
  slug: c.slug.trim(),
  cats: [...new Set(c.cats)],
  coverSrc: c.coverSrc.trim(),
  coverAlt: c.coverAlt.trim(),
  seoTitle: c.seoTitle.trim() || null,
  description: c.description.trim(),
  cta: c.cta.trim() || null,
  publishedAt: c.publishedAt ? new Date(c.publishedAt) : null,
  blocks: blocks as Prisma.InputJsonValue,
});

const resultOf = async (row: { id: string; status: "DRAFT" | "PUBLISHED"; publishedAt: Date | null; updatedAt: Date }): Promise<SaveResult> => ({
  ok: true,
  status: row.status,
  publishedAt: row.publishedAt?.toISOString() ?? null,
  updatedAt: row.updatedAt.toISOString(),
  history: await getCaseHistory(row.id),
});

const isSlugTaken = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

/**
 * Зберегти. Чернетку — як є (можна недописану). Опублікований — лише якщо
 * він і далі проходить повну перевірку: зміни одразу видно на сайті.
 */
export async function saveCase(id: string, input: unknown): Promise<SaveResult> {
  const user = await requireUser();
  const parsed = editorCaseSchema.safeParse(input);
  if (!parsed.success) return fail("Данные кейса повреждены — обновите страницу");

  const c = parsed.data as EditorCase;
  const current = await db.case.findUnique({ where: { id }, select: { status: true, slug: true } });
  if (!current) return fail("Кейс не найден — возможно, его удалили");

  let blocks = c.blocks;
  if (current.status === "PUBLISHED") {
    const issues = publishIssues(c);
    if (issues.length) return { ok: false, issues };
    blocks = blocks.map(cleanBlock);
  }
  const data = toData(c, blocks);
  if (!data.slug) delete (data as Partial<typeof data>).slug;
  if (current.status === "PUBLISHED" && !data.publishedAt) delete (data as Partial<typeof data>).publishedAt;

  try {
    const row = await db.case.update({ where: { id }, data: { ...data, updatedById: user.id } });
    await logCaseEvent(id, user.id, "EDITED");
    if (row.status === "PUBLISHED") refreshSite(current.slug, row.slug);
    return resultOf(row);
  } catch (e) {
    if (isSlugTaken(e)) return fail("Кейс с таким адресом уже есть", "slug");
    throw e;
  }
}

/** Опублікувати (або перенести дату). publishedAt: null → зараз */
export async function publishCase(id: string, input: unknown): Promise<SaveResult> {
  const user = await requireUser();
  const parsed = editorCaseSchema.safeParse(input);
  if (!parsed.success) return fail("Данные кейса повреждены — обновите страницу");

  const c = parsed.data as EditorCase;
  const issues = publishIssues(c);
  if (issues.length) return { ok: false, issues };

  try {
    const before = await db.case.findUnique({ where: { id }, select: { slug: true } });
    const row = await db.case.update({
      where: { id },
      data: {
        ...toData(c, c.blocks.map(cleanBlock)),
        status: "PUBLISHED",
        publishedAt: c.publishedAt ? new Date(c.publishedAt) : new Date(),
        updatedById: user.id,
      },
    });
    await logCaseEvent(id, user.id, "PUBLISHED");
    refreshSite(before?.slug, row.slug);
    return resultOf(row);
  } catch (e) {
    if (isSlugTaken(e)) return fail("Кейс с таким адресом уже есть", "slug");
    throw e;
  }
}

/** Зняти з публікації — кейс стає чернеткою і зникає з сайту */
export async function unpublishCase(id: string): Promise<SaveResult> {
  const user = await requireUser();
  const row = await db.case.update({ where: { id }, data: { status: "DRAFT", updatedById: user.id } });
  await logCaseEvent(id, user.id, "UNPUBLISHED");
  refreshSite(row.slug);
  return resultOf(row);
}

export async function deleteCase(id: string) {
  await requireUser();
  const row = await db.case.delete({ where: { id } }).catch(() => null);
  if (row) refreshSite(row.slug);
  redirect("/admin/cases");
}
