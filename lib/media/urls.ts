/**
 * Адреси фото з медіатеки. Кожне фото лежить у 4 розмірах webp:
 *   <база>/2026/11/<id>-480.webp, -960, -1600, -2400
 * де база — /uploads (локально) або https://….public.blob.vercel-storage.com (прод).
 * У кейсах зберігається адреса розміру 1600, решту виводимо з неї (srcset, мініатюри, лайтбокс).
 * Фото не з медіатеки (статичні з public/) лишаються як є.
 */

export const MEDIA_WIDTHS = [480, 960, 1600, 2400] as const;
export type MediaWidth = (typeof MEDIA_WIDTHS)[number];
export const MAIN_WIDTH: MediaWidth = 1600;
/** Фото вужче за це — на всю ширину кейсу буде мило; в адмінці показуємо попередження */
export const SHARP_MIN_WIDTH = 1600;

const VARIANT = /^(.+\/\d{4}\/\d{2}\/m[a-z0-9]+)-(480|960|1600|2400)\.webp$/;

/** Адреса іншого розміру того ж фото (або сама адреса, якщо фото не з медіатеки) */
export const variantOf = (src: string, width: MediaWidth) => {
  const m = src.match(VARIANT);
  return m ? `${m[1]}-${width}.webp` : src;
};

/** srcset для <img>: браузер сам бере розмір під екран. undefined — фото не з медіатеки. */
export const srcSetOf = (src: string) => {
  const m = src.match(VARIANT);
  return m ? MEDIA_WIDTHS.map((w) => `${m[1]}-${w}.webp ${w}w`).join(", ") : undefined;
};

/** Чи це фото з медіатеки; повертає його ключ «2026/11/<id>» */
export const mediaKeyOf = (src: string) => src.match(VARIANT)?.[1].match(/\d{4}\/\d{2}\/m[a-z0-9]+$/)?.[0] ?? null;

export type MediaKind = "image" | "audio";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  mime: string;
  key: string;
  /** Основна адреса (1600) — її вставляємо в кейс */
  url: string;
  /** Мініатюра (480) */
  thumb: string;
  width: number;
  height: number;
  bytes: number;
  originalBytes: number | null;
  alt: string;
  originalName: string;
  /** Чи стоїть десь у кейсі — якщо відомо */
  used?: boolean;
  createdAt: string;
}

export const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/avif,image/gif";
export const ACCEPT_AUDIO = "audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/ogg,audio/wav,.mp3,.m4a,.ogg,.wav";

export const formatBytes = (n: number) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} КБ` : `${(n / 1024 / 1024).toFixed(1)} МБ`;
