"use client";

import { useState, type ReactNode } from "react";
import styles from "./Accordion.module.css";

export type AccordionItem = { title: string; body: ReactNode };

/**
 * Акордеон в одну колонку (програма курсу, часті питання) — та сама механіка, що й у послугах:
 * «+» повертається в «×», вміст розгортається через grid-template-rows 0fr → 1fr.
 */
export default function Accordion({ items, id, numbered = false }: { items: AccordionItem[]; id: string; numbered?: boolean }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <ul className={styles.list}>
      {items.map((it, i) => {
        const on = open.has(i);
        const pid = `${id}-${i}`;
        return (
          <li key={it.title} className={`${styles.item} ${on ? styles.on : ""}`}>
            <button
              type="button"
              className={`${styles.head} ${numbered ? "" : styles.plain}`}
              aria-expanded={on}
              aria-controls={pid}
              onClick={() => toggle(i)}
            >
              {numbered && <span className={styles.num}>{String(i).padStart(2, "0")}</span>}
              <span className={styles.title}>{it.title}</span>
              <span className={styles.plus} aria-hidden="true" />
            </button>
            <div id={pid} className={styles.panel} role="region" aria-label={it.title} inert={!on}>
              <div className={`${styles.inner} ${numbered ? "" : styles.plainInner}`}>{it.body}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
