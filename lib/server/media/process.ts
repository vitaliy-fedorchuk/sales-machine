// Без "server-only": обробку використовує і seed-скрипт.
import sharp, { type Metadata } from "sharp";
import { MEDIA_WIDTHS, variantOf, type MediaWidth } from "../../media/urls";
import { putFile, removeFiles } from "./storage";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 МБ — з запасом для фото з телефона
const MAX_PIXELS = 60_000_000; // ~60 Мп: більше — підозріло (або «бомба»)
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "heif", "tiff"]);
const WEBP_QUALITY = 80;

export class MediaError extends Error {}

export interface ProcessedImage {
  /** «2026/11/<id>» */
  key: string;
  /** Адреса розміру 1600 */
  url: string;
  width: number;
  height: number;
  bytes: number;
}

/** Нове id фото: потрібне для імені файлів ще до запису в базу */
export const newMediaId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

/**
 * Фото → 4 розміри webp у сховищі (Vercel Blob або папка).
 * - формат визначає сама sharp за вмістом файлу (не за назвою чи типом із браузера);
 * - поворот за EXIF (фото з телефона «на боці»);
 * - метадані (EXIF, GPS-координати) не переносяться — sharp їх відкидає;
 * - не збільшує: з маленького фото великий розмір буде таким, як оригінал.
 */
export const processImage = async (input: Buffer, id: string, now = new Date()): Promise<ProcessedImage> => {
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new MediaError("Файл слишком большой — до 20 МБ");

  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw new MediaError("Это не похоже на фото, или файл повреждён");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) {
    throw new MediaError("Неподдерживаемый формат. Подходят JPG, PNG, WEBP, AVIF, GIF");
  }

  const key = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${id}`;

  // Розміри вже з урахуванням повороту (EXIF orientation 5–8 = бокові)
  const sideways = (meta.orientation ?? 1) >= 5;
  const width = (sideways ? meta.height : meta.width) ?? 0;
  const height = (sideways ? meta.width : meta.height) ?? 0;

  const rotated = sharp(input, { limitInputPixels: MAX_PIXELS }).rotate();

  const saved: string[] = [];
  let url = "";
  let bytes = 0;
  try {
    for (const w of MEDIA_WIDTHS) {
      const out = await rotated.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: WEBP_QUALITY }).toBuffer();
      const u = await putFile(`${key}-${w}.webp`, out, "image/webp");
      saved.push(u);
      if (w === 1600) url = u;
      bytes = out.byteLength;
    }
  } catch (e) {
    await removeFiles(saved).catch(() => {});
    throw e;
  }

  return { key, url, width, height, bytes };
};

/** Видалити всі розміри фото */
export const removeImageFiles = (url: string) =>
  removeFiles(MEDIA_WIDTHS.map((w: MediaWidth) => variantOf(url, w)));

// ---------- Аудіо (радіоролики) ----------

/** Тип аудіо за першими байтами файлу (не за назвою чи типом із браузера) */
export const sniffAudio = (b: Buffer): { ext: string; mime: string } | null => {
  const ascii = (from: number, len: number) => b.subarray(from, from + len).toString("latin1");
  if (ascii(0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0 && (b[1] & 0x06) !== 0)) return { ext: "mp3", mime: "audio/mpeg" };
  // ftyp є і в AVIF/HEIC-фото та MP4-відео — аудіо лише з брендом M4A/M4B
  if (ascii(4, 4) === "ftyp" && ["M4A ", "M4B "].includes(ascii(8, 4))) return { ext: "m4a", mime: "audio/mp4" };
  if (ascii(0, 4) === "OggS") return { ext: "ogg", mime: "audio/ogg" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WAVE") return { ext: "wav", mime: "audio/wav" };
  return null;
};

export interface ProcessedAudio {
  key: string;
  url: string;
  bytes: number;
  mime: string;
}

/** Аудіо зберігаємо як є (перекодування — не на сервері сайту); лише перевіряємо, що це справді звук */
export const processAudio = async (input: Buffer, id: string, now = new Date()): Promise<ProcessedAudio> => {
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new MediaError("Файл слишком большой — до 20 МБ");
  const type = sniffAudio(input);
  if (!type) throw new MediaError("Неподдерживаемый формат аудио. Подходят MP3, M4A, OGG, WAV");
  const key = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${id}`;
  const url = await putFile(`${key}.${type.ext}`, input, type.mime);
  return { key, url, bytes: input.byteLength, mime: type.mime };
};
