import page from "@/components/inner/page.module.css";
import cards from "@/components/inner/CaseGrid.module.css";
import { smiHref, type Article } from "@/lib/pages/smi";
import styles from "./YearGroups.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
// 1 публикация, 2–4 публикации, 5+ публикаций
export const pubs = (n: number) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "публикация";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "публикации";
  return "публикаций";
};

/** Публікації, згруповані за роками: кожен рік — розділ на осі з бейджем кількості. */
export default function YearGroups({ articles, startMark = 2 }: { articles: readonly Article[]; startMark?: number }) {
  const years = [...new Set(articles.map((a) => a.year))];
  return (
    <>
      {years.map((y, i) => {
        const list = articles.filter((a) => a.year === y);
        return (
          <section key={y} className={`${page.section} ${styles.year}`} aria-labelledby={`y-${y}`}>
            <div className={styles.head}>
              <h2 id={`y-${y}`} className={page.h2} data-axis-mark={pad(i + startMark)} data-twist>
                {y}
              </h2>
              <span className={styles.badge}>
                {list.length} {pubs(list.length)}
              </span>
            </div>
            <ul className={cards.grid}>
              {list.map((a) => (
                <li key={`${a.year}-${a.title}`}>
                  <a className={cards.card} href={smiHref(a)} {...(/^https?:/.test(a.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <span className={cards.top}>
                      <svg className={cards.arrow} width="41" height="41" viewBox="0 0 41 41" aria-hidden="true">
                        <circle cx="20.5" cy="20.5" r="20" />
                        <path d="M15 26 26 15M16 15h10v10" />
                      </svg>
                    </span>
                    <span className={cards.title}>{a.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
