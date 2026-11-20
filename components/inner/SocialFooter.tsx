import Link from "next/link";
import type { CSSProperties } from "react";
import { CONTACTS } from "@/lib/contacts";
import styles from "./SocialFooter.module.css";

export default function SocialFooter() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.list}>
        {CONTACTS.social.map((s) => (
          <li key={s.name}>
            <a className={styles.link} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
              <span className={styles.icon} style={{ "--icon": `url(${s.icon})` } as CSSProperties} />
            </a>
          </li>
        ))}
      </ul>
      <Link className={styles.privacy} href={CONTACTS.privacyHref}>
        Политика обработки персональных данных
      </Link>
    </footer>
  );
}
