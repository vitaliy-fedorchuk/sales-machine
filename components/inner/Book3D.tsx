"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./Book3D.module.css";

type Props = {
  cover: string;
  alt: string;
  width: number;   // натуральні розміри картинки обкладинки (для пропорцій)
  height: number;
  spine: string;   // текст на корінці
  className?: string;
};

const REST_Y = 22;   // ° у спокої — видно корінець
const RANGE_Y = 42;  // ± ° за мишкою: ліворуч корінець, праворуч зріз сторінок
const RANGE_X = 9;   // ± ° нахилу вгору/вниз

/**
 * Книга у 3D: обкладинка, корінець, зріз сторінок, верх/низ і задня сторона.
 * У спокої повільно погойдується; повертається за курсором будь-де на екрані.
 */
export default function Book3D({ cover, alt, width, height, spine, className }: Props) {
  const areaRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current!;
    const book = bookRef.current!;
    const shadow = shadowRef.current!;
    gsap.set(book, { rotationY: REST_Y, rotationX: 4 });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // легке погойдування, поки книгу не чіпають
    const idle = gsap.to(book, {
      rotationY: REST_Y - 12,
      rotationX: 2,
      duration: 3.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const ry = gsap.quickTo(book, "rotationY", { duration: 0.9, ease: "power3" });
    const rx = gsap.quickTo(book, "rotationX", { duration: 0.9, ease: "power3" });
    const sx = gsap.quickTo(shadow, "xPercent", { duration: 0.9, ease: "power3" });

    // Мишка по всьому екрану: положення курсора відносно центру книги,
    // нормоване на пів ширини/висоти вікна (−1…1).
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = area.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const px = Math.max(-1, Math.min(1, (e.clientX - cx) / (innerWidth / 2)));
      const py = Math.max(-1, Math.min(1, (e.clientY - cy) / (innerHeight / 2)));
      idle.pause();
      ry(-px * RANGE_Y);
      rx(-py * RANGE_X);
      sx(px * 15);
    };
    // курсор пішов з вікна — назад у спокій і погойдування
    const onLeave = () => {
      ry(REST_Y);
      rx(4);
      sx(0);
      gsap.delayedCall(0.9, () => idle.invalidate().restart());
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      idle.kill();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={areaRef} className={`${styles.area} ${className ?? ""}`}>
      <div className={styles.stage} style={{ "--ratio": `${height / width}` } as CSSProperties}>
        <div ref={shadowRef} className={styles.shadow} aria-hidden="true" />
        <div ref={bookRef} className={styles.book}>
          <div className={`${styles.face} ${styles.front}`}>
            <Image src={cover} alt={alt} width={width} height={height} priority className={styles.coverImg} />
            <span className={styles.gloss} aria-hidden="true" />
          </div>
          <div className={`${styles.face} ${styles.back}`} aria-hidden="true" />
          <div className={`${styles.face} ${styles.spine}`} aria-hidden="true">
            <span>{spine}</span>
          </div>
          <div className={`${styles.face} ${styles.pages}`} aria-hidden="true" />
          <div className={`${styles.face} ${styles.top}`} aria-hidden="true" />
          <div className={`${styles.face} ${styles.bottom}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
