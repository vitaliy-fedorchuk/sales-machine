"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaItem, MediaKind } from "@/lib/media/urls";
import a from "../../admin.module.css";
import { Icon } from "../../icons";
import MediaBrowser from "./MediaBrowser";

/**
 * Вікно вибору фото з медіатеки (і завантаження нових) для поля в редакторі.
 * multiple — для галереї: порядок вибору = порядок слайдів.
 */
export default function MediaPicker({
  multiple = false,
  kind = "image",
  onPick,
  onClose,
}: {
  multiple?: boolean;
  kind?: MediaKind;
  onPick: (items: MediaItem[]) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [picked, setPicked] = useState<MediaItem[]>([]);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const toggle = (m: MediaItem) => {
    if (!multiple) {
      onPick([m]);
      return;
    }
    setPicked((list) => (list.some((x) => x.id === m.id) ? list.filter((x) => x.id !== m.id) : [...list, m]));
  };

  return (
    <dialog
      ref={ref}
      className={a.modal}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      aria-label="Медиатека"
    >
      <div className={a.modalHead}>
        <h2 className={a.modalTitle}>{kind === "audio" ? "Выберите аудио" : multiple ? "Выберите фото для галереи" : "Выберите фото"}</h2>
        <button type="button" className={a.iconBtn} onClick={() => ref.current?.close()} aria-label="Закрыть">
          <Icon name="close" />
        </button>
      </div>
      <div className={a.modalBody}>
        <MediaBrowser mode={multiple ? "pick-many" : "pick"} kind={kind} selected={picked.map((p) => p.url)} onToggle={toggle} />
      </div>
      {multiple && (
        <div className={a.modalFoot}>
          <span className={a.muted}>Выбрано: {picked.length} — порядок выбора = порядок слайдов</span>
          <button type="button" className={a.btnPrimary} disabled={!picked.length} onClick={() => onPick(picked)}>
            Добавить
          </button>
        </div>
      )}
    </dialog>
  );
}
