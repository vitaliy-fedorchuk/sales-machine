import Link from "next/link";
import { forwardRef } from "react";
import { CATEGORIES, type Case } from "@/lib/pages/keysy";
import styles from "./keysy.module.css";

const LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<string, string>;

type Props = { item: Case };

/** Картка кейсу: назва + стрілка, унизу — категорії моно-шрифтом. */
const CaseCard = forwardRef<HTMLLIElement, Props>(function CaseCard({ item }, ref) {
  return (
    <li ref={ref} className={styles.cell}>
      {item.href.startsWith("/") ? (
        <Link className={styles.card} href={item.href}>
        <span className={styles.cardTop}>
          <span className={styles.cardTitle}>{item.title}</span>
          <svg className={styles.arrow} width="40" height="40" viewBox="0 0 41 41" aria-hidden="true">
            <circle cx="20.5" cy="20.5" r="20" />
            <path d="M15 26 26 15M16 15h10v10" />
          </svg>
        </span>
        <span className={styles.cats}>{item.cats.map((c) => LABEL[c]).join(" · ")}</span>
      </Link>
      ) : (
        <a className={styles.card} href={item.href} target="_blank" rel="noopener noreferrer">
        <span className={styles.cardTop}>
          <span className={styles.cardTitle}>{item.title}</span>
          <svg className={styles.arrow} width="40" height="40" viewBox="0 0 41 41" aria-hidden="true">
            <circle cx="20.5" cy="20.5" r="20" />
            <path d="M15 26 26 15M16 15h10v10" />
          </svg>
        </span>
        <span className={styles.cats}>{item.cats.map((c) => LABEL[c]).join(" · ")}</span>
      </a>
      )}
    </li>
  );
});

export default CaseCard;
