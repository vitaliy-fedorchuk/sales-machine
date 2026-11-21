import Link from "next/link";
import styles from "./BackLink.module.css";
import WordFade from "./WordFade";

/**
 * Стрілка «назад» у меню — фіксована й завжди клікабельна (над контентом).
 * Велике слово розділу — окремим шаром ПІД контентом, як фон.
 */
export default function BackLink({ word }: { word: string }) {
  return (
    <>
      <span className={styles.word} aria-hidden="true" data-back-word>{word}</span>
      <WordFade selector="[data-back-word]" />
      <Link href="/" className={styles.back} aria-label="Назад в меню">
        <svg className={styles.arrow} width="114" height="68" viewBox="0 0 114 68" aria-hidden="true">
          <path d="M1.69685 30.3804L32.0772 0L38.4411 6.36396L15.4051 29.4H114V38.4H15.3633L38.4414 61.4772L32.0781 67.8411L1.69992 37.4644C1.5729 37.3632 1.45009 37.2542 1.33213 37.1372L1.31802 37.1232L1.30396 37.109C0.429472 36.2269 -0.00516756 35.073 4.63561e-05 33.9207C1.54586e-05 33.9138 0 33.9069 0 33.9C0 32.6573 0.503906 31.5323 1.31836 30.718C1.41992 30.6162 1.52734 30.5193 1.63867 30.4276C1.65793 30.4117 1.67732 30.396 1.69685 30.3804Z" />
        </svg>
      </Link>
    </>
  );
}
