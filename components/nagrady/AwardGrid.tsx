import Image from "next/image";
import type { ReactNode } from "react";
import page from "@/components/inner/page.module.css";
import type { Award } from "@/lib/pages/nagrady";
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
  awards: readonly Award[];
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
            <a className={styles.card} href={a.href} target="_blank" rel="noopener noreferrer">
              <span className={styles.top}>
                {a.logo ? (
                  <span className={styles.logo}>
                    <Image src={a.logo.src} alt={a.logo.alt} width={a.logo.w} height={a.logo.h} />
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

              {a.note && (
                <span className={styles.note}>
                  <strong>{a.note.title}:</strong> {a.note.text}
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
