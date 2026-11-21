"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaItem, MediaKind } from "@/lib/media/urls";
import a from "../../admin.module.css";
import { Icon } from "../../icons";
import MediaBrowser, { MediaDetail } from "./MediaBrowser";

/** Сторінка медіатеки: вкладки «Фото / Аудио», сітка + вікно з деталями файлу */
export default function MediaLibrary() {
  const [kind, setKind] = useState<MediaKind>("image");
  const [open, setOpen] = useState<MediaItem | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <div className={a.seg} style={{ marginBottom: 16 }} role="tablist" aria-label="Тип файлов">
        <button type="button" role="tab" aria-selected={kind === "image"} className={kind === "image" ? a.segOn : ""} onClick={() => setKind("image")}>
          Фото
        </button>
        <button type="button" role="tab" aria-selected={kind === "audio"} className={kind === "audio" ? a.segOn : ""} onClick={() => setKind("audio")}>
          Аудио
        </button>
      </div>
      <MediaBrowser key={kind} mode="library" kind={kind} onOpen={setOpen} />
      <dialog
        ref={ref}
        className={a.modal}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        aria-label="Файл"
      >
        <div className={a.modalHead}>
          <h2 className={a.modalTitle}>{open?.kind === "audio" ? "Аудио" : "Фото"}</h2>
          <button type="button" className={a.iconBtn} onClick={() => ref.current?.close()} aria-label="Закрыть">
            <Icon name="close" />
          </button>
        </div>
        <div className={a.modalBody}>{open && <MediaDetail key={open.id} item={open} onClose={() => setOpen(null)} />}</div>
      </dialog>
    </>
  );
}
