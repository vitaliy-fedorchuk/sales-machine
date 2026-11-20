// Чиста логіка стрічки — без DOM, покрита тестами (engine.test.ts).
import type { RGB } from "./config";

export type Row = { i: number; text: string; off: number; first: boolean };

export type Layout = {
  fs: number;          // фактичний розмір шрифту, px
  step: number;        // px між пунктами
  rows: Row[];         // рядки одного циклу
  centers: number[];   // центр кожного пункту в координатах циклу
  L: number;           // довжина одного циклу
};

export type LayoutConfig = { fontSize: number; step: number; lineGap: number };

export function computeLayout(items: readonly { label: string }[], vw: number, cfg: LayoutConfig): Layout {
  const fs = Math.min(cfg.fontSize, vw * 0.13);
  const step = Math.max((cfg.step * fs) / cfg.fontSize, fs * 0.9);
  const rows: Row[] = [];
  const centers: number[] = [];
  let acc = 0;
  items.forEach((item, i) => {
    const lines = item.label.split("\n");
    const first = acc;
    lines.forEach((text, l) => {
      rows.push({ i, text, off: acc, first: l === 0 });
      acc += l < lines.length - 1 ? fs * cfg.lineGap : step;
    });
    centers[i] = (first + first + (lines.length - 1) * fs * cfg.lineGap) / 2 + fs / 2;
  });
  return { fs, step, rows, centers, L: acc };
}

export type Center = { pos: number; i: number; c: number };

/** Позиція `cur`, за якої пункт i циклу c стоїть у зоні фокусу. */
export const wantFor = (lay: Layout, c: number, i: number, focusY: number) => c * lay.L + lay.centers[i] - focusY;

/** Найближча до t позиція, де якийсь пункт стоїть у зоні фокусу. */
export function nearestCenter(t: number, lay: Layout, focusY: number): Center {
  let best: Center = { pos: t, i: 0, c: 0 };
  let bestD = Infinity;
  const c0 = Math.floor(t / lay.L);
  for (let c = c0 - 1; c <= c0 + 2; c++) {
    for (let i = 0; i < lay.centers.length; i++) {
      const pos = wantFor(lay, c, i, focusY);
      const d = Math.abs(pos - t);
      if (d < bestD) { bestD = d; best = { pos, i, c }; }
    }
  }
  return best;
}

/** Наступний центр строго за поточним у напрямку sign (±1). */
export function neighborCenter(t: number, sign: number, lay: Layout, focusY: number): Center {
  const base = nearestCenter(t, lay, focusY);
  let best = base;
  let bestD = Infinity;
  const c0 = Math.floor(base.pos / lay.L);
  for (let c = c0 - 1; c <= c0 + 2; c++) {
    for (let i = 0; i < lay.centers.length; i++) {
      const pos = wantFor(lay, c, i, focusY);
      const d = (pos - base.pos) * sign;
      if (d > 1 && d < bestD) { bestD = d; best = { pos, i, c }; }
    }
  }
  return best;
}

/** Найближча до t позиція, де саме пункт i стоїть у фокусі. */
export function centerForItem(i: number, t: number, lay: Layout, focusY: number): Center {
  const c0 = Math.round((t + focusY - lay.centers[i]) / lay.L);
  let best: Center = { pos: wantFor(lay, c0, i, focusY), i, c: c0 };
  for (const c of [c0 - 1, c0 + 1]) {
    const pos = wantFor(lay, c, i, focusY);
    if (Math.abs(pos - t) < Math.abs(best.pos - t)) best = { pos, i, c };
  }
  return best;
}

export type PoseConfig = { twist: number; twistDir: number; maxAngle: number; skew: number };

/** Кут, нахил і «глибина» t (0 рівний … 1 ребром) рядка з центром `center` на екрані. */
export function rowPose(center: number, focusY: number, step: number, cfg: PoseConfig, h = 0, unwind = 0) {
  const d = (center - focusY) / step;
  let a = clamp(-d * cfg.twist, -cfg.maxAngle, cfg.maxAngle) * cfg.twistDir;
  if (h) a *= 1 - h * unwind;
  const abs = Math.abs(a);
  return {
    a: a === 0 ? 0 : a, // без -0
    skew: (abs / 90) * cfg.skew,
    t: Math.min(1, abs / Math.max(1, cfg.maxAngle)),
    hidden: abs >= 89.6,
  };
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const rgb = (c: RGB) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

/** Коефіцієнт lerp «за кадр 60 fps», перерахований під фактичний dt (120 Гц = той самий рух). */
export const frameLerp = (k: number, dtMs: number) => 1 - Math.pow(1 - k, dtMs / (1000 / 60));
