"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { deleteMedia, getMediaUsage, listMedia, updateMediaAlt } from "@/lib/server/media/actions";
import { ACCEPT_AUDIO, ACCEPT_IMAGES, formatBytes, type MediaItem, type MediaKind } from "@/lib/media/urls";
import a from "../../admin.module.css";
import { Icon } from "../../icons";
import { uploadImage } from "./upload";

type Sort = "new" | "old" | "size";
type Upload = { id: string; name: string; progress: number; error?: string };

/**
 * Сітка медіатеки: завантаження (кнопка або перетягування), пошук, фільтри.
 * mode="library" — сторінка /admin/media (клік — деталі: опис, де використане, видалити);
 * mode="pick" / "pick-many" — вибір фото в редакторі кейсу.
 * kind — фото чи аудіо (радіоролики).
 */
export default function MediaBrowser({
  mode,
  kind = "image",
  selected = [],
  onToggle,
  onOpen,
}: {
  mode: "library" | "pick" | "pick-many";
  kind?: MediaKind;
  selected?: string[];
  onToggle?: (item: MediaItem) => void;
  onOpen?: (item: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [unused, setUnused] = useState(false);
  const [missingAlt, setMissingAlt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const load = useCallback(
    async (offset = 0) => {
      const id = ++reqId.current;
      setLoading(true);
      const res = await listMedia({ kind, q: q || undefined, sort, unused: unused || undefined, missingAlt: missingAlt || undefined, offset });
      if (id !== reqId.current) return;
      setItems((prev) => (offset ? [...prev, ...res.items] : res.items));
      setTotal(res.total);
      setNext(res.nextOffset);
      setLoading(false);
    },
    [kind, q, sort, unused, missingAlt],
  );

  useEffect(() => {
    const t = setTimeout(() => load(0), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const upload = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const id = `${file.name}-${file.size}-${Math.random()}`;
      setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
      try {
        const item = await uploadImage(file, {
          onProgress: (p) => setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: p } : x))),
        });
        setUploads((u) => u.filter((x) => x.id !== id));
        if (item.kind !== kind) {
          setUploads((u) => u.map((x) => (x.id === id ? { ...x, error: kind === "audio" ? "это не аудио" : "это аудио — загрузите во вкладке «Аудио»" } : x)));
          continue;
        }
        setItems((list) => [item, ...list]);
        setTotal((n) => n + 1);
        // Завантажене у вікні вибору — одразу вибране
        if (mode !== "library") onToggle?.(item);
      } catch (e) {
        setUploads((u) => u.map((x) => (x.id === id ? { ...x, error: (e as Error).message } : x)));
      }
    }
  };

  const update = (item: MediaItem) => setItems((list) => list.map((x) => (x.id === item.id ? item : x)));
  const remove = (id: string) => {
    setItems((list) => list.filter((x) => x.id !== id));
    setTotal((n) => n - 1);
  };

  // Сторінка медіатеки керує деталями сама (через onOpen); тут — лише оновлення списку
  useEffect(() => {
    const onUpd = (e: Event) => update((e as CustomEvent<MediaItem>).detail);
    const onDel = (e: Event) => remove((e as CustomEvent<string>).detail);
    window.addEventListener("sm:media-updated", onUpd);
    window.addEventListener("sm:media-deleted", onDel);
    return () => {
      window.removeEventListener("sm:media-updated", onUpd);
      window.removeEventListener("sm:media-deleted", onDel);
    };
  }, []);

  return (
    <div>
      <div
        className={`${a.drop} ${drag ? a.dropActive : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
      >
        <button type="button" className={a.btnPrimary} onClick={() => fileRef.current?.click()}>
          <Icon name="upload" />
          {kind === "audio" ? "Загрузить аудио" : "Загрузить фото"}
        </button>
        <span className={a.muted}>
          или перетащите файлы сюда ·{" "}
          {kind === "audio" ? "MP3, M4A, OGG, WAV до 4 МБ" : "JPG, PNG, WEBP, AVIF, GIF до 20 МБ"}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept={kind === "audio" ? ACCEPT_AUDIO : ACCEPT_IMAGES}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = "";
          }}
        />
        {uploads.length > 0 && (
          <ul className={a.uploads}>
            {uploads.map((u) => (
              <li key={u.id}>
                <span>
                  {u.name}
                  {u.error && <strong> — {u.error}</strong>}
                </span>
                {u.error ? (
                  <button type="button" className={a.linkBtn} onClick={() => setUploads((x) => x.filter((y) => y.id !== u.id))}>
                    Скрыть
                  </button>
                ) : (
                  <span className={a.progress}>
                    <i style={{ width: `${Math.round(u.progress * 100)}%` }} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={a.toolbar} style={{ marginTop: 16, marginBottom: 0 }}>
        <input className={a.input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по описанию или имени файла" aria-label="Поиск" />
        <select className={a.select} style={{ width: "auto" }} value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Сортировка">
          <option value="new">Сначала новые</option>
          <option value="old">Сначала старые</option>
          <option value="size">Самые тяжёлые</option>
        </select>
        <label className={a.check}>
          <input type="checkbox" checked={unused} onChange={(e) => setUnused(e.target.checked)} />
          Нигде не используются
        </label>
        <label className={a.check}>
          <input type="checkbox" checked={missingAlt} onChange={(e) => setMissingAlt(e.target.checked)} />
          Без описания
        </label>
        <span className={a.muted} style={{ marginLeft: "auto" }}>
          {loading ? "Загружаем…" : `${total} ${kind === "audio" ? "аудио" : "фото"}`}
        </span>
      </div>

      {!loading && items.length === 0 ? (
        <p className={a.empty} style={{ marginTop: 16 }}>
          Ничего нет
        </p>
      ) : (
        <div className={a.mediaGrid}>
          {items.map((m) => {
            const n = selected.indexOf(m.url);
            const on = n >= 0;
            return (
              <button
                key={m.id}
                type="button"
                className={`${a.mediaItem} ${on ? a.mediaSelected : ""}`}
                onClick={() => (mode === "library" ? onOpen?.(m) : onToggle?.(m))}
                aria-pressed={mode === "library" ? undefined : on}
                title={m.alt || m.originalName}
              >
                {m.kind === "audio" ? (
                  <span className={a.mediaAudio} aria-hidden="true">
                    ♪<small>{m.mime.split("/")[1]?.replace("mpeg", "mp3")}</small>
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={a.mediaThumb} src={m.thumb} alt="" loading="lazy" />
                )}
                {mode !== "library" && <span className={a.mediaCheck}>{on ? (mode === "pick-many" ? n + 1 : "✓") : ""}</span>}
                {mode === "library" && m.used === false && <span className={a.mediaFlag}>не используется</span>}
                <span className={a.mediaMeta}>
                  <span className={a.mediaName}>{m.alt || m.originalName}</span>
                  <span className={a.muted}>
                    {m.kind === "audio" ? formatBytes(m.bytes) : `${m.width}×${m.height} · ${formatBytes(m.bytes)}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      {next !== null && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button type="button" className={a.btn} onClick={() => load(next)} disabled={loading}>
            Показать ещё
          </button>
        </div>
      )}
    </div>
  );
}

/** Деталі фото: опис, використання, видалення. Повідомляє список через події. */
export function MediaDetail({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [usage, setUsage] = useState<{ id: string; title: string }[] | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMediaUsage(item.id).then(setUsage);
  }, [item.id]);

  const saveAlt = async () => {
    if (alt === item.alt) return;
    const upd = await updateMediaAlt(item.id, alt);
    window.dispatchEvent(new CustomEvent("sm:media-updated", { detail: upd }));
    setMsg("Описание сохранено");
  };

  const del = async () => {
    if (!window.confirm(item.kind === "audio" ? "Удалить аудио навсегда?" : "Удалить фото навсегда?")) return;
    setBusy(true);
    const res = await deleteMedia(item.id);
    setBusy(false);
    if (!res.ok) return setMsg(res.error);
    window.dispatchEvent(new CustomEvent("sm:media-deleted", { detail: item.id }));
    onClose();
  };

  return (
    <div className={a.detail}>
      {item.kind === "audio" ? (
        <div className={a.audioDetail}>
          <span className={a.mediaAudio} aria-hidden="true">♪</span>
          <audio controls src={item.url} preload="metadata" style={{ width: "100%" }} />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt={item.alt} />
      )}
      <div className={a.detailInfo}>
        <label className={a.field}>
          <span className={a.fieldLabel}>{item.kind === "audio" ? "Название ролика" : "Описание (alt)"}</span>
          <textarea className={a.textarea} value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} onBlur={saveAlt} />
          <span className={a.fieldHint}>
            {item.kind === "audio"
              ? "Подставляется как название кнопки, когда ролик выбирают в кейс."
              : "Что изображено — для поиска и незрячих. Подставляется, когда фото выбирают в кейс."}
          </span>
        </label>
        {msg && <p className={a.alert}>{msg}</p>}
        <dl className={a.dl}>
          <dt>Файл</dt>
          <dd>{item.originalName}</dd>
          {item.kind === "image" && (
            <>
              <dt>Размер</dt>
              <dd>
                {item.width}×{item.height}
              </dd>
            </>
          )}
          <dt>Вес</dt>
          <dd>
            {formatBytes(item.bytes)}
            {item.originalBytes ? ` (было ${formatBytes(item.originalBytes)})` : ""}
          </dd>
          <dt>Загружено</dt>
          <dd>{new Date(item.createdAt).toLocaleString("ru-RU")}</dd>
        </dl>
        <div className={a.field}>
          <span className={a.fieldLabel}>Где используется</span>
          {usage === null ? (
            <span className={a.muted}>…</span>
          ) : usage.length === 0 ? (
            <span className={a.muted}>Нигде</span>
          ) : (
            usage.map((u) => (
              <a key={u.id} href={`/admin/cases/${u.id}`} style={{ color: "var(--ink)" }}>
                {u.title || "Без названия"}
              </a>
            ))
          )}
        </div>
        {item.kind === "image" && (
          <a className={a.btn} href={item.url.replace(/-1600\.webp$/, "-2400.webp")} target="_blank" rel="noopener noreferrer">
            Открыть в полном размере
          </a>
        )}
        <button type="button" className={a.btnDanger} onClick={del} disabled={busy}>
          {item.kind === "audio" ? "Удалить аудио" : "Удалить фото"}
        </button>
      </div>
    </div>
  );
}
