import type { CaseBlock } from "@/lib/cases/types";
import CaseAudio from "./CaseAudio";
import CaseGallery from "./CaseGallery";
import CaseImg from "./CaseImg";
import CaseReview from "./CaseReview";
import RichText from "./RichText";
import styles from "./CaseBlocks.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** embed-URL з автозапуском вимкненим і без зайвого брендування плеєра. */
const embed = (src: string) => {
  try {
    const u = new URL(src);
    if (u.hostname.includes("youtube")) u.searchParams.set("rel", "0");
    return u.toString();
  } catch {
    return src;
  }
};

/**
 * Рендер блоків кейсу. Блок із міткою («Задача:», «Результат:»…) — окремий розділ на осі
 * (номер продовжує нумерацію сторінки з `firstMark`), решта блоків ідуть усередині поточного розділу.
 */
export default function CaseBlocks({ blocks, caseTitle, firstMark = 2 }: { blocks: readonly CaseBlock[]; caseTitle: string; firstMark?: number }) {
  let mark = firstMark;
  return (
    <div className={styles.blocks}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "text":
            return (
              <div key={i} className={styles.text}>
                {b.label && (
                  <h2 className={styles.label} data-axis-mark={pad(mark++)}>
                    {b.label.replace(/:\s*$/, "")}
                  </h2>
                )}
                {b.body && <RichText text={b.body} className={styles.p} reveal />}
              </div>
            );
          case "image":
            return (
              <figure key={i} className={`${styles.figure} ${b.frame ? styles.frame : ""} ${b.narrow ? styles.narrow : ""}`}>
                <CaseImg image={b.image} caption={b.caption} className={styles.img} sizes={b.narrow ? "(max-width: 767px) 100vw, 40rem" : undefined} />
                {b.caption && <figcaption className={styles.caption}>{b.caption}</figcaption>}
              </figure>
            );
          case "gallery":
            return <CaseGallery key={i} images={b.images} />;
          case "video":
            return (
              <div key={i} className={`${styles.video} ${b.format === "vertical" ? styles.vertical : ""}`}>
                <iframe
                  src={embed(b.src)}
                  title={b.title ?? caseTitle}
                  loading="lazy"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
                  allowFullScreen
                />
              </div>
            );
          case "audio":
            return <CaseAudio key={i} items={b.items} />;
          case "review":
            return <CaseReview key={i} label={b.label} src={b.src} format={b.format} caseTitle={caseTitle} />;
          case "link": {
            const external = /^https?:/.test(b.href);
            return (
              <a key={i} className={styles.link} href={b.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {b.label}
                <svg width="20" height="20" viewBox="0 0 41 41" aria-hidden="true">
                  <circle cx="20.5" cy="20.5" r="19.5" />
                  <path d="M15 26 26 15M16 15h10v10" />
                </svg>
              </a>
            );
          }
          case "press":
            return (
              <ul key={i} className={styles.press}>
                {b.items.map((p) => (
                  <li key={p.href}>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className={styles.pressCard}>
                      <span className={styles.pressSource}>{p.source}</span>
                      <span className={styles.pressQuote}>{p.quote}</span>
                    </a>
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
