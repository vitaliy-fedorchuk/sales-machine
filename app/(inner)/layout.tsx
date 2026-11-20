import type { ReactNode } from "react";
import SmoothScroll from "@/components/inner/SmoothScroll";

// Спільне для внутрішніх сторінок: плавний скрол (Lenis + GSAP).
export default function InnerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}
