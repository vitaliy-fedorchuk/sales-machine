import { describe, expect, it } from "vitest";
import { SPIRAL } from "./config";
import { centerForItem, computeLayout, nearestCenter, neighborCenter, rowPose } from "./engine";

const items = [{ label: "A" }, { label: "B\nC" }];

describe("computeLayout", () => {
  it("desktop: fs 90, step 125, рядки пункту через lineGap", () => {
    const lay = computeLayout(items, 1440, SPIRAL);
    expect(lay.fs).toBe(90);
    expect(lay.step).toBe(125);
    expect(lay.rows.map((r) => [r.i, r.text, r.off, r.first])).toEqual([
      [0, "A", 0, true],
      [1, "B", 125, true],
      [1, "C", 210.5, false],
    ]);
    expect(lay.L).toBeCloseTo(335.5);
    expect(lay.centers[0]).toBe(45);
    expect(lay.centers[1]).toBeCloseTo(212.75);
  });

  it("mobile 390px: fs ≈ 51, крок масштабується", () => {
    const lay = computeLayout(items, 390, SPIRAL);
    expect(lay.fs).toBeCloseTo(50.7);
    expect(lay.step).toBeCloseTo((125 * 50.7) / 90);
  });
});

describe("nearestCenter / neighborCenter / centerForItem", () => {
  const lay = computeLayout(items, 1440, SPIRAL);
  const fy = 400;

  it("знаходить найближчий центр серед сусідніх циклів", () => {
    // кандидати: -355 (A,c0), -187.25 (B,c0), -19.5 (A,c1), 148.25 (B,c1)
    expect(nearestCenter(0, lay, fy)).toMatchObject({ i: 0, c: 1 });
    expect(nearestCenter(0, lay, fy).pos).toBeCloseTo(-19.5);
    expect(nearestCenter(100, lay, fy).pos).toBeCloseTo(148.25);
  });

  it("працює на від'ємних і дуже великих позиціях (нескінченність)", () => {
    const t = -1e6;
    const c = nearestCenter(t, lay, fy);
    expect(Math.abs(c.pos - t)).toBeLessThanOrEqual(lay.L / 2);
  });

  it("сусідній центр — строго в заданий бік", () => {
    expect(neighborCenter(-19.5, 1, lay, fy).pos).toBeCloseTo(148.25);
    expect(neighborCenter(-19.5, -1, lay, fy).pos).toBeCloseTo(-187.25);
  });

  it("центр конкретного пункту біля t", () => {
    const c = centerForItem(1, 1000, lay, fy);
    expect(c.i).toBe(1);
    expect(Math.abs(c.pos - 1000)).toBeLessThanOrEqual(lay.L / 2);
  });
});

describe("rowPose", () => {
  const step = 125;
  it("у фокусі рівний", () => {
    expect(rowPose(400, 400, step, SPIRAL)).toMatchObject({ a: 0, skew: 0, t: 0, hidden: false });
  });
  it("крок нижче: 21° (twistDir -1), skew пропорційний", () => {
    const p = rowPose(525, 400, step, SPIRAL);
    expect(p.a).toBeCloseTo(21);
    expect(p.skew).toBeCloseTo((21 / 90) * 20);
  });
  it("крок вище — протилежний знак, skew той самий", () => {
    const p = rowPose(275, 400, step, SPIRAL);
    expect(p.a).toBeCloseTo(-21);
    expect(p.skew).toBeCloseTo((21 / 90) * 20);
  });
  it("далеко — обмежено 90° і приховано", () => {
    const p = rowPose(400 + step * 10, 400, step, SPIRAL);
    expect(Math.abs(p.a)).toBe(90);
    expect(p.t).toBe(1);
    expect(p.hidden).toBe(true);
  });
});
