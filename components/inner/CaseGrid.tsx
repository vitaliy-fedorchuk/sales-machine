import page from "./page.module.css";
import styles from "./CaseGrid.module.css";

export type CaseLink = { title: string; href: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** Розділ «Кейсы»: заголовок на осі + сітка карток-посилань із номерами. */
export default function CaseGrid({ title, mark, cases }: { title: string; mark: string; cases: readonly CaseLink[] }) {
  return (
    <section className={styles.cases} aria-labelledby="cases-title">
      <h2 id="cases-title" className={page.h2} data-axis-mark={mark} data-twist>
        {title}
      </h2>
      <ul className={styles.grid}>
        {cases.map((c, i) => (
          <li key={c.href}>
            <a className={styles.card} href={c.href} target="_blank" rel="noopener noreferrer">
              <span className={styles.top}>
                <svg className={styles.arrow} width="41" height="41" viewBox="0 0 41 41" aria-hidden="true">
                  <circle cx="20.5" cy="20.5" r="20" />
                  <path d="M15 26 26 15M16 15h10v10" />
                </svg>
                <span className={styles.num}>{pad(i + 1)}</span>
              </span>
              <span className={styles.title}>{c.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
