"use client";

import { useEffect } from "react";

/**
 * Велике фонове слово розділу — «луна» заголовка лише на першому екрані:
 * за перші FADE_REM скролу (~120px на 1920) воно розчиняється (CSS-змінна --fade 1 → 0),
 * з прискоренням — щоб не накладалось на контент, який під'їжджає вгору.
 * При наведенні на «назад» CSS знову показує його повністю.
 */
const FADE_REM = 7.5;

export default function WordFade({ selector }: { selector: string }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const t = Math.max(0, Math.min(1, 1 - scrollY / (FADE_REM * rem)));
      const f = t * t;
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
