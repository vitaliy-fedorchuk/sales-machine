"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  poster: string;
  className?: string;
  /** true/false — керує відтворенням ззовні; undefined — грає, поки відео у кадрі. */
  playing?: boolean;
};

/**
 * Беззвучне прев'ю-цикл. Не вантажиться, поки далеко від екрана (preload="none"),
 * і не грає, коли невидиме — щоб 11 відео на сторінці не їли батарею й трафік.
 */
export default function PreviewVideo({ src, poster, className, playing }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    const v = ref.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sync = () => {
      const want = !reduce && visible.current && (playing ?? true);
      if (want) v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible.current = e.isIntersecting;
        sync(); // play() сам почне вантажити файл — лише те відео, яке справді має грати
      },
      { rootMargin: "150px" },
    );
    io.observe(v);
    sync();
    return () => io.disconnect();
  }, [playing]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
