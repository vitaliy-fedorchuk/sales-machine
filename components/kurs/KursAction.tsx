"use client";

import type { ReactNode } from "react";
import { openKurs, scrollToSection, type KursDialog } from "./events";

/** Кнопка, що відкриває попап сторінки курсу (серверні секції не можуть передати onClick). */
export function KursButton({ dialog, className, children, label }: { dialog: KursDialog; className?: string; children: ReactNode; label?: string }) {
  return (
    <button type="button" className={className} onClick={() => openKurs(dialog)} aria-haspopup="dialog" aria-label={label}>
      {children}
    </button>
  );
}

/** Посилання на розділ сторінки: без JS — звичайний якір, з JS — плавний скрол Lenis з відступом під навігацію. */
export function SectionLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(to);
      }}
    >
      {children}
    </a>
  );
}
