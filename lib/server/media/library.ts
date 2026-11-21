import "server-only";
import { db } from "../db";
import { Prisma, type Media } from "../../generated/prisma/client";
import { variantOf, type MediaItem } from "../../media/urls";

export const toMediaItem = (m: Media & { used?: boolean }): MediaItem => ({
  id: m.id,
  kind: m.kind === "AUDIO" ? "audio" : "image",
  mime: m.mime,
  key: m.key,
  url: m.url,
  thumb: m.kind === "AUDIO" ? "" : variantOf(m.url, 480),
  width: m.width,
  height: m.height,
  bytes: m.bytes,
  originalBytes: m.originalBytes,
  alt: m.alt,
  originalName: m.originalName,
  used: m.used,
  createdAt: m.createdAt.toISOString(),
});

export const PAGE_SIZE = 48;

/** «Файл десь використаний»: обкладинка чи блок кейсу. Адреси містять key (у ньому унікальний id). */
const USED_SQL = Prisma.sql`EXISTS (
  SELECT 1 FROM "Case" c
  WHERE c."coverSrc" LIKE '%' || m.key || '%' OR c.blocks::text LIKE '%' || m.key || '%'
)`;

export type MediaSort = "new" | "old" | "size";
export interface MediaFilters {
  kind?: "image" | "audio";
  q?: string;
  unused?: boolean;
  missingAlt?: boolean;
  sort?: MediaSort;
  offset?: number;
}

const ORDER: Record<MediaSort, Prisma.Sql> = {
  new: Prisma.sql`m."createdAt" DESC, m.id DESC`,
  old: Prisma.sql`m."createdAt" ASC, m.id ASC`,
  size: Prisma.sql`COALESCE(m."originalBytes", m.bytes) DESC`,
};

const whereSql = (f: MediaFilters) => {
  const conds: Prisma.Sql[] = [Prisma.sql`TRUE`];
  if (f.kind) conds.push(Prisma.sql`m.kind = ${f.kind === "audio" ? "AUDIO" : "IMAGE"}::"MediaKind"`);
  const q = f.q?.trim();
  if (q) {
    const like = `%${q}%`;
    conds.push(Prisma.sql`(m.alt ILIKE ${like} OR m."originalName" ILIKE ${like})`);
  }
  if (f.missingAlt) conds.push(Prisma.sql`m.alt = ''`);
  if (f.unused) conds.push(Prisma.sql`NOT ${USED_SQL}`);
  return Prisma.join(conds, " AND ");
};

/** Сторінка медіатеки з фільтрами */
export const queryMedia = async (f: MediaFilters) => {
  const where = whereSql(f);
  const offset = Math.max(0, f.offset ?? 0);
  const [rows, total] = await Promise.all([
    db.$queryRaw<(Media & { used: boolean })[]>`
      SELECT m.*, ${USED_SQL} AS used FROM "Media" m
      WHERE ${where}
      ORDER BY ${ORDER[f.sort ?? "new"]}
      LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    db.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "Media" m WHERE ${where}`,
  ]);
  const count = Number(total[0]?.n ?? 0);
  return {
    items: rows.map(toMediaItem),
    total: count,
    nextOffset: offset + rows.length < count ? offset + rows.length : null,
  };
};

/** У яких кейсах стоїть фото */
export const findMediaUsage = (key: string) => {
  const like = `%${key}%`;
  return db.$queryRaw<{ id: string; title: string }[]>`
    SELECT id, title FROM "Case"
    WHERE "coverSrc" LIKE ${like} OR blocks::text LIKE ${like}
    ORDER BY "updatedAt" DESC`;
};
