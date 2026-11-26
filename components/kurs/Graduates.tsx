"use client";

import { useEffect, useRef, useState } from "react";
import PersonNames from "@/components/otzyvy/PersonNames";
import PreviewVideo from "@/components/otzyvy/PreviewVideo";
import ReviewActions from "@/components/otzyvy/ReviewActions";
import type { Review } from "@/lib/pages/otzyvy";
import { openKurs } from "./events";
import styles from "./Graduates.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Слайдер відгуків випускників (в оригіналі — Swiper). Нативний горизонтальний скрол зі snap:
 * тягнеться пальцем / тачпадом, стрілки гортають на картку, лічильник замість 20 крапок.
 */
export default function Graduates({ reviews }: { reviews: readonly Review[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ first: 0, perView: 2 });

  useEffect(() => {
    const t = trackRef.current!;
    const measure = () => {
      const card = t.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + parseFloat(getComputedStyle(t).columnGap || "0");
      setPos({
        first: Math.round(t.scrollLeft / step),
        perView: Math.max(1, Math.round((t.clientWidth + 1) / step)),
      });
    };
    measure();
    t.addEventListener("scroll", measure, { passive: true });
    addEventListener("resize", measure);
    return () => {
      t.removeEventListener("scroll", measure);
      removeEventListener("resize", measure);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const t = trackRef.current!;
    const card = t.firstElementChild as HTMLElement;
    const step = card.offsetWidth + parseFloat(getComputedStyle(t).columnGap || "0");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  const last = Math.min(reviews.length, pos.first + pos.perView);
  const atStart = pos.first <= 0;
  const atEnd = last >= reviews.length;

  return (
    <div className={styles.wrap}>
      <ul ref={trackRef} className={styles.track} aria-label="Отзывы выпускников" tabIndex={0}>
        {reviews.map((r) => (
          <li key={r.id} className={styles.card}>
            <div className={styles.top}>
              <button
                type="button"
                className={styles.thumb}
                onClick={() => openKurs({ kind: "video", review: r })}
                aria-label={`Смотреть отзыв: ${r.name}`}
              >
                <PreviewVideo src={r.preview} poster={r.poster} className={styles.video} />
              </button>
              <div className={styles.who}>
                <h3 className={styles.name}>
                  <PersonNames name={r.name} />
                </h3>
                <p className={styles.role}>{r.role}</p>
              </div>
            </div>
            <p className={styles.quote}>{r.text[0]}</p>
            <ReviewActions review={r} onPlay={() => openKurs({ kind: "video", review: r })} />
          </li>
        ))}
      </ul>

      <div className={styles.controls}>
        <p className={styles.count} aria-live="polite">
          {pad(pos.first + 1)}
          {pos.perView > 1 && `–${pad(last)}`} <span>/ {pad(reviews.length)}</span>
        </p>
        <div className={styles.bar} aria-hidden="true">
          <i style={{ left: `${(pos.first / reviews.length) * 100}%`, width: `${(pos.perView / reviews.length) * 100}%` }} />
        </div>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} onClick={() => go(-1)} disabled={atStart} aria-label="Предыдущие отзывы">
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="M7 1 1 7l6 6M1 7h21" />
            </svg>
          </button>
          <button type="button" className={styles.arrow} onClick={() => go(1)} disabled={atEnd} aria-label="Следующие отзывы">
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="m15 1 6 6-6 6M21 7H0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
