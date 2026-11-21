import Link from "next/link";
import type { CSSProperties } from "react";
import { getContent } from "@/lib/content";
import { NETWORK_LABEL } from "@/lib/content/registry";
import { CONTACTS } from "@/lib/contacts";
import styles from "./SocialFooter.module.css";

/** Соцмережі внизу сторінок — з адмінки («Контакты и соцсети»). Іконка — за типом мережі. */
export default async function SocialFooter() {
  const { social } = await getContent("contacts");
  return (
    <footer className={styles.footer}>
      <ul className={styles.list}>
        {social.map((s) => (
          <li key={s.network + s.href}>
            <a className={styles.link} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={NETWORK_LABEL[s.network] ?? s.network}>
              <span className={styles.icon} style={{ "--icon": `url(/icons/${s.network}.svg)` } as CSSProperties} />
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
