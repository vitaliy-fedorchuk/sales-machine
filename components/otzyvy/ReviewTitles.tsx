"use client";

import { useState } from "react";
import type { Review } from "@/lib/pages/otzyvy";
import PreviewVideo from "./PreviewVideo";
import ReviewActions from "./ReviewActions";
import s from "./otzyvy.module.css";
import styles from "./ReviewTitles.module.css";

/**
 * «Титри»: великий типографічний список імен (як фінальні титри / стрічка на головній).
 * Наведений рядок у фокусі, решта гасне; праворуч липкий «екран» — відео й опис активного відгуку.
 * На телефоні рядок розгортається з відео всередині.
 */
export default function ReviewTitles({ reviews: REVIEWS, onOpen }: { reviews: readonly Review[]; onOpen: (r: Review) => void }) {
  const [active, setActive] = useState(0);
  const cur = REVIEWS[active];

  return (
    <section className={styles.wrap} aria-label="Видеоотзывы">
      <ol className={styles.list} data-axis-mark="02">
        {REVIEWS.map((r, i) => (
          <li key={r.id} className={`${styles.row} ${i === active ? styles.on : ""}`} onMouseEnter={() => setActive(i)}>
            <button
              type="button"
              className={styles.rowBtn}
              aria-expanded={i === active}
              onFocus={() => setActive(i)}
              onClick={() => (i === active && matchMedia("(min-width: 992px)").matches ? onOpen(r) : setActive(i))}
            >
              <span className={s.num}>{r.id}</span>
              <span className={styles.rowName}>{r.name}</span>
              <span className={styles.rowRole}>{r.role}</span>
            </button>

            {/* телефон: розгорнутий рядок */}
            <div className={styles.inline} hidden={i !== active}>
              <button type="button" className={styles.inlineVideo} onClick={() => onOpen(r)} aria-label={`Смотреть отзыв: ${r.name}`}>
                <PreviewVideo className={s.video} src={r.preview} poster={r.poster} playing={i === active} />
              </button>
              {r.text.map((t) => (
                <p key={t} className={s.text}>{t}</p>
              ))}
              <ReviewActions review={r} onPlay={() => onOpen(r)} />
            </div>
          </li>
        ))}
      </ol>

      {/* desktop: липкий екран */}
      <aside className={styles.screen} aria-live="polite">
        <button type="button" className={styles.screenVideo} onClick={() => onOpen(cur)} aria-label={`Смотреть отзыв: ${cur.name}`}>
          {REVIEWS.map((r, i) => (
            <span key={r.id} className={`${styles.layer} ${i === active ? styles.layerOn : ""}`}>
              <PreviewVideo className={s.video} src={r.preview} poster={r.poster} playing={i === active} />
            </span>
          ))}
          <span className={styles.screenNum}>
            {cur.id} / {String(REVIEWS.length).padStart(2, "0")}
          </span>
        </button>
        <div className={styles.screenText} key={cur.id}>
          {cur.text.map((t) => (
            <p key={t} className={s.text}>{t}</p>
          ))}
          <ReviewActions review={cur} onPlay={() => onOpen(cur)} />
        </div>
      </aside>
    </section>
  );
}
