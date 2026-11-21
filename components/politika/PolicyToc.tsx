"use client";

import { useEffect, useState } from "react";
import { getLenis } from "@/components/inner/SmoothScroll";
import styles from "./Policy.module.css";

/** Липкий зміст політики: клік — плавно до розділу, поточний розділ підсвічується. */
export default function PolicyToc({ items }: { items: readonly { n: string; title: string }[] }) {
  const [active, setActive] = useState(items[0]?.n);

  useEffect(() => {
    const els = items.map((it) => document.getElementById(`p-${it.n}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.slice(2));
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const go = (n: string) => {
    const el = document.getElementById(`p-${n}`);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -110, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={styles.toc} aria-label="Содержание">
      <span className={styles.tocHead}>Содержание</span>
      <ol className={styles.tocList}>
        {items.map((it) => (
          <li key={it.n}>
            <a
              href={`#p-${it.n}`}
              data-no-transition
              className={`${styles.tocItem} ${active === it.n ? styles.tocOn : ""}`}
              aria-current={active === it.n ? "true" : undefined}
              onClick={(e) => { e.preventDefault(); go(it.n); }}
            >
              <span className={styles.no}>{it.n.padStart(2, "0")}</span>
              <span>{it.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
