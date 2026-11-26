import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { EditorCase } from "@/lib/cases/editor";
import { CASE_CATEGORIES, type CaseBlock } from "@/lib/cases/schema";
import { setCaseReviewed } from "@/lib/server/admin/case-actions";
import { getCaseHistory } from "@/lib/server/admin/history";
import { requireUser } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import a from "../../../admin.module.css";
import CaseEditor from "./CaseEditor";

export const metadata: Metadata = { title: "Редактор кейса" };

export default async function CaseEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const row = await db.case.findUnique({ where: { id } });
  if (!row) notFound();

  const cats = new Set<string>(CASE_CATEGORIES);
  const initial: EditorCase = {
    title: row.title,
    slug: row.slug,
    cats: row.cats.filter((c): c is EditorCase["cats"][number] => cats.has(c)),
    coverSrc: row.coverSrc,
    coverAlt: row.coverAlt,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    seoTitle: row.seoTitle ?? "",
    description: row.description,
    cta: row.cta ?? "",
    // Чернетка може містити недописані блоки — у редактор віддаємо як є
    blocks: (Array.isArray(row.blocks) ? row.blocks : []) as CaseBlock[],
  };

  const history = await getCaseHistory(row.id);
  return (
    <>
      {row.needsReview && (
        <form action={setCaseReviewed.bind(null, row.id, true)} className={a.reviewBanner}>
          <p>
            <b>На проверке.</b> Кейс перенесён автоматически из сторонней публикации — вычитайте текст и фото, затем отметьте как проверенный.
          </p>
          <button type="submit" className={a.btnPrimary}>
            Проверено
          </button>
        </form>
      )}
      <CaseEditor id={row.id} initialStatus={row.status} initialCase={initial} initialHistory={history} />
    </>
  );
}
