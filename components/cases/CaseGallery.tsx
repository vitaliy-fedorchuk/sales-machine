"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseImage } from "@/lib/cases/types";
import CaseImg from "./CaseImg";
import styles from "./CaseGallery.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Слайдер зображень кейсу: нативний скрол зі snap, стрілки, лічильник і смужка прогресу. */
export default function CaseGallery({ images }: { images: readonly CaseImage[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = trackRef.current!;
    const onScroll = () => setCur(Math.round(t.scrollLeft / Math.max(1, t.clientWidth)));
    t.addEventListener("scroll", onScroll, { passive: true });
    return () => t.removeEventListener("scroll", onScroll);
  }, []);

  const go = (dir: 1 | -1) => {
    const t = trackRef.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({ left: dir * t.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={styles.wrap}>
      <ul ref={trackRef} className={styles.track} tabIndex={0} aria-label="Галерея">
        {images.map((im, i) => (
          <li key={im.src} className={styles.slide} aria-label={`${i + 1} из ${images.length}`}>
            <CaseImg image={im} className={styles.img} noUpscale />
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <p className={styles.count} aria-live="polite">
          {pad(cur + 1)} <span>/ {pad(images.length)}</span>
        </p>
        <div className={styles.bar} aria-hidden="true">
          <i style={{ left: `${(cur / images.length) * 100}%`, width: `${100 / images.length}%` }} />
        </div>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} onClick={() => go(-1)} disabled={cur <= 0} aria-label="Предыдущий слайд">
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="M7 1 1 7l6 6M1 7h21" />
            </svg>
          </button>
          <button type="button" className={styles.arrow} onClick={() => go(1)} disabled={cur >= images.length - 1} aria-label="Следующий слайд">
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="m15 1 6 6-6 6M21 7H0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
