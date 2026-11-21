import "server-only";
import { cache } from "react";
import { db } from "@/lib/server/db";
import { parseBlocks, type CaseArticle } from "./schema";

// Кейси з бази (редагуються в /admin/cases). Сайт бачить лише опубліковані з датою не в майбутньому.

type Row = Awaited<ReturnType<typeof db.case.findFirst>> & {};

const toArticle = (c: NonNullable<Row>): CaseArticle => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  seoTitle: c.seoTitle ?? undefined,
  description: c.description,
  cats: c.cats,
  cover: c.coverSrc ? { src: c.coverSrc, alt: c.coverAlt } : undefined,
  blocks: parseBlocks(c.blocks),
  cta: c.cta ?? undefined,
  publishedAt: c.publishedAt?.toISOString() ?? null,
});

const live = () => ({ status: "PUBLISHED" as const, publishedAt: { lte: new Date() } });

/** Опублікований кейс за адресою або null */
export const getCase = cache(async (slug: string) => {
  const row = await db.case.findFirst({ where: { slug, ...live() } });
  return row ? toArticle(row) : null;
});

/** Будь-який кейс за id — для попереднього перегляду в адмінці (там же перевіряється вхід) */
export const getCaseForPreview = async (id: string) => {
  const row = await db.case.findUnique({ where: { id } });
  return row ? toArticle(row) : null;
};

/** Короткий список опублікованих — для /keysy */
export const getPublishedCaseList = () =>
  db.case.findMany({
    where: live(),
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, cats: true },
  });
