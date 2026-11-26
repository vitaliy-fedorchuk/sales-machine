// Погоджені значення («Мій пресет» з task/1/spiral-prototype.html).
export const SPIRAL = {
  smooth: 0.02,      // lerp-коефіцієнт згладжування скролу за кадр (60 fps)
  wheelSens: 0.9,    // множник deltaY колеса
  inertia: 14,       // множник швидкості після відпускання свайпу/перетягування
  snap: true,        // доводка найближчого пункту в зону фокусу після зупинки
  snapDelay: 160,    // мс простою перед доводкою
  dir: 1,            // 1 = колесо вниз → стрічка їде вгору (як на старому сайті); -1 = навпаки
  twist: 21,         // ° повороту на кожен «крок» від зони фокусу
  twistDir: -1,      // знак закруту
  maxAngle: 90,      // ° межа повороту; на ±90 рядок ребром і прихований
  skew: 20,          // ° skewY при |кут| = 90
  focus: 0.4,        // зона фокусу, частка висоти viewport
  fontSize: 90,      // px на desktop; на вузьких: min(90, 13vw)
  step: 125,         // px між пунктами при fontSize 90
  lineGap: 0.95,     // відстань між рядками одного пункту, × fontSize
  left: 0.09,        // відступ стрічки зліва, частка ширини
  weight: 500,
  tone: true,        // колір рядка від ink (0°) до grey (maxAngle)
  blur: true,        // blur(0…2.2px) пропорційно куту
  hover: { dim: 0.62, unwind: 0, ease: 0.06 }, // dim — наскільки гаснуть інші пункти при наведенні
  theme: { ease: 0.07 },
} as const;

export type RGB = readonly [number, number, number];

export const PALETTE: Record<"light" | "dark", { ink: RGB; grey: RGB; back: RGB }> = {
  light: { ink: [24, 24, 25], grey: [200, 200, 202], back: [222, 222, 224] },
  dark: { ink: [242, 242, 242], grey: [82, 82, 85], back: [52, 52, 55] },
};
