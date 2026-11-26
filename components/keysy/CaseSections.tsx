"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getLenis } from "@/components/inner/SmoothScroll";
import page from "@/components/inner/page.module.css";
import { CATEGORIES, type Case } from "@/lib/pages/keysy";
import CaseCard from "./CaseCard";
import grid from "./keysy.module.css";
import styles from "./CaseSections.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

// Кожен кейс — один раз, у своїй першій категорії (інші видно в підписі картки).
const groupsOf = (cases: readonly Case[]) =>
  CATEGORIES.map((c) => ({ ...c, items: cases.filter((it) => it.cats[0] === c.id) })).filter((g) => g.items.length > 0);

/**
 * Кейси без фільтра: згруповані розділами на осі (02 Маркетинг, 03 Креатив …),
 * ліворуч — липкий зміст: клік плавно веде до розділу, поточний підсвічується.
 */
export default function CaseSections({ cases }: { cases: readonly Case[] }) {
  const GROUPS = useMemo(() => groupsOf(cases), [cases]);
  const [active, setActive] = useState<string>(GROUPS[0].id);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive((visible[0].target as HTMLElement).dataset.cat!);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sectionsRef.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    const el = sectionsRef.current.get(id);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -110, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className={styles.layout}>
      <nav className={styles.index} aria-label="Категории кейсов">
        <span className={styles.indexHead}>Категории</span>
        <ol className={styles.indexList}>
          {GROUPS.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                className={`${styles.indexItem} ${active === g.id ? styles.indexActive : ""}`}
                aria-current={active === g.id ? "true" : undefined}
                onClick={() => go(g.id)}
              >
                <span className={styles.indexLabel}>{g.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className={styles.sections}>
        {GROUPS.map((g, i) => (
          <section
            key={g.id}
            ref={(el) => { if (el) sectionsRef.current.set(g.id, el); }}
            data-cat={g.id}
            className={styles.section}
            aria-labelledby={`cat-${g.id}`}
          >
            <div className={styles.head}>
              <h2 id={`cat-${g.id}`} className={page.h2} data-axis-mark={pad(i + 2)} data-twist>
                {g.label}
              </h2>
            </div>
            <ul className={`${grid.grid} ${styles.grid}`}>
              {g.items.map((it) => (
                <CaseCard key={it.title} item={it} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
