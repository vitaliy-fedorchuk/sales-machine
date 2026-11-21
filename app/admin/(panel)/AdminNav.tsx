"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import a from "../admin.module.css";

const LINKS = [
  { href: "/admin/cases", label: "Кейсы" },
  { href: "/admin/media", label: "Медиатека" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className={a.nav} aria-label="Разделы админки">
      {LINKS.map((l) => {
        const on = path === l.href || path.startsWith(`${l.href}/`);
        return (
          <Link key={l.href} href={l.href} className={`${a.navLink} ${on ? a.navActive : ""}`} aria-current={on ? "page" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
