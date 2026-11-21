"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Book3D.module.css";

type BackCover =
  | { image: string; alt?: string }                                  // скан справжньої задньої обкладинки
  | { authors: string; title: string; text: string; brand: string }; // або зверстана в CSS

type Props = {
  cover: string;
  alt: string;
  width: number;   // натуральні розміри картинки обкладинки (для пропорцій)
  height: number;
  spine: string;   // текст на корінці
  back: BackCover;
  /** CSS-селектор предка, у межах якого книга стежить за курсором (за замовчуванням — сама зона книги). */
  zone?: string;
  className?: string;
};

const REST_Y = 22;   // ° у спокої — видно корінець
const RANGE_Y = 38;  // ± ° за мишкою: ліворуч корінець, праворуч зріз сторінок
const RANGE_X = 8;   // ± ° нахилу вгору/вниз

/**
 * Книга у 3D: обкладинка, корінець, зріз сторінок, верх/низ і задня обкладинка.
 * У спокої погойдується; у межах зони повертається за курсором; клік — перевертає.
 */
export default function Book3D({ cover, alt, width, height, spine, back, zone, className }: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<(v: boolean) => void>(() => {});
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const area = areaRef.current!;
    const book = bookRef.current!;
    const shadow = shadowRef.current!;
    const zoneEl = (zone && area.closest<HTMLElement>(zone)) || area;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let turn = 0;       // 0 — обкладинкою до нас, 180 — задньою стороною
    let tiltY = REST_Y; // поворот від мишки / спокою
    let tiltX = 4;

    gsap.set(book, { rotationY: REST_Y, rotationX: 4 });
    const ry = gsap.quickTo(book, "rotationY", { duration: reduce ? 0.01 : 0.9, ease: "power3" });
    const rx = gsap.quickTo(book, "rotationX", { duration: reduce ? 0.01 : 0.9, ease: "power3" });
    const sx = gsap.quickTo(shadow, "xPercent", { duration: 0.9, ease: "power3" });
    const apply = () => { ry(turn + tiltY); rx(tiltX); };

    // легке погойдування, поки книгу не чіпають (працює поверх перевороту)
    const sway = { v: 0 };
    const idle = reduce
      ? null
      : gsap.to(sway, {
          v: 1,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          onUpdate: () => {
            tiltY = REST_Y - 12 * sway.v;
            tiltX = 4 - 2 * sway.v;
            apply();
          },
        });

    flipRef.current = (v) => {
      turn = v ? 180 : 0;
      apply();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce) return;
      const r = zoneEl.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) - 0.5;
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) - 0.5;
      idle?.pause();
      tiltY = -px * 2 * RANGE_Y;
      tiltX = -py * 2 * RANGE_X;
      apply();
      sx(px * 30);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tiltY = REST_Y;
      tiltX = 4;
      apply();
      sx(0);
      sway.v = 0;
      idle?.restart();
    };

    zoneEl.addEventListener("pointermove", onMove);
    zoneEl.addEventListener("pointerleave", onLeave);
    return () => {
      idle?.kill();
      zoneEl.removeEventListener("pointermove", onMove);
      zoneEl.removeEventListener("pointerleave", onLeave);
    };
  }, [zone]);

  const toggle = () => {
    const v = !flipped;
    setFlipped(v);
    flipRef.current(v);
  };

  return (
    <div ref={areaRef} className={`${styles.area} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.stage}
        style={{ "--ratio": `${height / width}` } as CSSProperties}
        onClick={toggle}
        aria-pressed={flipped}
        aria-label={flipped ? "Показать обложку книги" : "Показать заднюю обложку книги"}
      >
        <span ref={shadowRef} className={styles.shadow} aria-hidden="true" />
        <span ref={bookRef} className={styles.book}>
          <span className={`${styles.face} ${styles.front}`}>
            <Image src={cover} alt={alt} width={width} height={height} priority className={styles.coverImg} />
            <span className={styles.gloss} aria-hidden="true" />
          </span>

          <span className={`${styles.face} ${styles.back}`}>
            {"image" in back ? (
              <Image src={back.image} alt={back.alt ?? ""} width={width} height={height} className={styles.coverImg} />
            ) : (
              <span className={styles.backDesign}>
                <span className={styles.backAuthors}>{back.authors}</span>
                <span className={styles.backTitle}>{back.title}</span>
                <span className={styles.backRule} />
                <span className={styles.backText}>{back.text}</span>
                <span className={styles.backBrand}>{back.brand}</span>
              </span>
            )}
            <span className={styles.glossBack} aria-hidden="true" />
          </span>

          <span className={`${styles.face} ${styles.spine}`} aria-hidden="true">
            <span>{spine}</span>
          </span>
          <span className={`${styles.face} ${styles.pages}`} aria-hidden="true" />
          <span className={`${styles.face} ${styles.top}`} aria-hidden="true" />
          <span className={`${styles.face} ${styles.bottom}`} aria-hidden="true" />
          {/* торці палітурок: передньої й задньої — справа, зверху, знизу */}
          {(["Front", "Back"] as const).map((side) =>
            (["Right", "Top", "Bottom"] as const).map((edge) => (
              <span
                key={side + edge}
                className={`${styles.face} ${styles.board} ${styles[`board${edge}`]} ${styles[`board${side}`]}`}
                aria-hidden="true"
              />
            )),
          )}
        </span>
      </button>
      <span className={styles.hint} aria-hidden="true">
        {flipped ? "↺ Нажмите, чтобы вернуть" : "↻ Нажмите, чтобы перевернуть"}
      </span>
    </div>
  );
}
