import type { Metadata } from "next";
import { currentSessionId, requireUser } from "@/lib/server/auth/session";
import { db } from "@/lib/server/db";
import { describeDevice } from "@/lib/server/telegram";
import a from "../../admin.module.css";
import { LogoutOthers, PasswordForm, TwoFactor } from "./AccountForms";

export const metadata: Metadata = { title: "Профиль и безопасность" };

const when = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);

export default async function AccountPage() {
  const me = await requireUser();
  const [sessions, current] = await Promise.all([
    db.session.findMany({ where: { userId: me.id, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } }),
    currentSessionId(),
  ]);

  return (
    <>
      <div className={a.pageHead}>
        <h1 className={a.h1}>Профиль и безопасность</h1>
      </div>
      <p className={a.muted} style={{ marginTop: 0 }}>
        {me.name} · {me.email} · {me.role === "ADMIN" ? "администратор" : "редактор"}
      </p>

      <section className={a.panel}>
        <h2 className={a.h2}>Двухфакторная защита</h2>
        <TwoFactor enabled={me.has2fa} />
      </section>

      <section className={a.panel}>
        <h2 className={a.h2}>Пароль</h2>
        <PasswordForm />
      </section>

      <section className={a.panel}>
        <h2 className={a.h2}>Где выполнен вход</h2>
        <table className={a.table}>
          <thead>
            <tr>
              <th>Устройство</th>
              <th>IP</th>
              <th>Вход</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>
                  {describeDevice(s.userAgent)}
                  {s.id === current && <span className={a.tableSlug}>это устройство</span>}
                </td>
                <td>{s.ip ?? "—"}</td>
                <td>{when(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length > 1 && <LogoutOthers />}
      </section>
    </>
  );
}
