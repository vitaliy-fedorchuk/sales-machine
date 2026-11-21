"use client";

import { useEffect, useState } from "react";
import styles from "./VariantSwitch.module.css";

export type VariantOption = { id: string; title: string };

/**
 * ТИМЧАСОВИЙ перемикач варіантів подачі сторінки (внизу по центру) — щоб порівняти й обрати.
 * Вибір пам'ятається в браузері (localStorage, ключ storeKey). Після вибору — прибрати.
 */
export function useVariant(storeKey: string, options: readonly VariantOption[]) {
  const [v, setV] = useState(options[0].id);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storeKey);
      if (saved && options.some((o) => o.id === saved)) setV(saved);
    } catch {}
  }, [storeKey, options]);
  const choose = (id: string) => {
    setV(id);
    try { localStorage.setItem(storeKey, id); } catch {}
  };
  return [v, choose] as const;
}

export default function VariantSwitch({
  options,
  value,
  onChange,
}: {
  options: readonly VariantOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={styles.switch} role="group" aria-label="Вариант подачи (для сравнения)">
      <span className={styles.head}>Вариант</span>
      {options.map((o, i) => (
        <button
          key={o.id}
          type="button"
          className={`${styles.opt} ${value === o.id ? styles.on : ""}`}
          aria-pressed={value === o.id}
          title={o.title}
          onClick={() => onChange(o.id)}
        >
          <span className={styles.letter}>{String.fromCharCode(65 + i)}</span>
          <span className={styles.title}>{o.title}</span>
        </button>
      ))}
    </div>
  );
}
