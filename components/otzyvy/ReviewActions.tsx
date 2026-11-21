import type { Review } from "@/lib/pages/otzyvy";
import styles from "./otzyvy.module.css";

/** «▶ Смотреть отзыв» (якщо передано onPlay) + додаткові посилання відгуку. */
export default function ReviewActions({ review, onPlay }: { review: Review; onPlay?: () => void }) {
  return (
    <div className={styles.actions}>
      {onPlay && (
        <button type="button" className={styles.play} onClick={onPlay}>
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="9.25" />
            <path d="M8 6.5v7l5.5-3.5z" />
          </svg>
          Смотреть отзыв
        </button>
      )}
      {review.links?.map((l) => (
        <a key={l.href} className={styles.link} href={l.href} target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 41 41" aria-hidden="true">
            <circle cx="20.5" cy="20.5" r="19.5" />
            <path d="M15 26 26 15M16 15h10v10" />
          </svg>
          {l.label}
        </a>
      ))}
      {review.site && (
        <a className={styles.link} href={review.site.href} target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 41 41" aria-hidden="true">
            <circle cx="20.5" cy="20.5" r="19.5" />
            <path d="M15 26 26 15M16 15h10v10" />
          </svg>
          {review.site.label}
        </a>
      )}
    </div>
  );
}
