"use client";

import { useState } from "react";
import { openContact } from "@/components/inner/ContactCta";
import styles from "./ServiceList.module.css";

type Service = { readonly name: string; readonly text: string };

/**
 * Перелік послуг — акордеон у дві колонки. «+» перетворюється на «×», опис плавно розгортається
 * (grid-template-rows 0fr → 1fr). «Давайте обсудим» відкриває попап сторінки.
 */
export default function ServiceList({ services, discuss }: { services: readonly Service[]; discuss: string }) {
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
      {services.map((s, i) => {
        const on = open.has(i);
        const id = `service-${i}`;
        return (
          <li key={s.name} className={`${styles.item} ${on ? styles.on : ""}`}>
            <button type="button" className={styles.head} aria-expanded={on} aria-controls={id} onClick={() => toggle(i)}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.name}>{s.name}</span>
              <span className={styles.plus} aria-hidden="true" />
            </button>
            <div id={id} className={styles.panel} role="region" aria-label={s.name}>
              <div className={styles.inner}>
                <p className={styles.text}>{s.text}</p>
                <button type="button" className={styles.discuss} onClick={openContact} tabIndex={on ? 0 : -1}>
                  {discuss}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
