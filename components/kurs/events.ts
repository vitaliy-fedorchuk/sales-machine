"use client";

import { getLenis } from "@/components/inner/SmoothScroll";
import type { Speaker } from "@/lib/pages/kurs";
import type { Review } from "@/lib/pages/otzyvy";

export type KursForm = "signup" | "module" | "installment" | "personal";

export type KursDialog =
  | { kind: "form"; form: KursForm; topic: string }
  | { kind: "bio"; speaker: Speaker }
  | { kind: "video"; review: Review };

const EVENT = "sm:kurs-dialog";

/** Відкрити попап сторінки курсу (форма / біо спікера / відео) з будь-якої кнопки. */
export const openKurs = (detail: KursDialog) => window.dispatchEvent(new CustomEvent(EVENT, { detail }));

export const onKurs = (fn: (d: KursDialog) => void) => {
  const h = (e: Event) => fn((e as CustomEvent<KursDialog>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
};

/** Висота зони під фіксованою навігацією — щоб заголовок розділу не ховався під нею. */
const OFFSET_REM = 6;

/** Плавно прокрутити до розділу (через Lenis, якщо він є). */
export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const rs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -OFFSET_REM * rs, duration: 1.4 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - OFFSET_REM * rs, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
};
