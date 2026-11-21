import type { Metadata } from "next";
import Link from "next/link";
import type { LeadStatus } from "@/lib/generated/prisma/client";
import { requireUser } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import a from "../../admin.module.css";
import { STATUS_LABEL } from "@/lib/leads";
import LeadCard from "./LeadCard";

export const metadata: Metadata = { title: "Заявки" };

const FILTERS = ["NEW", "IN_WORK", "DONE", "SPAM", "ALL"] as const;
type Filter = (typeof FILTERS)[number];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const filter: Filter = FILTERS.includes(sp.s as Filter) ? (sp.s as Filter) : "NEW";
  const [rows, counts] = await Promise.all([
    db.lead.findMany({ where: filter === "ALL" ? {} : { status: filter as LeadStatus }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: Filter) => (s === "ALL" ? counts.reduce((n, c) => n + c._count, 0) : (counts.find((c) => c.status === s)?._count ?? 0));
  const telegramOn = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

  return (
    <>
      <div className={a.pageHead}>
        <h1 className={a.h1}>Заявки</h1>
        <p className={a.muted} style={{ margin: 0, maxWidth: 520 }}>
          Все заявки из форм сайта сохраняются здесь.{" "}
          {telegramOn ? "Копия приходит в Telegram-бот." : "Telegram-бот пока не подключён — заявки только здесь."}
        </p>
      </div>
      <div className={a.toolbar}>
        <div className={a.seg}>
          {FILTERS.map((f) => (
            <Link key={f} href={f === "NEW" ? "/admin/leads" : `/admin/leads?s=${f}`} className={filter === f ? a.segOn : ""}>
              {f === "ALL" ? "Все" : STATUS_LABEL[f]} · {count(f)}
            </Link>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className={a.empty}>{filter === "NEW" ? "Новых заявок нет" : "Здесь пока пусто"}</p>
      ) : (
        <div className={a.leads}>
          {rows.map((l) => (
            <LeadCard key={l.id} lead={{ ...l, createdAt: l.createdAt.toISOString() }} />
          ))}
        </div>
      )}
    </>
  );
}
