"use client";

import { useEffect, useState } from "react";
import { scrollToSection } from "./events";
import styles from "./KursNav.module.css";

type Item = { readonly id: string; readonly label: string };

/**
 * Навігація по розділах курсу замість шапки оригіналу. Фіксована вгорі по центру (на мобільному — внизу),
 * підсвічує розділ, у якому зараз читач. Ховається, поки видно перший екран, щоб не спорити з великим словом.
 */
export default function KursNav({ items }: { items: readonly Item[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = innerHeight * 0.4;
      let cur: string | null = null;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) cur = s.id;
      setActive(cur);
      setShown(scrollY > innerHeight * 0.35);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <nav className={`${styles.nav} ${shown ? styles.shown : ""}`} aria-label="Разделы курса">
      <ul className={styles.list}>
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={`${styles.link} ${active === it.id ? styles.active : ""} ${i === items.length - 1 ? styles.cta : ""}`}
              aria-current={active === it.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(it.id);
              }}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
