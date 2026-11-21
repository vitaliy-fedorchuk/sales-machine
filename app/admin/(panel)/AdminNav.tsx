"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import a from "../admin.module.css";

const LINKS = [
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/cases", label: "Кейсы" },
  { href: "/admin/content", label: "Страницы и списки" },
  { href: "/admin/media", label: "Медиатека" },
];

/** newLeads — кількість нових заявок (бейдж біля «Заявки») */
export default function AdminNav({ newLeads = 0 }: { newLeads?: number }) {
  const path = usePathname();
  return (
    <nav className={a.nav} aria-label="Разделы админки">
      {LINKS.map((l) => {
        const on = path === l.href || path.startsWith(`${l.href}/`);
        return (
          <Link key={l.href} href={l.href} className={`${a.navLink} ${on ? a.navActive : ""}`} aria-current={on ? "page" : undefined}>
            {l.label}
            {l.href === "/admin/leads" && newLeads > 0 && <span className={a.navCount}>{newLeads}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
