"use client";

import { useEffect, useRef, useState } from "react";
import { toEmbed } from "@/lib/video";
import styles from "./CaseGallery.module.css";

type Video = { src: string; format: "wide" | "vertical"; title?: string };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Кілька відео поспіль у кейсі — слайдер (як галерея фото): стрілки, лічильник, свайп.
 * Плеєр підключається лише для поточного й сусідніх слайдів — щоб сторінка не вантажила 11 плеєрів одразу.
 */
export default function CaseVideoGallery({ videos, caseTitle }: { videos: readonly Video[]; caseTitle: string }) {
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

  const vertical = videos.every((v) => v.format === "vertical");

  return (
    <div className={styles.wrap}>
      <ul ref={trackRef} className={styles.track} tabIndex={0} aria-label="Видео">
        {videos.map((v, i) => (
          <li key={v.src} className={styles.slide} aria-label={`${i + 1} из ${videos.length}`}>
            <div className={styles.videoBox} style={{ aspectRatio: vertical ? "9 / 16" : "16 / 9", maxHeight: vertical ? "80vh" : undefined }}>
              {Math.abs(i - cur) <= 1 ? (
                <iframe
                  src={toEmbed(v.src)}
                  title={v.title ?? `${caseTitle}, видео ${i + 1}`}
                  loading="lazy"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
                  allowFullScreen
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <p className={styles.count} aria-live="polite">
          {pad(cur + 1)} <span>/ {pad(videos.length)}</span>
        </p>
        <div className={styles.bar} aria-hidden="true">
          <i style={{ left: `${(cur / videos.length) * 100}%`, width: `${100 / videos.length}%` }} />
        </div>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} onClick={() => go(-1)} disabled={cur <= 0} aria-label="Предыдущее видео">
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="M7 1 1 7l6 6M1 7h21" />
            </svg>
          </button>
          <button type="button" className={styles.arrow} onClick={() => go(1)} disabled={cur >= videos.length - 1} aria-label="Следующее видео">
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="m15 1 6 6-6 6M21 7H0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
