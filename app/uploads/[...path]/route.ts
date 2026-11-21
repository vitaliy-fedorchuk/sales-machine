import { readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Віддає завантажені фото з UPLOADS_DIR за адресою /uploads/...
 *
 * Next віддає з public/ лише файли, що були там під час збірки, а фото
 * з адмінки зʼявляються пізніше — тому окремий обробник.
 * Лише для розробки: на проді фото лежать у Vercel Blob і йдуть звідти напряму.
 */

// turbopackIgnore: шлях відомий лише під час роботи — не тягнути весь проєкт у збірку
const UPLOADS_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR ?? "./uploads");

const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const file = path.resolve(/*turbopackIgnore: true*/ UPLOADS_DIR, ...parts);
  const type = TYPES[path.extname(file).toLowerCase()];

  // Захист від виходу за межі папки (../../etc/passwd) і від невідомих типів
  if (!type || !file.startsWith(UPLOADS_DIR + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    const body = await readFile(file);
    return new Response(body, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        // Фото з медіатеки (рік/місяць/унікальний id) ніколи не змінюються —
        // браузер може тримати їх у кеші рік. Решта (демо) — добу.
        "Cache-Control": /^\d{4}\/\d{2}\//.test(parts.join("/"))
          ? "public, max-age=31536000, immutable"
          : "public, max-age=86400",
        // SVG з чужого файлу не повинен виконувати скрипти
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
