import type { ReactNode } from "react";
import page from "@/components/inner/page.module.css";
import type { CaseImage } from "@/lib/cases/schema";
import { srcSetOf } from "@/lib/media/urls";
import { outHref } from "@/lib/outlinks";

/** Нагорода — як її редагують в адмінці («Награды») */
export type AwardView = {
  logo: CaseImage | null;
  city: string;
  year: string;
  items: string[];
  noteTitle: string;
  noteText: string;
  href: string;
};
import styles from "./AwardGrid.module.css";

// 1 награда, 2–4 награды, 5+ наград
const plural = (n: number) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "награда";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "награды";
  return "наград";
};

/** Розділ із сіткою нагород: логотип премії, місто · рік, бейдж кількості, номінації, посилання. */
export default function AwardGrid({
  title,
  mark,
  awards,
  children,
}: {
  title: string;
  mark: string;
  awards: readonly AwardView[];
  children?: ReactNode;
}) {
  return (
    <section className={page.section} aria-label={title}>
      <h2 className={page.h2} data-axis-mark={mark} data-twist>
        {title}
      </h2>
      <ul className={styles.grid}>
        {awards.map((a, i) => (
          <li key={`${a.year}-${i}`} className={styles.cell}>
            <a className={styles.card} href={outHref(a.href)} target="_blank" rel="noopener noreferrer">
              <span className={styles.top}>
                {a.logo ? (
                  <span className={styles.logo}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- логотип з медіатеки або public/ */}
                    <img src={a.logo.src} srcSet={srcSetOf(a.logo.src)} sizes="16rem" alt={a.logo.alt} width={a.logo.width} height={a.logo.height} loading="lazy" />
                  </span>
                ) : (
                  <span className={styles.year}>{a.year}</span>
                )}
                <svg className={styles.arrow} width="40" height="40" viewBox="0 0 41 41" aria-hidden="true">
                  <circle cx="20.5" cy="20.5" r="20" />
                  <path d="M15 26 26 15M16 15h10v10" />
                </svg>
              </span>

              {a.city && (
                <span className={styles.head}>
                  <span className={styles.place}>
                    {a.city} · {a.year}
                  </span>
                  <span className={styles.badge}>
                    {a.items.length} {plural(a.items.length)}
                  </span>
                </span>
              )}

              <ul className={styles.items}>
                {a.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>

              {(a.noteTitle || a.noteText) && (
                <span className={styles.note}>
                  {a.noteTitle && <strong>{a.noteTitle}:</strong>} {a.noteText}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}
