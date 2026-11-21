import type { Metadata } from "next";
import { requireUser } from "@/lib/server/auth/session";
import a from "../../admin.module.css";
import MediaLibrary from "./MediaLibrary";

export const metadata: Metadata = { title: "Медиатека" };

export default async function MediaPage() {
  await requireUser();
  return (
    <>
      <div className={a.pageHead}>
        <h1 className={a.h1}>Медиатека</h1>
        <p className={a.muted} style={{ margin: 0, maxWidth: 520 }}>
          Фото хранятся в 4 размерах WEBP (480–2400 px), сайт сам выбирает нужный; EXIF и GPS удаляются.
          Аудио (радиоролики) — как есть. Файл, который стоит в кейсе, удалить нельзя.
        </p>
      </div>
      <MediaLibrary />
    </>
  );
}
