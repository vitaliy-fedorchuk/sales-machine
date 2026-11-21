import CaseImg from "@/components/cases/CaseImg";
import type { CaseImage } from "@/lib/cases/schema";
import styles from "./TeamList.module.css";

/** «Ядро Sales Machine»: картки людей — фото, роль, ім'я, тези по рядках, Instagram. */
type Member = { name: string; role: string; photo: CaseImage; lines: string[]; instagram: string };

export default function TeamList({ team }: { team: readonly Member[] }) {
  return (
    <ul className={styles.list}>
      {team.map((m, i) => (
        <li key={m.name} className={styles.card}>
          <div className={styles.photo}>
            <CaseImg image={{ ...m.photo, alt: m.photo.alt || m.name }} sizes="(max-width: 767px) 90vw, 20rem" zoom={false} />
          </div>
          <div className={styles.body}>
            <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
            <p className={styles.role}>{m.role}</p>
            <h3 className={styles.name}>{m.name}</h3>
            <ul className={styles.lines}>
              {m.lines.map((l) => (
                <li key={l} data-reveal>{l}</li>
              ))}
            </ul>
            {m.instagram && (
              <a className={styles.insta} href={m.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram: ${m.name}`}>
                <span className={styles.instaIcon} aria-hidden="true" />
                Instagram
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
