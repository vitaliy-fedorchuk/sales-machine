"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/components/inner/SmoothScroll";
import { playerUrl, type Review } from "@/lib/pages/otzyvy";
import ReviewActions from "./ReviewActions";
import styles from "./ReviewModal.module.css";

/** Модалка з повним відео (Vimeo / Rutube) і текстом відгуку. Esc, клік повз, хрестик — закрити. */
export default function ReviewModal({ review, onClose }: { review: Review | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current!;
    if (review && !d.open) {
      getLenis()?.stop();
      d.showModal();
    } else if (!review && d.open) {
      d.close();
    }
  }, [review]);

  useEffect(() => {
    const d = ref.current!;
    const onCloseEv = () => {
      getLenis()?.start();
      onClose();
    };
    d.addEventListener("close", onCloseEv);
    return () => d.removeEventListener("close", onCloseEv);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={review ? `Отзыв: ${review.name}` : "Отзыв"}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
    >
      {review && (
        <div className={`${styles.box} ${review.format === "vertical" ? styles.vertical : styles.wide}`}>
          <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Закрыть">
            <span />
            <span />
          </button>
          <div className={styles.player}>
            <iframe
              key={review.id}
              src={playerUrl(review.video)}
              title={`Видеоотзыв: ${review.name}`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
              allowFullScreen
            />
          </div>
          <div className={styles.info}>
            <div className={styles.who}>
              <span className={styles.num}>{review.id} / отзыв</span>
              <h3 className={styles.name}>{review.name}</h3>
              <p className={styles.role}>{review.role}</p>
            </div>
            <div className={styles.body}>
              {review.text.map((t) => (
                <p key={t} className={styles.text}>{t}</p>
              ))}
              <ReviewActions review={review} />
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
