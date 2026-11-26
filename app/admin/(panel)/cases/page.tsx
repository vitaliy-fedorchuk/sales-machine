import type { Metadata } from "next";
import Link from "next/link";
import { createCase } from "@/lib/server/admin/case-actions";
import { requireUser } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { CATEGORIES } from "@/lib/pages/keysy";
import type { Prisma } from "@/lib/generated/prisma/client";
import a from "../../admin.module.css";
import { Icon } from "../../icons";

export const metadata: Metadata = { title: "Кейсы" };

const LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<string, string>;

const when = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);

type Filter = "all" | "draft" | "published" | "review";

export default async function CasesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const status: Filter = sp.status === "draft" || sp.status === "published" || sp.status === "review" ? sp.status : "all";
  const q = (sp.q ?? "").trim().slice(0, 100);

  const where: Prisma.CaseWhereInput = {
    ...(status === "draft" && { status: "DRAFT" }),
    ...(status === "published" && { status: "PUBLISHED" }),
    ...(status === "review" && { needsReview: true }),
    ...(q && { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }),
  };
  const [rows, counts, toReview] = await Promise.all([
    db.case.findMany({ where, orderBy: { updatedAt: "desc" }, include: { updatedBy: { select: { name: true } } } }),
    db.case.groupBy({ by: ["status"], _count: true }),
    db.case.count({ where: { needsReview: true } }),
  ]);
  const count = (s: "DRAFT" | "PUBLISHED") => counts.find((c) => c.status === s)?._count ?? 0;
  const now = Date.now();
  const href = (s: Filter) => `/admin/cases${s === "all" ? "" : `?status=${s}`}${q ? `${s === "all" ? "?" : "&"}q=${encodeURIComponent(q)}` : ""}`;

  return (
    <>
      <div className={a.pageHead}>
        <h1 className={a.h1}>Кейсы</h1>
        <form action={createCase}>
          <button type="submit" className={a.btnPrimary}>
            <Icon name="plus" />
            Новый кейс
          </button>
        </form>
      </div>

      <div className={a.toolbar}>
        <div className={a.seg}>
          <Link href={href("all")} className={status === "all" ? a.segOn : ""}>
            Все · {count("DRAFT") + count("PUBLISHED")}
          </Link>
          <Link href={href("published")} className={status === "published" ? a.segOn : ""}>
            Опубликованные · {count("PUBLISHED")}
          </Link>
          <Link href={href("draft")} className={status === "draft" ? a.segOn : ""}>
            Черновики · {count("DRAFT")}
          </Link>
          {(toReview > 0 || status === "review") && (
            <Link href={href("review")} className={status === "review" ? a.segOn : ""}>
              На проверке · {toReview}
            </Link>
          )}
        </div>
        <form>
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <input className={a.input} type="search" name="q" defaultValue={q} placeholder="Поиск по названию или адресу" aria-label="Поиск" />
        </form>
      </div>

      {rows.length === 0 ? (
        <p className={a.empty}>{q ? "Ничего не найдено" : "Кейсов пока нет — создайте первый"}</p>
      ) : (
        <table className={a.table}>
          <thead>
            <tr>
              <th>Кейс</th>
              <th>Категории</th>
              <th>Статус</th>
              <th>Изменён</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const scheduled = c.status === "PUBLISHED" && c.publishedAt && c.publishedAt.getTime() > now;
              return (
                <tr key={c.id} className={c.needsReview ? a.rowReview : undefined}>
                  <td>
                    {c.needsReview && <span className={`${a.badge} ${a.badgeReview}`}>На проверке</span>}
                    <Link href={`/admin/cases/${c.id}`} className={a.tableTitle}>
                      {c.title || "Без названия"}
                    </Link>
                    <span className={a.tableSlug}>/stati/{c.slug}</span>
                  </td>
                  <td>{c.cats.map((x) => LABEL[x] ?? x).join(", ") || <span className={a.muted}>—</span>}</td>
                  <td>
                    {c.status === "DRAFT" ? (
                      <span className={a.badge}>Черновик</span>
                    ) : scheduled ? (
                      <span className={`${a.badge} ${a.badgeScheduled}`}>Запланирован</span>
                    ) : (
                      <span className={`${a.badge} ${a.badgePublished}`}>Опубликован</span>
                    )}
                  </td>
                  <td>
                    {when(c.updatedAt)}
                    {c.updatedBy && <span className={a.tableSlug}>{c.updatedBy.name}</span>}
                  </td>
                  <td>
                    {c.status === "PUBLISHED" && !scheduled && (
                      <a href={`/stati/${c.slug}`} target="_blank" rel="noopener noreferrer" className={a.iconBtn} title="Открыть на сайте">
                        <Icon name="external" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
