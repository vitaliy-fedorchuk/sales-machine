"use client";

import type { MediaItem } from "@/lib/media/urls";

/** Vercel приймає тіло запиту функції до 4,5 МБ — беремо із запасом */
const MAX_SEND_BYTES = 4 * 1024 * 1024;
/** Найбільший розмір на сайті — 2400; трохи більше лишаємо для запасу різкості */
const MAX_SIDE = 3000;

/**
 * Велике фото (10–20 МБ з камери) стискаємо в браузері до 3000px / JPEG —
 * сервер однаково ріже його на 480–2400px webp. Маленькі файли йдуть як є.
 * createImageBitmap сам розвертає фото за EXIF.
 */
const prepare = async (file: File): Promise<Blob> => {
  if (file.size <= MAX_SEND_BYTES || !file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    for (const q of [0.92, 0.85, 0.75]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
      if (blob && blob.size <= MAX_SEND_BYTES) return blob;
    }
  } catch {
    /* браузер не зміг декодувати — відправимо як є, сервер скаже, що не так */
  }
  return file;
};

/** Завантажити фото в медіатеку. XHR, а не fetch — щоб показувати прогрес. */
export const uploadImage = async (file: File, { alt = "", onProgress }: { alt?: string; onProgress?: (p: number) => void } = {}) => {
  const body = await prepare(file);
  return new Promise<MediaItem>((resolve, reject) => {
    const form = new FormData();
    form.append("file", body, file.name);
    form.append("alt", alt);
    form.append("originalName", file.name);
    form.append("originalBytes", String(file.size));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as MediaItem);
      else reject(new Error((xhr.response as { error?: string } | null)?.error ?? "Не удалось загрузить фото"));
    };
    xhr.onerror = () => reject(new Error("Нет связи с сервером"));
    xhr.send(form);
  });
};
