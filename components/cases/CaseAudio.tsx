"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CaseBlocks.module.css";

/** Радіоролики: кнопки «▶ 1й аудио-ролик». Грає один ролик за раз, повторний клік — пауза. */
export default function CaseAudio({ items }: { items: readonly { title: string; src: string }[] }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [cur, setCur] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = ref.current!;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    a.addEventListener("ended", off);
    return () => {
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
      a.removeEventListener("ended", off);
    };
  }, []);

  const toggle = (i: number) => {
    const a = ref.current!;
    if (cur === i) {
      if (a.paused) a.play().catch(() => {});
      else a.pause();
      return;
    }
    a.src = items[i].src;
    setCur(i);
    a.play().catch(() => {});
  };

  return (
    <div className={styles.audio}>
      {items.map((it, i) => {
        const on = cur === i && playing;
        return (
          <button key={it.src} type="button" className={`${styles.audioBtn} ${on ? styles.audioOn : ""}`} onClick={() => toggle(i)} aria-pressed={on}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="9.25" />
              {on ? <path d="M7.5 6.5v7M12.5 6.5v7" /> : <path d="M8 6.5v7l5.5-3.5z" />}
            </svg>
            {it.title}
          </button>
        );
      })}
      <audio ref={ref} preload="none" />
    </div>
  );
}
