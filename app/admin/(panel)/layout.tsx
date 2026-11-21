import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/lib/server/auth/actions";
import { requireUser } from "@/lib/server/auth/session";
import a from "../admin.module.css";
import AdminNav from "./AdminNav";

/** Панель після входу: меню зліва, сторінка справа. Вхід перевіряється тут і в кожній дії. */
export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className={a.shell}>
      <aside className={a.side}>
        <Link href="/admin" className={a.brand}>
          <span className={a.brandName}>Sales Machine</span>
          <span className={a.brandSub}>админка</span>
        </Link>
        <AdminNav />
        <div className={a.sideFoot}>
          <span>
            {user.name}
            <br />
            <span className={a.muted}>{user.email}</span>
          </span>
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
      <main className={a.main}>{children}</main>
    </div>
  );
}
