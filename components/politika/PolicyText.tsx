import type { ReactNode } from "react";
import styles from "./Policy.module.css";

type Section = { readonly n: string; readonly title: string; readonly body: readonly string[] };

const dash = (s: string) => s.replace(/ - /g, " — ");
const isSubhead = (l: string) => /^\d+\.\d+\.\s+[А-ЯЁ]/.test(l) && !/[.;:]$/.test(l) && l.length < 110;
const isListItem = (l: string) => /^([а-я]|\d)\)\s/.test(l);
const EMAIL = /([\w.+-]+@[\w-]+\.[\w.]+)/;

/** Номер пункту («3.2.4.») — моно-шрифтом, далі текст; e-mail — посилання. */
function Clause({ text }: { text: string }) {
  const m = text.match(/^(\d+(?:\.\d+)+\.?)\s+([\s\S]*)$/);
  const body = m ? m[2] : text;
  const parts: ReactNode[] = dash(body)
    .split(EMAIL)
    .map((p, i) => (EMAIL.test(p) && i % 2 === 1 ? <a key={i} href={`mailto:${p}`}>{p}</a> : p));
  return (
    <>
      {m && <span className={styles.no}>{m[1]}</span>}
      {parts}
    </>
  );
}

/** Абзац; якщо всередині «…: - пункт; - пункт» — вступ + маркований список. */
function Para({ text }: { text: string }) {
  const at = text.indexOf(": - ");
  if (at > 0) {
    const lead = text.slice(0, at + 1);
    const items = text
      .slice(at + 4)
      .split(/[;,]\s*-\s+/) // «…прав;- иные…» в оригіналі буває без пробілу
      .map((s) => s.trim().replace(/;$/, ""))
      .filter(Boolean);
    return (
      <div className={styles.block}>
        <p className={styles.p}>
          <Clause text={lead} />
        </p>
        <ul className={styles.ul}>
          {items.map((it) => (
            <li key={it}>{dash(it)}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <p className={styles.p}>
      <Clause text={text} />
    </p>
  );
}

/** Розмітка розділу політики з «плоских» рядків оригіналу. */
export default function PolicyText({ section }: { section: Section }) {
  const out: ReactNode[] = [];
  const body = section.body;
  for (let i = 0; i < body.length; i++) {
    const l = body[i];
    if (isSubhead(l)) {
      const m = l.match(/^(\d+\.\d+\.)\s+(.*)$/)!;
      out.push(
        <h3 key={i} className={styles.h3}>
          <span className={styles.no}>{m[1]}</span>
          {m[2]}
        </h3>,
      );
    } else if (isListItem(l)) {
      const items: string[] = [];
      while (i < body.length && isListItem(body[i])) items.push(body[i++]);
      i--;
      out.push(
        <ul key={i} className={`${styles.ul} ${styles.marked}`}>
          {items.map((it) => {
            const [, mark, rest] = it.match(/^(\S+\))\s+([\s\S]*)$/)!;
            return (
              <li key={it}>
                <span className={styles.no}>{mark}</span>
                {dash(rest)}
              </li>
            );
          })}
        </ul>,
      );
    } else {
      out.push(<Para key={i} text={l} />);
    }
  }
  return <>{out}</>;
}
