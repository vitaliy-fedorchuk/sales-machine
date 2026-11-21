"use client";

import { useState } from "react";
import type { CaseBlock, CaseBlockType, VideoFormat } from "@/lib/cases/schema";
import { toEmbed } from "@/lib/video";
import MediaPicker from "../../media/MediaPicker";
import a from "../../../admin.module.css";
import { Icon } from "../../../icons";
import { Field, ImageInput, ImagesInput, RICH_HINT, Textarea, TextInput } from "./fields";

/** Назва й опис кожного типу блоку — для вибору і заголовка картки */
export const BLOCK_INFO: Record<CaseBlockType, { label: string; hint: string }> = {
  text: { label: "Текст", hint: "Абзацы с заголовком: «Задача», «Реализация», «Результат»… Заголовок — отдельный раздел на оси." },
  image: { label: "Фото", hint: "Одно изображение на всю ширину; по клику — просмотр на весь экран." },
  gallery: { label: "Галерея", hint: "Несколько фото — слайдер со стрелками и полноэкранным просмотром." },
  video: { label: "Видео", hint: "YouTube, Vimeo или Rutube — плеер прямо на странице." },
  audio: { label: "Аудио", hint: "Радиоролики: кнопки «▶ 1й аудио-ролик»." },
  review: { label: "Видеоотзыв", hint: "Кнопка «▶ Смотреть отзыв» — видео во всплывающем окне." },
  link: { label: "Кнопка-ссылка", hint: "«Смотреть кейс», публикация в СМИ и т. п." },
  press: { label: "Цитаты СМИ", hint: "Карточки: издание, цитата, ссылка." },
};

type Props<T extends CaseBlockType> = { block: Extract<CaseBlock, { type: T }>; onChange: (b: CaseBlock) => void };

const VIDEO_HINT = "Ссылка на ролик или код плеера: youtube.com/watch?v=…, vimeo.com/…, rutube.ru/video/…";

function FormatSelect({ value, onChange }: { value: VideoFormat; onChange: (v: VideoFormat) => void }) {
  return (
    <Field label="Формат видео">
      <select className={a.select} value={value} onChange={(e) => onChange(e.target.value as VideoFormat)}>
        <option value="wide">Горизонтальное 16:9</option>
        <option value="vertical">Вертикальное 9:16 (сторис, шортс)</option>
      </select>
    </Field>
  );
}

function TextFields({ block, onChange }: Props<"text">) {
  return (
    <>
      <TextInput
        label="Заголовок раздела"
        value={block.label ?? ""}
        placeholder="Например: Задача:"
        maxLength={120}
        hint="Необязательно. С заголовком блок — новый раздел с номером на оси."
        onChange={(label) => onChange({ ...block, label })}
      />
      <Textarea label="Текст" value={block.body ?? ""} rows={6} hint={RICH_HINT} onChange={(body) => onChange({ ...block, body })} />
    </>
  );
}

function ImageFields({ block, onChange }: Props<"image">) {
  return (
    <>
      <ImageInput label="Фото" image={block.image.src ? block.image : null} onChange={(img) => onChange({ ...block, image: img ?? { src: "", alt: "", width: 0, height: 0 } })} />
      <div className={a.row}>
        <TextInput label="Подпись (необязательно)" value={block.caption ?? ""} maxLength={300} onChange={(caption) => onChange({ ...block, caption })} />
        <Field label="Вид">
          <label className={a.check}>
            <input type="checkbox" checked={!!block.frame} onChange={(e) => onChange({ ...block, frame: e.target.checked })} />
            Тонкая рамка (логотип на белом)
          </label>
          <label className={a.check}>
            <input type="checkbox" checked={!!block.narrow} onChange={(e) => onChange({ ...block, narrow: e.target.checked })} />
            Узкое (вертикальное фото, логотип)
          </label>
        </Field>
      </div>
    </>
  );
}

function GalleryFields({ block, onChange }: Props<"gallery">) {
  return <ImagesInput images={block.images} onChange={(images) => onChange({ ...block, images })} />;
}

function VideoFields({ block, onChange }: Props<"video">) {
  return (
    <>
      <TextInput label="Ссылка на видео" value={block.src} maxLength={1000} hint={VIDEO_HINT} onChange={(src) => onChange({ ...block, src: toEmbed(src) })} />
      <div className={a.row}>
        <FormatSelect value={block.format} onChange={(format) => onChange({ ...block, format })} />
        <TextInput label="Название (для незрячих)" value={block.title ?? ""} maxLength={200} onChange={(title) => onChange({ ...block, title })} />
      </div>
    </>
  );
}

function ReviewFields({ block, onChange }: Props<"review">) {
  return (
    <>
      <div className={a.row}>
        <TextInput label="Текст кнопки" value={block.label} maxLength={80} onChange={(label) => onChange({ ...block, label })} />
        <FormatSelect value={block.format} onChange={(format) => onChange({ ...block, format })} />
      </div>
      <TextInput label="Ссылка на видео" value={block.src} maxLength={1000} hint={VIDEO_HINT} onChange={(src) => onChange({ ...block, src: toEmbed(src) })} />
    </>
  );
}

function LinkFields({ block, onChange }: Props<"link">) {
  return (
    <div className={a.row}>
      <TextInput label="Текст кнопки" value={block.label} maxLength={120} onChange={(label) => onChange({ ...block, label })} />
      <TextInput label="Ссылка" value={block.href} maxLength={1000} placeholder="https://… или /stati/…" onChange={(href) => onChange({ ...block, href })} />
    </div>
  );
}

/** Повторювані рядки (аудіо, цитати) */
function Repeat<T>({
  items,
  onChange,
  empty,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: () => T;
  addLabel: string;
  render: (item: T, set: (v: T) => void, i: number) => React.ReactNode;
}) {
  return (
    <div className={a.repeat}>
      {items.map((it, i) => (
        <div key={i} className={a.repeatRow}>
          <div className={a.repeatFields}>{render(it, (v) => onChange(items.map((x, j) => (j === i ? v : x))), i)}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <button type="button" className={a.iconBtn} title="Выше" disabled={i === 0} onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>
              <Icon name="up" />
            </button>
            <button type="button" className={a.iconBtn} title="Ниже" disabled={i === items.length - 1} onClick={() => { const n = [...items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }}>
              <Icon name="down" />
            </button>
            <button type="button" className={a.iconBtn} title="Удалить" disabled={items.length === 1} onClick={() => onChange(items.filter((_, j) => j !== i))}>
              <Icon name="trash" />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className={a.btn} style={{ alignSelf: "flex-start" }} onClick={() => onChange([...items, empty()])}>
        <Icon name="plus" />
        {addLabel}
      </button>
    </div>
  );
}

function AudioFields({ block, onChange }: Props<"audio">) {
  // Для якого ролика відкрите вікно медіатеки (null — закрите)
  const [picking, setPicking] = useState<number | null>(null);
  return (
    <Field label="Ролики" hint="Загрузите mp3 в медиатеку (вкладка «Аудио») и выберите его — или вставьте прямую ссылку на файл.">
      <Repeat
        items={block.items}
        onChange={(items) => onChange({ ...block, items })}
        empty={() => ({ title: `${block.items.length + 1}й аудио-ролик`, src: "" })}
        addLabel="Добавить ролик"
        render={(it, set, i) => (
          <>
            <input className={a.input} value={it.title} maxLength={120} placeholder="Название" aria-label="Название ролика" onChange={(e) => set({ ...it, title: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <input className={a.input} value={it.src} maxLength={1000} placeholder="https://….mp3" aria-label="Ссылка на файл" onChange={(e) => set({ ...it, src: e.target.value })} />
              <button type="button" className={a.btn} onClick={() => setPicking(i)}>
                Из медиатеки
              </button>
            </div>
            {it.src && <audio controls preload="none" src={it.src} style={{ width: "100%", height: 32 }} />}
          </>
        )}
      />
      {picking !== null && (
        <MediaPicker
          kind="audio"
          onClose={() => setPicking(null)}
          onPick={([m]) => {
            const name = m.alt || m.originalName.replace(/.[a-z0-9]+$/i, "");
            onChange({ ...block, items: block.items.map((x, j) => (j === picking ? { title: x.title && !/^d+й аудио-ролик$/.test(x.title) ? x.title : name, src: m.url } : x)) });
            setPicking(null);
          }}
        />
      )}
    </Field>
  );
}

function PressFields({ block, onChange }: Props<"press">) {
  return (
    <Repeat
      items={block.items}
      onChange={(items) => onChange({ ...block, items })}
      empty={() => ({ source: "", quote: "", href: "" })}
      addLabel="Добавить цитату"
      render={(it, set) => (
        <>
          <div className={a.row}>
            <input className={a.input} value={it.source} maxLength={120} placeholder="Издание" aria-label="Издание" onChange={(e) => set({ ...it, source: e.target.value })} />
            <input className={a.input} value={it.href} maxLength={1000} placeholder="https://…" aria-label="Ссылка" onChange={(e) => set({ ...it, href: e.target.value })} />
          </div>
          <textarea className={a.textarea} value={it.quote} rows={2} maxLength={1000} placeholder="Цитата" aria-label="Цитата" onChange={(e) => set({ ...it, quote: e.target.value })} />
        </>
      )}
    />
  );
}

/** Форма блоку за його типом */
export function BlockFields({ block, onChange }: { block: CaseBlock; onChange: (b: CaseBlock) => void }) {
  switch (block.type) {
    case "text":
      return <TextFields block={block} onChange={onChange} />;
    case "image":
      return <ImageFields block={block} onChange={onChange} />;
    case "gallery":
      return <GalleryFields block={block} onChange={onChange} />;
    case "video":
      return <VideoFields block={block} onChange={onChange} />;
    case "audio":
      return <AudioFields block={block} onChange={onChange} />;
    case "review":
      return <ReviewFields block={block} onChange={onChange} />;
    case "link":
      return <LinkFields block={block} onChange={onChange} />;
    case "press":
      return <PressFields block={block} onChange={onChange} />;
  }
}
