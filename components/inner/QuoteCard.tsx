import type { CaseImage } from "@/lib/cases/schema";
import { srcSetOf } from "@/lib/media/urls";
import styles from "./QuoteCard.module.css";

/** photo — адреса (статичне фото з public/) або фото з медіатеки (адмінка) */
export type Quote = { role?: string; name: string; photo: string | CaseImage | null; text: string };

/** Цитата з автором: фото, посада, ім'я, текст (проявляється рядками при скролі). */
export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <figure className={styles.quote}>
      <figcaption className={styles.author}>
        {quote.photo && (
          // eslint-disable-next-line @next/next/no-img-element -- фото з медіатеки вже нарізане на розміри
          <img
            className={styles.photo}
            src={typeof quote.photo === "string" ? quote.photo : quote.photo.src}
            srcSet={typeof quote.photo === "string" ? undefined : srcSetOf(quote.photo.src)}
            sizes="6rem"
            alt=""
            width={92}
            height={92}
            loading="lazy"
          />
        )}
        <span className={styles.who}>
          {quote.role && <span className={styles.role}>{quote.role}</span>}
          <span className={styles.name}>{quote.name}</span>
        </span>
      </figcaption>
      <blockquote className={styles.text} data-reveal>
        {quote.text}
      </blockquote>
    </figure>
  );
}
