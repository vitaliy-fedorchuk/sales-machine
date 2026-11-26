"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Code = { head: string; bodyStart: string; bodyEnd: string };

// Код ставиться один раз за завантаження сторінки (переходи всередині сайту його не повторюють —
// лічильники самі ловлять зміну адреси).
let injected = false;

/** Вставити HTML-фрагмент так, щоб <script> у ньому виконались (innerHTML їх не запускає). */
function inject(html: string, where: "head" | "bodyStart" | "bodyEnd") {
  if (!html.trim()) return;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  for (const old of Array.from(tpl.content.querySelectorAll("script"))) {
    const s = document.createElement("script");
    for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
    // зовнішні скрипти без async — у тому ж порядку, що й у вставленому коді
    if (s.src && !old.hasAttribute("async")) s.async = false;
    s.text = old.text;
    old.replaceWith(s);
  }
  if (where === "head") document.head.append(tpl.content);
  else if (where === "bodyStart") document.body.prepend(tpl.content);
  else document.body.append(tpl.content);
}

/** Код аналітики з адмінки («Код на сайте»). В адмінці не виконується. */
export default function SiteCode({ code }: { code: Code }) {
  const pathname = usePathname();
  useEffect(() => {
    if (injected || pathname.startsWith("/admin")) return;
    injected = true;
    inject(code.head, "head");
    inject(code.bodyStart, "bodyStart");
    inject(code.bodyEnd, "bodyEnd");
  }, [pathname, code]);
  return null;
}
