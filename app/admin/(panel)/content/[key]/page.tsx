import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { contentDef, type ContentKey } from "@/lib/content/registry";
import { requireUser } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import ContentEditor from "../ContentEditor";

export const metadata: Metadata = { title: "Редактирование раздела" };

export default async function ContentEditPage({ params }: { params: Promise<{ key: string }> }) {
  await requireUser();
  const { key } = await params;
  if (!contentDef(key)) notFound();
  const [data, row] = await Promise.all([
    getContent(key as ContentKey),
    db.content.findUnique({ where: { key }, select: { updatedAt: true, updatedBy: { select: { name: true } } } }),
  ]);
  return (
    <ContentEditor
      contentKey={key}
      initial={data as Record<string, unknown>}
      saved={!!row}
      updatedAt={row?.updatedAt.toISOString() ?? null}
      updatedBy={row?.updatedBy?.name ?? null}
    />
  );
}
