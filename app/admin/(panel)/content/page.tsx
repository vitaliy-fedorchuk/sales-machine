import type { Metadata } from "next";
import Link from "next/link";
import { CONTENT } from "@/lib/content/registry";
import { requireUser } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import a from "../../admin.module.css";

export const metadata: Metadata = { title: "Страницы и списки" };

const GROUPS = ["Страницы", "Списки", "Настройки"] as const;

const when = (d: Date) => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" }).format(d);

export default async function ContentList() {
  await requireUser();
  const rows = await db.content.findMany({ select: { key: true, updatedAt: true, updatedBy: { select: { name: true } } } });
  const saved = new Map(rows.map((r) => [r.key, r]));

  return (
    <>
      <div className={a.pageHead}>
        <h1 className={a.h1}>Страницы и списки</h1>
        <p className={a.muted} style={{ margin: 0, maxWidth: 520 }}>
          Тексты, фото и списки страниц сайта. Дизайн и расположение блоков фиксированы — меняется только содержимое.
          Кейсы — в отдельном разделе.
        </p>
      </div>
      {GROUPS.map((g) => {
        const items = CONTENT.filter((c) => c.group === g);
        if (!items.length) return null;
        return (
          <section key={g} style={{ marginBottom: 28 }}>
            <h2 className={a.cardTitle} style={{ marginBottom: 10 }}>
              {g}
            </h2>
            <div className={a.contentCards}>
              {items.map((c) => {
                const s = saved.get(c.key);
                return (
                  <Link key={c.key} href={`/admin/content/${c.key}`} className={a.contentCard}>
                    <strong>{c.title}</strong>
                    {c.hint && <span>{c.hint}</span>}
                    <small>{s ? `Изменено ${when(s.updatedAt)}${s.updatedBy ? ` · ${s.updatedBy.name}` : ""}` : "Исходные тексты"}</small>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
