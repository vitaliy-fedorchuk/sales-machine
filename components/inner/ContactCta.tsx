"use client";

import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { CONTACTS } from "@/lib/contacts";
import { getLenis } from "./SmoothScroll";
import styles from "./ContactCta.module.css";

const COLS = 8;
const ROWS = 4;

// Зсуви шматків при наведенні — 1:1 з оригіналу (Webflow IX2 «d-86-button-mouse-in»).
// [x %, y % від розміру шматка, z px]. Порядок — по рядках сітки 8×4 зліва направо.
// Ліва половина розходиться вліво, права — вправо; верхні рядки вгору, нижні вниз;
// по глибині частина шматків летить до глядача (+z), частина — вглиб (−z).
const MOVES: [number, number, number][] = [
  [-200, -200, 100], [-200, -200, -200], [-200, -200, -200], [-200, -200, 100],
  [200, -200, -300], [200, -200, -100], [200, -200, -300], [200, -200, -200],
  [-100, -100, -100], [-100, -100, 100], [-100, -100, -200], [-100, -100, 100],
  [100, -100, -200], [100, -100, 100], [100, -100, -300], [100, -100, -200],
  [-100, 100, -300], [-100, 100, 200], [-100, 100, -100], [-100, 100, 100],
  [100, 100, -300], [100, 100, -100], [100, 100, 100], [100, 100, -200],
  [-200, 200, 100], [-200, 200, 100], [-200, 200, -200], [-200, 200, 100],
  [200, 200, -400], [200, 200, -100], [200, 200, -200], [200, 200, 100],
];

const PIECES = MOVES.slice(0, COLS * ROWS).map(
  ([x, y, z]) => ({ "--x": `${x}%`, "--y": `${y}%`, "--z": `${z}px` }) as CSSProperties,
);

/** Кнопка «3D-розліт» (як в оригіналі) і попап «Привет, это Вадим». */
export default function ContactCta({ label, title, text }: { label: string; title: string; text: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const sceneRef = useRef<HTMLSpanElement>(null);
  const { manager } = CONTACTS;

  useEffect(() => {
    const d = dialogRef.current!;
    const onClose = () => getLenis()?.start();
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  // Нахил сітки за курсором — як в оригіналі («d-86-button-mouse-move»):
  // X по кнопці → rotateY від −45° до 45°, Y → rotateX від −10° до 10°, згладжування ~50%,
  // поза кнопкою — повертається в рівне положення.
  useEffect(() => {
    const btn = btnRef.current!;
    const scene = sceneRef.current!;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = {
      rx: gsap.quickTo(scene, "rotationX", { duration: 0.5, ease: "power2" }),
      ry: gsap.quickTo(scene, "rotationY", { duration: 0.5, ease: "power2" }),
    };
    const onMove = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      to.ry(-45 + px * 90);
      to.rx(-10 + py * 20);
    };
    const onLeave = () => { to.rx(0); to.ry(0); };
    btn.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerleave", onLeave);
    return () => {
      btn.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const open = () => {
    getLenis()?.stop();
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button ref={btnRef} type="button" className={styles.cta} onClick={open} aria-haspopup="dialog">
        <span ref={sceneRef} className={styles.scene} aria-hidden="true">
          {PIECES.map((style, k) => (
            <span key={k} className={styles.piece} style={style} />
          ))}
        </span>
        <span className={styles.label}>{label}</span>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="contact-title"
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        <div className={styles.box}>
          <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()} aria-label="Закрыть">
            <span />
            <span />
          </button>
          <Image className={styles.photo} src={manager.photo} alt={manager.name} width={340} height={340} />
          <div className={styles.body}>
            <h3 id="contact-title" className={styles.title}>{title}</h3>
            <p className={styles.text}>{text}</p>
            <div className={styles.actions}>
              <a className={styles.action} href={manager.telegram} target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
              <a className={styles.action} href={manager.whatsapp} target="_blank" rel="noopener noreferrer">Написать в WhatsApp</a>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
