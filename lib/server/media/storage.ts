// Без "server-only": сховище використовує і seed-скрипт.
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

/**
 * Куди складаються файли медіатеки.
 *  - є BLOB_READ_WRITE_TOKEN → Vercel Blob (прод: диск функцій Vercel не зберігається між запитами);
 *  - немає → папка UPLOADS_DIR, віддається за /uploads/... (app/uploads/[...path]/route.ts).
 * Ключ файлу однаковий в обох: «2026/11/<id>-1600.webp».
 */

export const uploadsDir = () => path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR ?? "./uploads");

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/** Зберегти файл; повертає його публічну адресу */
export const putFile = async (key: string, body: Buffer, contentType: string): Promise<string> => {
  if (useBlob()) {
    const res = await put(key, body, {
      access: "public",
      contentType,
      addRandomSuffix: false, // ключ уже унікальний (id фото)
      cacheControlMaxAge: 60 * 60 * 24 * 365, // фото за цим ключем ніколи не змінюється
    });
    return res.url;
  }
  const file = path.join(uploadsDir(), key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
  return `/uploads/${key}`;
};

/** Видалити файли за їхніми адресами (тими, що повернув putFile) */
export const removeFiles = async (urls: string[]) => {
  if (!urls.length) return;
  if (useBlob()) {
    await del(urls.filter((u) => /^https?:/.test(u)));
    return;
  }
  await Promise.all(
    urls
      .filter((u) => u.startsWith("/uploads/"))
      .map((u) => rm(path.join(uploadsDir(), u.slice("/uploads/".length)), { force: true })),
  );
};
