import type { Metadata } from "next";
import type { ReactNode } from "react";
import a from "./admin.module.css";

export const metadata: Metadata = {
  title: { default: "Админка — Sales Machine", template: "%s — админка Sales Machine" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className={a.root}>{children}</div>;
}
