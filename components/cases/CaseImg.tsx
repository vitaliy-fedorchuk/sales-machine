import { srcSetOf, variantOf } from "@/lib/media/urls";
import type { CaseImage } from "@/lib/cases/types";

/**
 * Фото кейсу. З медіатеки — srcset із 4 розмірів webp (браузер бере потрібний),
 * data-zoom — найбільша версія для лайтбокса (CaseLightbox). Статичні фото з public/ — як є.
 */
export default function CaseImg({
  image,
  className,
  sizes = "(max-width: 991px) 100vw, 75vw",
  zoom = true,
  caption,
  eager,
  noUpscale,
}: {
  image: CaseImage;
  className?: string;
  sizes?: string;
  zoom?: boolean;
  caption?: string;
  eager?: boolean;
  /** Не розтягувати більше за реальну ширину файлу (малі фото інакше «пливуть») */
  noUpscale?: boolean;
}) {
  const srcSet = srcSetOf(image.src);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- фото з медіатеки (Blob) уже нарізані на розміри
    <img
      src={image.src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className={className}
      style={noUpscale && image.width ? { maxWidth: `${image.width}px` } : undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      {...(zoom
        ? {
            "data-zoom": variantOf(image.src, 2400),
            "data-zoom-caption": caption ?? "",
            tabIndex: 0,
            role: "button",
            "aria-haspopup": "dialog" as const,
          }
        : {})}
    />
  );
}
