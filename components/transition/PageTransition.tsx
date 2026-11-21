"use client";

/*
 * Перехід «панель з назвою сторінки» (порт Osmo page-name wipe на Next.js App Router замість Barba).
 *
 * Leave: панель виїжджає знизу й накриває екран (0.8 с), з'являється «[ Назва ]»,
 *        поточна сторінка ([data-page-shift]) їде вгору на 15vh. Після накриття — router.push.
 * Enter: з 1.25 с від кліку (і коли нова сторінка вже відрендерилась) панель іде далі вгору (1 с),
 *        нова сторінка піднімається з +15vh.
 * Назад/вперед у браузері та prefers-reduced-motion — без анімації.
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { getLenis } from "@/components/inner/SmoothScroll";
import { pageName } from "@/lib/pageNames";
import styles from "./PageTransition.module.css";

const ENTER_AT = 1250; // мс від кліку до початку відкриття (час прочитати назву)
const TIMEOUT = 7000;  // запобіжник, якщо нова сторінка так і не прийшла

let go: ((href: string) => boolean) | null = null;
/** Перейти з анімацією з коду (не з <a>). false — якщо перехід недоступний, тоді викликайте router.push самі. */
export const transitionTo = (href: string) => (go ? go(href) : false);

const shiftEls = () => Array.from(document.querySelectorAll<HTMLElement>("[data-page-shift]"));

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const state = useRef({ busy: false, target: "", enterAt: 0, timer: 0 });

  // реєстрація ease, перехоплення кліків по внутрішніх посиланнях
  useEffect(() => {
    gsap.registerPlugin(CustomEase, ScrollTrigger);
    CustomEase.create("osmo", "0.625, 0.05, 0, 1");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const panel = panelRef.current!;
    const label = labelRef.current!;
    const s = state.current;

    const reset = () => {
      clearTimeout(s.timer);
      gsap.set(panel, { autoAlpha: 0, yPercent: 0 });
      gsap.set(label, { autoAlpha: 0 });
      gsap.set(shiftEls(), { clearProps: "transform" });
      s.busy = false;
      getLenis()?.start();
    };

    go = (href) => {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return false;
      const dest = url.pathname + url.search + url.hash;
      if (s.busy) return true;
      if (url.pathname === location.pathname) return false;
      if (reduce.matches) { router.push(dest); return true; }

      s.busy = true;
      s.target = url.pathname;
      s.enterAt = performance.now() + ENTER_AT;
      s.timer = window.setTimeout(reset, TIMEOUT);
      router.prefetch(dest);
      textRef.current!.textContent = pageName(url.pathname);
      getLenis()?.stop();

      // Заморозити поточний вигляд сторінки (напр. розмиття й зсув від hover на «назад»):
      // інакше після кліку hover злітає й сторінка встигає «відіграти» назад до рівного стану.
      for (const el of shiftEls()) {
        const cs = getComputedStyle(el);
        el.style.transition = "none";
        el.style.translate = cs.translate;
        el.style.filter = cs.filter;
      }

      gsap.timeline()
        .set(panel, { autoAlpha: 1, yPercent: 0 }, 0)
        .to(panel, { yPercent: -100, duration: 0.8, ease: "osmo" }, 0)
        .fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "osmo" }, 0.2)
        .fromTo(shiftEls(), { y: 0 }, { y: "-15vh", duration: 0.8, ease: "osmo" }, 0)
        .call(() => router.push(dest), [], 0.8);
      return true;
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || "noTransition" in a.dataset) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault(); // next/link бачить defaultPrevented і сам не навігує
      go!(url.href);
    };

    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      go = null;
      reset();
    };
  }, [router]);

  // нова сторінка відрендерилась → відкриття
  useEffect(() => {
    const s = state.current;
    if (!s.busy || pathname !== s.target) return;
    const panel = panelRef.current!;
    const label = labelRef.current!;
    let raf = 0;

    const delay = Math.max(0, s.enterAt - performance.now());
    const t = window.setTimeout(() => {
      raf = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        const lenis = getLenis();
        lenis?.scrollTo(0, { immediate: true, force: true });
        lenis?.resize();

        gsap.timeline({
          onComplete: () => {
            clearTimeout(s.timer);
            gsap.set(panel, { autoAlpha: 0, yPercent: 0 });
            s.busy = false;
            getLenis()?.start();
            ScrollTrigger.refresh();
          },
        })
          .to(panel, { yPercent: -200, duration: 1, ease: "osmo" }, 0)
          .to(label, { autoAlpha: 0, duration: 0.4, ease: "osmo" }, 0.1)
          .from(shiftEls(), { y: "15vh", duration: 1, ease: "osmo", clearProps: "transform" }, 0);
      });
    }, delay);

    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [pathname]);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div ref={panelRef} className={styles.panel}>
        <span ref={labelRef} className={styles.label}>
          <span ref={textRef} />
        </span>
      </div>
    </div>
  );
}
