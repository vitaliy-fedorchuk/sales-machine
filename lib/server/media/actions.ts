"use server";

import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth/session";
import { findMediaUsage, queryMedia, toMediaItem, type MediaFilters } from "./library";
import { removeImageFiles } from "./process";
import { removeFiles } from "./storage";

const filtersSchema = z.object({
  kind: z.enum(["image", "audio"]).optional(),
  q: z.string().max(100).optional(),
  unused: z.boolean().optional(),
  missingAlt: z.boolean().optional(),
  sort: z.enum(["new", "old", "size"]).optional(),
  offset: z.number().int().min(0).max(100000).optional(),
});

/** Фото з фільтрами (медіатека й вікно вибору в редакторі) */
export async function listMedia(filters: MediaFilters) {
  await requireUser();
  return queryMedia(filtersSchema.parse(filters));
}

export async function getMediaUsage(id: string) {
  await requireUser();
  const media = await db.media.findUnique({ where: { id } });
  return media ? findMediaUsage(media.key) : [];
}

export async function updateMediaAlt(id: string, alt: string) {
  await requireUser();
  const row = await db.media.update({ where: { id }, data: { alt: z.string().trim().max(300).parse(alt) } });
  return toMediaItem(row);
}

/** Видалити файл — лише якщо він ніде не використаний */
export async function deleteMedia(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser();
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return { ok: true };

  const usage = await findMediaUsage(media.key);
  if (usage.length > 0) {
    return { ok: false, error: `Файл используется в кейсах (${usage.length}) — сначала уберите его оттуда` };
  }

  await db.media.delete({ where: { id } });
  await (media.kind === "AUDIO" ? removeFiles([media.url]) : removeImageFiles(media.url)).catch((e) => console.error("[media] remove files", e));
  return { ok: true };
}
