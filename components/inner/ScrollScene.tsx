"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ScrollScene.module.css";

/**
 * Обгортка внутрішньої сторінки. Шукає всередині:
 *  [data-axis-mark="01"] — розділ на осі (номер + точка, точка заповнюється після проходу 45% екрана);
 *  [data-twist]          — заголовок повернутий на петлі зліва й сірий, поки нижче третини екрана;
 *  [data-reveal]         — текст проявляється рядками від сірого до кольору тексту при скролі.
 */
export default function ScrollScene({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const layer = layerRef.current!;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MAX_TWIST = 26;

    // ---------- вісь ----------
    const marks = Array.from(root.querySelectorAll<HTMLElement>("[data-axis-mark]")).map((el) => {
      const num = document.createElement("div");
      num.className = styles.num;
      num.textContent = el.dataset.axisMark ?? "";
      const dot = document.createElement("div");
      dot.className = styles.dot;
      layer.append(num, dot);
      return { el, num, dot, on: false };
    });

    const layout = () => {
      const top0 = root.getBoundingClientRect().top;
      const rs = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
      for (const m of marks) {
        const r = m.el.getBoundingClientRect();
        const y = Math.round(r.top - top0 + Math.min(r.height / 2, 28 * rs));
        m.num.style.top = m.dot.style.top = `${y}px`;
      }
      update();
    };

    // ---------- поворот заголовків + стан точок ----------
    const twists = Array.from(root.querySelectorAll<HTMLElement>("[data-twist]"));
    const update = () => {
      const vh = innerHeight;
      for (const m of marks) {
        const on = m.el.getBoundingClientRect().top < vh * 0.45;
        if (on !== m.on) { m.on = on; m.dot.classList.toggle(styles.dotOn, on); }
      }
      if (reduce) return;
      for (const h of twists) {
        const r = h.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (r.top - vh * 0.33) / (vh * 0.55)));
        if (t < 0.001) { h.style.transform = ""; h.style.color = ""; continue; }
        h.style.transform = `perspective(1100px) rotateY(${(t * MAX_TWIST).toFixed(2)}deg)`;
        h.style.color = `color-mix(in srgb, var(--ink) ${((1 - t) * 100).toFixed(1)}%, var(--grey))`;
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; update(); });
    };

    // ---------- проявлення рядків ----------
    // Усі рядки сторінки — в ОДНІЙ шкалі (timeline), де час = пікселі скролу:
    // рядок фарбується, поки перетинає лінію на REVEAL_LINE висоти екрана (від верху до низу рядка).
    // Рядки в шкалі стоять один за одним, тому згладжування (scrub) уповільнює фарбування,
    // але ніколи не запускає два рядки разом.
    const REVEAL_LINE = "62%";
    const REVEAL_SMOOTH = 1.6; // с, «доганяння» скролу — чим більше, тим повільніше й м'якше
    const linesByEl = new Map<HTMLElement, HTMLElement[]>();
    let revealTl: gsap.core.Timeline | null = null;
    let rebuildRaf = 0;

    const buildReveal = () => {
      rebuildRaf = 0;
      revealTl?.scrollTrigger?.kill();
      revealTl?.kill();
      revealTl = null;
      const top0 = root.getBoundingClientRect().top; // різниця з top0 не залежить від transform сторінки
      const lines = [...linesByEl.values()].flat()
        .map((el) => { const r = el.getBoundingClientRect(); return { el, top: r.top - top0, h: r.height }; })
        .sort((a, b) => a.top - b.top);
      if (!lines.length) return;
      const first = lines[0].top;
      const last = lines[lines.length - 1];
      revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: `top+=${first} ${REVEAL_LINE}`,
          end: `top+=${last.top + last.h} ${REVEAL_LINE}`,
          scrub: REVEAL_SMOOTH,
        },
      });
      lines.forEach((l, i) => {
        const next = lines[i + 1];
        const dur = Math.max(1, Math.min(l.h, next ? next.top - l.top : l.h));
        revealTl!.fromTo(l.el, { backgroundPositionX: "100%" }, { backgroundPositionX: "0%", ease: "none", duration: dur }, l.top - first);
      });
    };
    const scheduleReveal = () => {
      if (!rebuildRaf) rebuildRaf = requestAnimationFrame(buildReveal);
    };

    const splits = reduce
      ? []
      : Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")).map((el) =>
          SplitText.create(el, {
            type: "lines",
            linesClass: styles.line,
            autoSplit: true,
            onSplit(self) {
              linesByEl.set(el, self.lines as HTMLElement[]);
              scheduleReveal();
            },
          }),
        );

    const ro = new ResizeObserver(() => { layout(); if (!reduce) scheduleReveal(); ScrollTrigger.refresh(); });
    ro.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout);
    layout();

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      cancelAnimationFrame(rebuildRaf);
      revealTl?.scrollTrigger?.kill();
      revealTl?.kill();
      splits.forEach((s) => s.revert());
      for (const m of marks) { m.num.remove(); m.dot.remove(); }
      for (const h of twists) { h.style.transform = ""; h.style.color = ""; }
    };
  }, []);

  return (
    <main ref={rootRef} className={`${styles.scene} ${className ?? ""}`} data-page-shift>
      <div ref={layerRef} className={styles.axis} aria-hidden="true">
        <div className={styles.axisLine} />
      </div>
      {children}
    </main>
  );
}
