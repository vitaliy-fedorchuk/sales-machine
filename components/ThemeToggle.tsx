"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

// Підпис і повзунок залежать від data-theme через CSS — без мерехтіння до гідрації.
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggle = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={mounted ? resolvedTheme === "dark" : undefined}
      onClick={toggle}
    >
      <span className={styles.toLight}>Светлая тема</span>
      <span className={styles.toDark}>Тёмная тема</span>
      <span className={styles.sw} aria-hidden="true">
        <i />
      </span>
    </button>
  );
}
