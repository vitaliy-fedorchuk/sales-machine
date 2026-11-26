"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

// Підпис і повзунок залежать від data-theme через CSS — без мерехтіння до гідрації.
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // В адмінці плаваючий перемикач не показуємо (вона бере тему, вибрану на сайті)
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");

  const toggle = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    setTheme(isDark ? "light" : "dark");
  };

  if (admin) return null;

  return (
    <button
      type="button"
      className={`${styles.toggle} ${pathname === "/" ? "" : styles.inner}`}
      aria-pressed={mounted ? resolvedTheme === "dark" : undefined}
      onClick={toggle}
      data-theme-toggle
    >
      <span className={styles.toLight}>Светлая тема</span>
      <span className={styles.toDark}>Тёмная тема</span>
      <span className={styles.sw} aria-hidden="true">
        <i />
      </span>
    </button>
  );
}
