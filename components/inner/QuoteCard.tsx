import Image from "next/image";
import styles from "./QuoteCard.module.css";

export type Quote = { role?: string; name: string; photo: string; text: string };

/** Цитата з автором: фото, посада, ім'я, текст (проявляється рядками при скролі). */
export default function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <figure className={styles.quote}>
      <figcaption className={styles.author}>
        <Image className={styles.photo} src={quote.photo} alt="" width={92} height={92} />
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
