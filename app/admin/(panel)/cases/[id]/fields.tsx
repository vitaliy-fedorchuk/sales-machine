"use client";

import { useId, useState, type ReactNode } from "react";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CaseImage } from "@/lib/cases/schema";
import { variantOf, type MediaItem } from "@/lib/media/urls";
import a from "../../../admin.module.css";
import { Icon } from "../../../icons";
import MediaPicker from "../../media/MediaPicker";

export function Field({ label, hint, error, children }: { label: string; hint?: ReactNode; error?: string; children: ReactNode }) {
  return (
    <div className={`${a.field} ${error ? a.hasError : ""}`}>
      <span className={a.fieldLabel}>{label}</span>
      {children}
      {hint && <p className={a.fieldHint}>{hint}</p>}
      {error && <p className={a.fieldError}>{error}</p>}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  hint,
  placeholder,
  maxLength = 300,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error}>
      <input id={id} className={a.input} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    </Field>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows = 4,
  maxLength = 20000,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={a.textarea}
        value={value}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        style={{ fieldSizing: "content" } as React.CSSProperties}
      />
    </Field>
  );
}

/** Підказка до поля «Текст» */
export const RICH_HINT = (
  <>
    Пустая строка — новый абзац. <b>**жирный**</b>, <i>*курсив*</i>, [текст ссылки](https://…)
  </>
);

const toImage = (m: MediaItem): CaseImage => ({ src: m.url, alt: m.alt, width: m.width, height: m.height });

/** Одне фото: прев'ю, «Выбрать / Заменить», опис */
export function ImageInput({
  label,
  image,
  onChange,
  error,
}: {
  label: string;
  image: CaseImage | null;
  onChange: (img: CaseImage | null) => void;
  error?: string;
}) {
  const [picking, setPicking] = useState(false);
  const has = !!image?.src;
  return (
    <Field label={label} error={error}>
      <div className={a.img}>
        <div className={a.imgPreview}>
          {has ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variantOf(image!.src, 960)} alt={image!.alt} />
          ) : (
            <span className={a.muted}>Фото не выбрано</span>
          )}
        </div>
        <div className={a.imgActions}>
          <button type="button" className={a.btn} onClick={() => setPicking(true)}>
            <Icon name="image" />
            {has ? "Заменить" : "Выбрать из медиатеки"}
          </button>
          {has && (
            <button type="button" className={a.btnDanger} onClick={() => onChange(null)}>
              Убрать
            </button>
          )}
        </div>
        {has && (
          <input
            className={a.input}
            value={image!.alt}
            maxLength={300}
            placeholder="Описание фото (alt)"
            aria-label="Описание фото"
            onChange={(e) => onChange({ ...image!, alt: e.target.value })}
          />
        )}
      </div>
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={([m]) => {
            onChange(toImage(m));
            setPicking(false);
          }}
        />
      )}
    </Field>
  );
}

function SortableThumb({ img, n, onRemove }: { img: CaseImage; n: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.src });
  return (
    <div
      ref={setNodeRef}
      className={a.thumb}
      style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 3 : undefined }}
      {...attributes}
      {...listeners}
      title="Перетащите, чтобы поменять порядок"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={variantOf(img.src, 480)} alt={img.alt} draggable={false} />
      <span className={a.thumbNum}>{String(n).padStart(2, "0")}</span>
      <button
        type="button"
        className={a.thumbRemove}
        aria-label="Убрать из галереи"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}

/** Галерея: мініатюри з перетягуванням, «Добавить фото» (кілька за раз) */
export function ImagesInput({ images, onChange }: { images: CaseImage[]; onChange: (imgs: CaseImage[]) => void }) {
  const [picking, setPicking] = useState(false);
  const dndId = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(images, images.findIndex((i) => i.src === active.id), images.findIndex((i) => i.src === over.id)));
  };
  return (
    <Field label={`Фото галереи · ${images.length}`} hint="Перетаскивайте миниатюры, чтобы поменять порядок слайдов.">
      {images.length > 0 && (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={images.map((i) => i.src)} strategy={rectSortingStrategy}>
            <div className={a.thumbs}>
              {images.map((img, i) => (
                <SortableThumb key={img.src} img={img} n={i + 1} onRemove={() => onChange(images.filter((x) => x.src !== img.src))} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <div className={a.imgActions}>
        <button type="button" className={a.btn} onClick={() => setPicking(true)}>
          <Icon name="plus" />
          Добавить фото
        </button>
      </div>
      {picking && (
        <MediaPicker
          multiple
          onClose={() => setPicking(false)}
          onPick={(items) => {
            const have = new Set(images.map((i) => i.src));
            onChange([...images, ...items.filter((m) => !have.has(m.url)).map(toImage)]);
            setPicking(false);
          }}
        />
      )}
    </Field>
  );
}
