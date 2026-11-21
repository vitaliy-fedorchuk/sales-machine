"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { transitionTo } from "@/components/transition/PageTransition";
import type { Direction } from "@/lib/directions";
import { PALETTE, SPIRAL } from "./config";
import {
  centerForItem,
  computeLayout,
  frameLerp,
  mixRgb,
  nearestCenter,
  neighborCenter,
  rgb,
  rowPose,
  type Layout,
} from "./engine";
import styles from "./Spiral.module.css";

type Props = { items: readonly Direction[] };

const pad = (n: number) => String(n).padStart(2, "0");

export default function Spiral({ items }: Props) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const numsRef = useRef<HTMLDivElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const infoNumRef = useRef<HTMLSpanElement>(null);
  const infoSubRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    const track = trackRef.current!;
    const nums = numsRef.current!;
    const axis = axisRef.current!;
    const info = infoRef.current!;
    const infoNum = infoNumRef.current!;
    const infoSub = infoSubRef.current!;
    const nav = navRef.current!;
    const root = document.documentElement;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cfg = {
      ...SPIRAL,
      twist: reduce ? 0 : SPIRAL.twist,
      blur: reduce ? false : SPIRAL.blur,
      smooth: reduce ? 0.2 : SPIRAL.smooth,
    };
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

    // ---------- розкладка ----------
    let vw = innerWidth;
    let vh = innerHeight;
    let fy = vh * cfg.focus;
    let left = vw * cfg.left;
    // Ширина найширшого рядка при font-size 100px — щоб на вузьких екранах зменшити шрифт,
    // і довгі слова («О нас. Контакты») не вилазили за край.
    const probe = document.createElement("div");
    probe.className = styles.row;
    probe.style.cssText = "font-size:100px;visibility:hidden;transform:none;filter:none";
    track.appendChild(probe);
    let widest = 0;
    const measureWidest = () => {
      widest = 0;
      for (const it of items) {
        for (const line of it.label.split("\n")) {
          probe.textContent = line;
          widest = Math.max(widest, probe.getBoundingClientRect().width);
        }
      }
    };
    measureWidest();
    const fitFs = () => (widest > 0 ? ((vw - vw * cfg.left - 16) / widest) * 100 : Infinity);

    let lay: Layout = computeLayout(items, vw, cfg, fitFs());

    let cur = 0;
    let target = 0;
    let lastInput = 0;
    let snapped = true;
    let dragging = false;

    function measure() {
      const prev = lay;
      const prevFy = fy;
      vw = innerWidth;
      vh = innerHeight;
      fy = vh * cfg.focus;
      left = vw * cfg.left;
      lay = computeLayout(items, vw, cfg, fitFs());
      // Зберегти положення стрічки: та сама частка циклу, потім доводка.
      const k = lay.L / prev.L;
      cur = (cur + prevFy) * k - fy;
      target = (target + prevFy) * k - fy;
      snapped = false;
      lastInput = performance.now();

      stage.style.setProperty("--fs", `${lay.fs}px`);
      axis.style.transform = `translate3d(${left}px,0,0)`;
      // Інфоблок: на desktop — праворуч від зони фокусу; на телефоні — внизу екрана,
      // на градієнті фону, щоб не перекривав рядки біля фокусу.
      const small = vw < 640;
      info.classList.toggle(styles.infoBottom, small);
      if (small) {
        info.style.transform = "";
        info.style.setProperty("--info-left", `${left}px`);
      } else {
        const ix = Math.min(Math.max(left + lay.fs * 4.2, vw * 0.55), vw - 320);
        info.style.transform = `translate3d(${ix}px,${fy - 14}px,0)`;
      }
    }

    measure();
    cur = target = centerForItem(0, 0, lay, fy).pos;
    snapped = true;
    info.style.visibility = "visible";
    // після підвантаження шрифту ширини рядків інші — переміряти
    document.fonts?.ready.then(() => { measureWidest(); measure(); });

    const touched = () => {
      lastInput = performance.now();
      snapped = false;
    };

    // ---------- ввід: колесо ----------
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom тачпада
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= vh;
      target += dy * cfg.wheelSens * cfg.dir;
      touched();
    };

    // ---------- ввід: тач / перетягування ----------
    let lastY = 0;
    let downX = 0;
    let downY = 0;
    let lastMoveT = 0;
    let vel = 0;
    let moved = 0;
    let mouseX = -1;
    let mouseY = -1;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      stage.classList.add(styles.dragging);
      lastY = downY = e.clientY;
      downX = e.clientX;
      lastMoveT = performance.now();
      vel = 0;
      moved = 0;
      try { stage.setPointerCapture(e.pointerId); } catch {}
      touched();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") { mouseX = e.clientX; mouseY = e.clientY; }
      if (!dragging) return;
      const now = performance.now();
      const dy = lastY - e.clientY;
      moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      const dt = Math.max(1, now - lastMoveT);
      vel = vel * 0.6 + (dy / dt) * 16 * 0.4; // px за кадр
      lastY = e.clientY;
      lastMoveT = now;
      target += dy * cfg.dir;
      touched();
    };

    const itemAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y);
      const w = el instanceof HTMLElement ? el.closest<HTMLElement>("[data-item-key]") : null;
      return w ? Number(w.dataset.i) : -1;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove(styles.dragging);
      if (moved < 6) {
        const i = itemAt(e.clientX, e.clientY);
        if (i >= 0 && !transitionTo(items[i].href)) router.push(items[i].href);
        return;
      }
      if (performance.now() - lastMoveT < 80) target += vel * cfg.inertia * cfg.dir;
      touched();
    };

    const onPointerCancel = () => {
      dragging = false;
      stage.classList.remove(styles.dragging);
      touched();
    };

    const onMouseLeave = () => { mouseX = mouseY = -1; };

    // ---------- ввід: клавіатура ----------
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      let n = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") n = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") n = -1;
      else if (e.key === " ") {
        if (t && (t.tagName === "BUTTON" || t.tagName === "A")) return; // Space активує кнопку
        n = e.shiftKey ? -1 : 1;
      }
      if (!n) return;
      e.preventDefault();
      target = neighborCenter(target, n * cfg.dir, lay, fy).pos;
      lastInput = performance.now();
      snapped = true;
    };

    // ---------- фокус з клавіатури на посиланні в <nav> ----------
    let focusKey: string | null = null;
    const onNavFocus = (e: FocusEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      if (!a) return;
      const c = centerForItem(Number(a.dataset.i), target, lay, fy);
      target = c.pos;
      focusKey = `${c.c}_${c.i}`;
      lastInput = performance.now();
      snapped = true;
    };
    const onNavBlur = () => { focusKey = null; };

    const onResize = () => measure();

    // ---------- рендер ----------
    type Node = { el: HTMLDivElement; key: string; shown: boolean; vis: boolean };
    const pool: Node[] = [];
    const numPool: Node[] = [];

    const getRow = (idx: number) => {
      let n = pool[idx];
      if (!n) {
        const el = document.createElement("div");
        el.className = styles.row;
        track.appendChild(el);
        n = pool[idx] = { el, key: "", shown: true, vis: true };
      }
      return n;
    };
    const getNum = (idx: number) => {
      let n = numPool[idx];
      if (!n) {
        const el = document.createElement("div");
        el.className = styles.num;
        nums.appendChild(el);
        n = numPool[idx] = { el, key: "", shown: true, vis: true };
      }
      return n;
    };
    const show = (n: Node, on: boolean) => {
      if (n.shown !== on) { n.shown = on; n.el.style.display = on ? "" : "none"; }
    };

    const hl = new Map<string, number>();
    let dimMix = 0;
    let themeMix = root.dataset.theme === "dark" ? 1 : 0;
    let activeIdx = 0;
    let lastT = 0;
    let raf = 0;

    const infoParts = [info.children[0] as HTMLElement, info.children[1] as HTMLElement];
    const swapInfo = (i: number) => {
      infoNum.textContent = `${pad(i + 1)} / ${pad(items.length)}`;
      infoSub.textContent = items[i].sub;
      if (reduce) return;
      for (const el of infoParts) {
        el.animate(
          [
            { opacity: 0, transform: "translateY(14px) rotateX(-40deg)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 550, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
      }
    };

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = lastT ? Math.min(100, now - lastT) : 1000 / 60;
      lastT = now;

      // доводка після простою
      if (cfg.snap && !snapped && !dragging && performance.now() - lastInput > cfg.snapDelay) {
        target = nearestCenter(target, lay, fy).pos;
        snapped = true;
      }
      cur += (target - cur) * frameLerp(cfg.smooth, dt);
      if (Math.abs(target - cur) < 0.01) cur = target;

      // тема: кольори стрічки плавно йдуть разом із фоном
      const themeTarget = root.dataset.theme === "dark" ? 1 : 0;
      themeMix += (themeTarget - themeMix) * frameLerp(cfg.theme.ease, dt);
      if (Math.abs(themeTarget - themeMix) < 0.001) themeMix = themeTarget;
      const ink = mixRgb(PALETTE.light.ink, PALETTE.dark.ink, themeMix);
      const grey = mixRgb(PALETTE.light.grey, PALETTE.dark.grey, themeMix);
      const back = mixRgb(PALETTE.light.back, PALETTE.dark.back, themeMix);

      // hover (читання DOM — до записів у цьому кадрі)
      let hoverKey: string | null = focusKey;
      if (!hoverKey && finePointer.matches && !dragging && mouseX >= 0) {
        const el = document.elementFromPoint(mouseX, mouseY);
        const w = el instanceof HTMLElement ? el.closest<HTMLElement>("[data-item-key]") : null;
        hoverKey = w ? w.dataset.itemKey! : null;
      }
      const ease = frameLerp(cfg.hover.ease, dt);
      if (hoverKey && !hl.has(hoverKey)) hl.set(hoverKey, 0);
      for (const [k, v] of hl) {
        const nv = v + ((k === hoverKey ? 1 : 0) - v) * ease;
        if (k !== hoverKey && nv < 0.002) hl.delete(k);
        else hl.set(k, nv);
      }
      dimMix += ((hoverKey ? 1 : 0) - dimMix) * frameLerp(cfg.hover.ease * 0.8, dt);

      const { fs, L, rows, centers } = lay;
      const m = fs * 2.5;
      const c0 = Math.floor((cur - m) / L);
      const c1 = Math.floor((cur + vh + m) / L);
      const dim = cfg.hover.dim * dimMix;

      let n = 0;
      let nn = 0;
      let bestD = Infinity;
      let bestI = 0;

      for (let c = c0; c <= c1; c++) {
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          const y = c * L + row.off - cur;
          if (y < -m || y > vh + m) continue;
          const center = y + fs / 2;
          const itemKey = `${c}_${row.i}`;
          const h = hl.get(itemKey) ?? 0;
          const p = rowPose(center, fy, lay.step, cfg, h, cfg.hover.unwind);

          const node = getRow(n++);
          const key = `${c}_${r}`;
          if (node.key !== key) {
            node.key = key;
            node.el.textContent = row.text;
            node.el.dataset.itemKey = itemKey;
            node.el.dataset.i = String(row.i);
          }
          show(node, true);
          if (node.vis === p.hidden) {
            node.vis = !p.hidden;
            node.el.style.visibility = p.hidden ? "hidden" : "visible";
          }
          node.el.style.transform =
            `translate3d(${left}px,${y.toFixed(2)}px,0) rotateY(${p.a.toFixed(3)}deg) skewY(${p.skew.toFixed(3)}deg)`;

          let col = cfg.tone ? mixRgb(ink, grey, p.t) : ink;
          let blur = cfg.blur && p.t > 0.05 ? p.t * 2.2 : 0;
          col = mixRgb(col, back, dim * (1 - h));
          if (h) {
            col = mixRgb(col, ink, h);
            blur *= 1 - h;
          }
          node.el.style.color = rgb(col);
          node.el.style.filter = blur > 0.02 ? `blur(${blur.toFixed(2)}px)` : "none";

          if (row.first) {
            const num = getNum(nn++);
            const label = pad(row.i + 1);
            if (num.key !== label) { num.key = label; num.el.textContent = label; }
            show(num, true);
            num.el.style.transform = `translate3d(${left - 34}px,${(center - 6).toFixed(2)}px,0)`;
            let op = 1 - Math.min(1, Math.abs(p.a) / 90) * 0.85;
            op *= 1 - 0.6 * dim * (1 - h);
            op += (1 - op) * h;
            num.el.style.opacity = op.toFixed(3);

            const ad = Math.abs(c * L + centers[row.i] - cur - fy);
            if (ad < bestD) { bestD = ad; bestI = row.i; }
          }
        }
      }
      for (let j = n; j < pool.length; j++) show(pool[j], false);
      for (let j = nn; j < numPool.length; j++) show(numPool[j], false);

      // інфоблок іде за наведеним пунктом
      if (hoverKey) bestI = Number(hoverKey.slice(hoverKey.indexOf("_") + 1));
      if (bestI !== activeIdx) {
        activeIdx = bestI;
        swapInfo(bestI);
      }
    }

    const start = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove);
    root.addEventListener("mouseleave", onMouseLeave);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerCancel);
    nav.addEventListener("focusin", onNavFocus);
    nav.addEventListener("focusout", onNavBlur);
    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) start();

    return () => {
      stop();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("mouseleave", onMouseLeave);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
      nav.removeEventListener("focusin", onNavFocus);
      nav.removeEventListener("focusout", onNavBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      track.replaceChildren();
      nums.replaceChildren();
    };
  }, [items, router]);

  return (
    <>
      <nav ref={navRef} aria-label="Направления" className="sr-only">
        <ul>
          {items.map((it, i) => (
            <li key={it.href}>
              <Link href={it.href} data-i={i}>
                {it.label.replace("\n", " ")}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div ref={stageRef} className={styles.stage} aria-hidden="true" data-page-shift>
        <div ref={axisRef} className={styles.axis} />
        <div ref={numsRef} className={styles.nums} />
        <div ref={trackRef} className={styles.track} />
        <div ref={infoRef} className={styles.info}>
          <div className={styles.cnt}>
            <span ref={infoNumRef}>{`01 / ${pad(items.length)}`}</span>
            <i />
          </div>
          <div ref={infoSubRef} className={styles.sub}>
            {items[0]?.sub}
          </div>
        </div>
      </div>
    </>
  );
}
