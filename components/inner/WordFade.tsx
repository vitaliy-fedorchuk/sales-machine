"use client";

import { useEffect } from "react";

/**
 * Велике фонове слово розділу — «луна» заголовка лише на першому екрані:
 * за перші FADE px скролу воно розчиняється (CSS-змінна --fade 1 → 0).
 * При наведенні на «назад» CSS знову показує його повністю.
 */
const FADE = 320;

export default function WordFade({ selector }: { selector: string }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const f = Math.max(0, Math.min(1, 1 - scrollY / FADE));
      el.style.setProperty("--fade", f.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [selector]);
  return null;
}
