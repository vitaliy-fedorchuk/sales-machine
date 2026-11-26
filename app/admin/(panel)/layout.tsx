import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/lib/server/auth/actions";
import { requireUser } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import a from "../admin.module.css";
import AdminNav from "./AdminNav";

/** Панель після входу: меню зліва, сторінка справа. Вхід перевіряється тут і в кожній дії. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const newLeads = await db.lead.count({ where: { status: "NEW" } });
  return (
    <div className={a.shell}>
      <aside className={a.side}>
        <Link href="/admin" className={a.brand}>
          <span className={a.brandName}>Sales Machine</span>
          <span className={a.brandSub}>админка</span>
        </Link>
        <AdminNav newLeads={newLeads} />
        <div className={a.sideFoot}>
          <span>
            {user.name}
            <br />
            <span className={a.muted}>{user.email}</span>
          </span>
          <Link href="/admin/account">Профиль и безопасность</Link>
          <Link href="/" target="_blank">
            Открыть сайт ↗
          </Link>
          <form action={logout}>
            <button type="submit" className={a.btnDanger}>
              Выйти
            </button>
          </form>
        </div>
      </aside>
      <main className={a.main}>
        {!user.has2fa && (
          <div className={a.securityBanner}>
            <span>Двухфакторная защита не включена — вход в админку держится только на пароле.</span>
            <Link href="/admin/account">Включить →</Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
