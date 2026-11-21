"use client";

/*
 * 404 — міні-гра «рогатка» (за мотивами Osmo 404 Minigame, переписана під React і монохром сайту).
 * Тягни ручку внизу → відпусти → ракета летить з інерцією й збиває цілі:
 * логотип, посилання меню, цифри «404», підпис і мух. Збив усе — екран з часом і «Ещё раз».
 */

import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./NotFoundGame.module.css";

const LINKS = [
  { href: "/pr", label: "PR" },
  { href: "/kniga", label: "Книга" },
  { href: "/keysy", label: "Кейсы" },
  { href: "/otzyvy", label: "Отзывы" },
];

const CONFIG = {
  dragToVelocityRatio: 0.01,
  inertiaResistance: 20,
  pullReset: { duration: 0.8, ease: "elastic.out(1,0.5)" },
  rocketFadeOut: 0.5,
  maxSpeed: 2000,
  flyMinDuration: 1.5,
  flyMaxDuration: 3,
  flyRotateDuration: 1,
};

type Status = "ready" | "running" | "finished";

export default function NotFoundGame() {
  const rootRef = useRef<HTMLElement>(null);
  const pullRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState<Status>("ready");
  const [time, setTime] = useState("0.00");
  const [score, setScore] = useState({ hit: 0, total: 0 });

  useEffect(() => {
    gsap.registerPlugin(Draggable, InertiaPlugin, Physics2DPlugin);
    const root = rootRef.current!;
    const pull = pullRef.current!;
    const rocket = rocketRef.current!;
    const line = lineRef.current!;
    const flies = Array.from(root.querySelectorAll<HTMLElement>("[data-fly]"));

    const targets = () =>
      Array.from(root.querySelectorAll<HTMLElement>("[data-target]")).filter((el) => getComputedStyle(el).display !== "none");
    let all = targets();
    const hit = new Set<HTMLElement>();
    const flyTweens = new Map<HTMLElement, gsap.core.Tween>();
    let rocketTween: gsap.core.Tween | null = null;
    let flying = false;
    let startTime = 0;
    let rect = root.getBoundingClientRect();
    let origin = { x: 0, y: 0 };
    let dragStart = { x: 0, y: 0 };
    let draggedEnough = false;

    // ---------- конфеті ----------
    const confetti = (x: number, y: number) => {
      const n = gsap.utils.random(10, 20, 1);
      for (let i = 0; i < n; i++) {
        const dot = document.createElement("div");
        dot.className = styles.dot;
        dot.style.background = gsap.utils.random(["var(--ink)", "var(--grey)", "var(--mute)"]);
        root.appendChild(dot);
        gsap.set(dot, { left: x, top: y, scale: 0 });
        gsap
          .timeline({ onComplete: () => dot.remove() })
          .to(dot, { scale: gsap.utils.random(0.3, 1), duration: 0.3, ease: "power3.out" })
          .to(
            dot,
            {
              duration: 2,
              physics2D: { velocity: gsap.utils.random(500, 1000), angle: gsap.utils.random(0, 360), gravity: 500 },
              autoAlpha: 0,
              ease: "none",
            },
            "<",
          );
      }
    };

    // ---------- мухи ----------
    const moveFly = (fly: HTMLElement) => {
      const maxX = rect.width - fly.offsetWidth;
      const maxY = rect.height - fly.offsetHeight;
      const nx = gsap.utils.random(0, maxX);
      const ny = gsap.utils.random(0, maxY);
      const cur = fly.getBoundingClientRect();
      const angle = (Math.atan2(ny - (cur.top - rect.top), nx - (cur.left - rect.left)) * 180) / Math.PI + 90;
      gsap.to(fly, { rotation: angle, duration: CONFIG.flyRotateDuration, ease: "elastic.out(1,0.75)" });
      flyTweens.set(
        fly,
        gsap.to(fly, {
          left: nx,
          top: ny,
          duration: gsap.utils.random(CONFIG.flyMinDuration, CONFIG.flyMaxDuration),
          ease: "power1.inOut",
          onComplete: () => moveFly(fly),
        }),
      );
    };

    const reset = () => {
      hit.clear();
      all = targets();
      all.forEach((el) => gsap.set(el, { clearProps: "opacity,scale,pointerEvents" }));
      startTime = 0;
      setStatus("ready");
      setTime("0.00");
      setScore({ hit: 0, total: all.length });
      rocketTween?.kill();
      flying = false;
      gsap.set([pull, rocket, line], { clearProps: "all" });
      gsap.set(rocket, { opacity: 0 });
      rect = root.getBoundingClientRect();
      flies.forEach((fly) => {
        flyTweens.get(fly)?.kill();
        gsap.set(fly, {
          left: gsap.utils.random(0, rect.width - fly.offsetWidth),
          top: gsap.utils.random(0, rect.height - fly.offsetHeight),
          rotation: 0,
        });
        moveFly(fly);
      });
    };
    resetRef.current = reset;
    reset();

    const overlap = (a: DOMRect, b: DOMRect) => !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);

    const explode = (el: HTMLElement, r: DOMRect) => {
      gsap.to(el, { scale: 0.95, opacity: 0.1, duration: 0.2, pointerEvents: "none" });
      confetti(r.left + r.width / 2 - rect.left, r.top + r.height / 2 - rect.top);
    };

    const onRocketUpdate = () => {
      const r = rocket.getBoundingClientRect();
      if (r.right < rect.left || r.left > rect.right || r.bottom < rect.top || r.top > rect.bottom) {
        rocketTween?.kill();
        flying = false;
        gsap.set(rocket, { opacity: 0 });
        return;
      }
      for (const t of all) {
        if (hit.has(t)) continue;
        const tr = t.getBoundingClientRect();
        if (overlap(r, tr)) {
          hit.add(t);
          flyTweens.get(t)?.kill();
          explode(t, tr);
          setScore({ hit: hit.size, total: all.length });
          if (hit.size === all.length) {
            setTime(((Date.now() - startTime) / 1000).toFixed(2));
            setStatus("finished");
          }
          break;
        }
      }
    };

    // ---------- рогатка ----------
    const [drag] = Draggable.create(pull, {
      type: "x,y",
      bounds: root,
      onPress() {
        if (flying) return this.endDrag();
        if (!startTime) {
          startTime = Date.now();
          setStatus("running");
        }
        rocketTween?.kill();
        gsap.set(rocket, { clearProps: "all", opacity: 0 });
        rect = root.getBoundingClientRect();
        draggedEnough = false;
        const rb = rocket.getBoundingClientRect();
        origin = { x: rb.left + rb.width / 2 - rect.left, y: rb.top + rb.height / 2 - rect.top };
        Object.assign(line.style, { left: `${origin.x}px`, top: `${origin.y}px`, width: "0px", transform: "rotate(0deg)", opacity: "0" });
        const pr = pull.getBoundingClientRect();
        dragStart = { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2 };
        pull.classList.add(styles.pulling);
      },
      onDrag() {
        const pr = pull.getBoundingClientRect();
        const dx = pr.left + pr.width / 2 - rect.left - origin.x;
        const dy = pr.top + pr.height / 2 - rect.top - origin.y;
        const len = Math.hypot(dx, dy);
        if (len >= 24) draggedEnough = true;
        const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
        Object.assign(line.style, { width: `${len}px`, transform: `rotate(${ang}deg)`, opacity: "1" });
        gsap.set(pull, { rotation: ang - 90 });
      },
      onRelease() {
        pull.classList.remove(styles.pulling);
        gsap.to(line, { opacity: 0, duration: 0.2 });
        if (!draggedEnough || flying) {
          gsap.to(pull, { x: 0, y: 0, rotation: 0, ...CONFIG.pullReset });
          return;
        }
        const pr = pull.getBoundingClientRect();
        const avg = (rect.width + rect.height) / 2;
        const k = CONFIG.dragToVelocityRatio * avg;
        let vx = (dragStart.x - (pr.left + pr.width / 2)) * k;
        let vy = (dragStart.y - (pr.top + pr.height / 2)) * k;
        const speed = Math.hypot(vx, vy);
        if (speed > CONFIG.maxSpeed) {
          vx *= CONFIG.maxSpeed / speed;
          vy *= CONFIG.maxSpeed / speed;
        }
        gsap.set(rocket, { rotation: (Math.atan2(vy, vx) * 180) / Math.PI + 90, x: 0, y: 0, opacity: 1 });
        gsap.to(pull, { x: 0, y: 0, rotation: 0, ...CONFIG.pullReset });
        flying = true;
        rocketTween = gsap.to(rocket, {
          inertia: { x: { velocity: vx }, y: { velocity: vy }, resistance: CONFIG.inertiaResistance },
          onUpdate: onRocketUpdate,
          onComplete: () => {
            flying = false;
            gsap.to(rocket, { opacity: 0, duration: CONFIG.rocketFadeOut });
          },
        });
      },
    });

    const onResize = () => { rect = root.getBoundingClientRect(); };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      drag.kill();
      rocketTween?.kill();
      flyTweens.forEach((t) => t.kill());
      gsap.killTweensOf(flies);
      root.querySelectorAll(`.${styles.dot}`).forEach((d) => d.remove());
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.game} data-status={status}>
      <header className={styles.nav}>
        <Link href="/" className={styles.logo} data-target>
          Sales Machine
        </Link>
        <nav className={styles.links} aria-label="Разделы" data-target>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={styles.link}>
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className={styles.center}>
        <p className={styles.eyebrow} data-target>
          Страница не найдена
        </p>
        <h1 className={styles.h1} aria-label="Ошибка 404 — страница не найдена">
          <span data-target aria-hidden="true">4</span>
          <span data-target aria-hidden="true">0</span>
          <span data-target aria-hidden="true">4</span>
        </h1>
      </div>

      <div ref={lineRef} className={styles.line} aria-hidden="true" />

      <div className={styles.controls}>
        <div ref={pullRef} className={styles.pull} aria-hidden="true">
          <span className={styles.knob}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M12 2v20M2 12h20" />
            </svg>
          </span>
          <span className={styles.pullText}>Потяни</span>
        </div>
        <div ref={rocketRef} className={styles.rocket} aria-hidden="true">
          <svg viewBox="0 0 40 72" width="100%">
            <path className={styles.fill} d="M20 2c8 6 12 16 12 28v20H8V30C8 18 12 8 20 2Z" />
            <path className={styles.stroke} d="M20 2c8 6 12 16 12 28v20H8V30C8 18 12 8 20 2Z" />
            <circle className={styles.stroke} cx="20" cy="26" r="5" />
            <path className={styles.ink} d="M8 38 1 50v6l7-4ZM32 38l7 12v6l-7-4Z" />
            <path className={styles.ink} d="M13 52h14l-3 8h-8Z" />
            <path className={styles.flame} d="M16 62h8l-4 9Z" />
          </svg>
        </div>
      </div>

      {[0, 1].map((i) => (
        <div key={i} className={styles.fly} data-fly data-target aria-hidden="true">
          <svg viewBox="0 0 40 40" width="100%">
            <ellipse className={styles.wing} cx="12" cy="15" rx="9" ry="6" transform="rotate(-30 12 15)" />
            <ellipse className={styles.wing} cx="28" cy="15" rx="9" ry="6" transform="rotate(30 28 15)" />
            <ellipse className={styles.ink} cx="20" cy="24" rx="7" ry="10" />
            <circle className={styles.ink} cx="20" cy="12" r="5" />
          </svg>
        </div>
      ))}

      <p className={styles.counter} aria-live="polite">
        {status === "ready" ? "Потяни ручку и запусти ракету" : `Цели: ${score.hit} / ${score.total}`}
      </p>

      <div className={styles.score} role="dialog" aria-hidden={status !== "finished"} aria-label="Результат">
        <div className={styles.scoreBox}>
          <span className={styles.scoreNum}>404 / 404</span>
          <h2 className={styles.scoreTitle}>Все цели поражены!</h2>
          <p className={styles.scoreText}>
            Это заняло <b>{time}</b> сек.
          </p>
          <div className={styles.scoreActions}>
            <button type="button" className={styles.btn} onClick={() => resetRef.current()}>
              Ещё раз
            </button>
            <Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>
              В меню
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
