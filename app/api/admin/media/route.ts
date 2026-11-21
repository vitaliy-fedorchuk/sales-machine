import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth/session";
import { toMediaItem } from "@/lib/server/media/library";
import { MAX_UPLOAD_BYTES, MediaError, newMediaId, processAudio, processImage, removeImageFiles, sniffAudio } from "@/lib/server/media/process";
import { removeFiles } from "@/lib/server/media/storage";

/**
 * Завантаження фото або аудіо: POST multipart/form-data { file, alt? } → MediaItem.
 * Тип визначається за вмістом файлу: звук (mp3/m4a/ogg/wav) зберігається як є, фото — 4 розміри webp.
 * Окремий обробник (не server action): у server actions ліміт тіла 1 МБ, а фото важать 5–10 МБ.
 * Адреса поза /admin, щоб proxy.ts не буферизував великі тіла; вхід перевіряємо тут.
 * На Vercel тіло запиту функції — до 4,5 МБ, тому браузер перед відправкою стискає великі фото (useUploads).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Нужно войти" }, { status: 401 });

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return Response.json({ error: "Файл слишком большой — до 20 МБ" }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Не удалось прочитать файл" }, { status: 400 });
  }
  const f = form.get("file");
  const file = f instanceof File ? f : null;
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300);
  const originalBytes = Number(form.get("originalBytes")) || file?.size || null;
  const originalName = String(form.get("originalName") ?? "") || file?.name || "фото";
  if (!file || file.size === 0) return Response.json({ error: "Файл не выбран" }, { status: 400 });

  const id = newMediaId();
  const buf = Buffer.from(await file.arrayBuffer());

  if (sniffAudio(buf)) {
    try {
      const a = await processAudio(buf, id);
      try {
        const row = await db.media.create({
          data: { id, kind: "AUDIO", ...a, originalName: originalName.slice(0, 200), originalBytes, alt, uploadedById: user.id },
        });
        return Response.json(toMediaItem(row));
      } catch (e) {
        await removeFiles([a.url]);
        throw e;
      }
    } catch (e) {
      if (e instanceof MediaError) return Response.json({ error: e.message }, { status: 415 });
      console.error("[media] audio upload failed", e);
      return Response.json({ error: "Не удалось сохранить аудио" }, { status: 500 });
    }
  }

  try {
    const processed = await processImage(buf, id);
    try {
      const row = await db.media.create({
        data: { id, ...processed, originalName: originalName.slice(0, 200), originalBytes, alt, uploadedById: user.id },
      });
      return Response.json(toMediaItem(row));
    } catch (e) {
      await removeImageFiles(processed.url);
      throw e;
    }
  } catch (e) {
    if (e instanceof MediaError) return Response.json({ error: e.message }, { status: 415 });
    console.error("[media] upload failed", e);
    return Response.json({ error: "Не удалось обработать фото" }, { status: 500 });
  }
}
