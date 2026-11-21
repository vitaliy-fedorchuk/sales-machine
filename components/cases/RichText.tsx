import { Fragment, type ReactNode } from "react";
import type { RichText as RT } from "@/lib/cases/types";
import { outHref } from "@/lib/outlinks";

// **жирний**, *курсив*, [текст](url)
const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1] !== undefined) out.push(<strong key={k}>{inline(m[1], k)}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k}>{inline(m[2], k)}</em>);
    else {
      const href = m[4];
      const external = /^https?:/.test(href);
      out.push(
        <a key={k} href={outHref(href)} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {m[3]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Абзаци тексту кейсу: порожній рядок — новий абзац, перенос — <br>. */
export default function RichText({ text, className, reveal }: { text: RT; className?: string; reveal?: boolean }) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => (
      <p key={i} className={className} data-reveal={reveal || undefined}>
        {p.split("\n").map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {inline(line, `${i}-${j}`)}
          </Fragment>
        ))}
      </p>
    ));
}
