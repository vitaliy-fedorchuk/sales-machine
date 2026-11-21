"use client";

import { useCallback, useState } from "react";
import ReviewModal from "@/components/otzyvy/ReviewModal";
import type { VideoFormat } from "@/lib/cases/types";
import type { Review } from "@/lib/pages/otzyvy";
import styles from "./CaseBlocks.module.css";

/** «▶ Смотреть отзыв» — відкриває відео відгуку в тій самій модалці, що й на /otzyvy. */
export default function CaseReview({ label, src, format, caseTitle }: { label: string; src: string; format: VideoFormat; caseTitle: string }) {
  const [review, setReview] = useState<Review | null>(null);
  const close = useCallback(() => setReview(null), []);
  return (
    <>
      <button
        type="button"
        className={styles.play}
        onClick={() =>
          setReview({ id: "▶", name: label, role: caseTitle, text: [], preview: "", poster: "", video: src, format })
        }
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="9.25" />
          <path d="M8 6.5v7l5.5-3.5z" />
        </svg>
        {label}
      </button>
      <ReviewModal review={review} onClose={close} />
    </>
  );
}
