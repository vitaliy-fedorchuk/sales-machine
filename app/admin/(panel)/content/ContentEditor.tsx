"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CaseImage } from "@/lib/cases/schema";
import { emptyObject, type Field } from "@/lib/content/fields";
import { contentDef, NETWORK_LABEL } from "@/lib/content/registry";
import { resetContent, saveContent } from "@/lib/server/admin/content-actions";
import a from "../../admin.module.css";
import { Icon } from "../../icons";
import { ImageInput } from "../cases/[id]/fields";

type Obj = Record<string, unknown>;
type Errors = Record<string, string>;

/* ---------- окремі поля ---------- */

function FieldBox({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`${a.field} ${error ? a.hasError : ""}`}>
      <span className={a.fieldLabel}>{label}</span>
      {children}
      {hint && <p className={a.fieldHint}>{hint}</p>}
      {error && <p className={a.fieldError}>{error}</p>}
    </div>
  );
}

const autosize = { fieldSizing: "content" } as React.CSSProperties;

function StringsField({ f, value, onChange, error }: { f: Extract<Field, { kind: "strings" }>; value: string[]; onChange: (v: string[]) => void; error?: string }) {
  return (
    <FieldBox label={f.label} hint={f.hint} error={error}>
      <div className={a.repeat}>
        {value.map((s, i) => (
          <div key={i} className={a.repeatRow}>
            <textarea className={a.textarea} style={{ ...autosize, minHeight: 0 }} rows={f.rows ?? 2} value={s} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`${f.label} ${i + 1}`} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button type="button" className={a.iconBtn} title="Выше" disabled={i === 0} onClick={() => onChange(arrayMove(value, i, i - 1))}>
                <Icon name="up" />
              </button>
              <button type="button" className={a.iconBtn} title="Ниже" disabled={i === value.length - 1} onClick={() => onChange(arrayMove(value, i, i + 1))}>
                <Icon name="down" />
              </button>
              <button type="button" className={a.iconBtn} title="Удалить" disabled={value.length <= (f.min ?? 0)} onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <Icon name="trash" />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className={a.btn} style={{ alignSelf: "flex-start" }} onClick={() => onChange([...value, ""])}>
          <Icon name="plus" />
          Добавить {f.item}
        </button>
      </div>
    </FieldBox>
  );
}

/** Підпис запису в згорнутому списку */
const itemTitle = (f: Extract<Field, { kind: "list" }>, item: Obj) => {
  const v = item[f.title];
  const t = typeof v === "string" ? (f.title === "network" ? NETWORK_LABEL[v] ?? v : v) : "";
  return t.trim() || "Без названия";
};

function SortableItem({
  id,
  f,
  item,
  index,
  open,
  onToggle,
  onChange,
  onRemove,
  onDuplicate,
  errors,
  path,
}: {
  id: string;
  f: Extract<Field, { kind: "list" }>;
  item: Obj;
  index: number;
  open: boolean;
  onToggle: () => void;
  onChange: (v: Obj) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  errors: Errors;
  path: string;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const hasError = Object.keys(errors).some((k) => k.startsWith(`${path}.${index}.`));
  const sub = f.subtitle ? String(item[f.subtitle] ?? "") : "";
  const badgeField = f.badge ? f.fields.find((x) => x.key === f.badge) : undefined;
  const badge =
    badgeField?.kind === "select" ? badgeField.options.find((o) => o.value === item[f.badge!])?.label.split(" —")[0] : undefined;
  return (
    <section
      ref={setNodeRef}
      className={`${a.block} ${isDragging ? a.blockDragging : ""} ${hasError ? a.blockHasError : ""}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {/* мишкою тягнути можна за весь рядок; з клавіатури — за ручку */}
      <header className={`${a.blockHead} ${a.dragHead}`} onPointerDown={listeners?.onPointerDown as React.PointerEventHandler | undefined}>
        <button type="button" ref={setActivatorNodeRef} className={a.handle} title="Перетащить" {...attributes} onKeyDown={listeners?.onKeyDown as React.KeyboardEventHandler | undefined}>
          <Icon name="grip" />
        </button>
        <button type="button" className={a.itemToggle} onClick={onToggle} aria-expanded={open}>
          <span className={a.blockNum}>{String(index + 1).padStart(2, "0")}</span>
          <span className={a.itemTitle}>{itemTitle(f, item)}</span>
          {badge && <span className={a.itemBadge}>{badge}</span>}
          {sub && <span className={a.itemSub}>{sub}</span>}
          <span className={a.itemChevron} aria-hidden="true">{open ? "▴" : "▾"}</span>
        </button>
        <div className={a.blockActions}>
          <button type="button" className={a.iconBtn} title="Дублировать" onClick={onDuplicate}>
            <Icon name="copy" />
          </button>
          <button type="button" className={a.iconBtn} title="Удалить" onClick={() => window.confirm(`Удалить «${itemTitle(f, item)}»?`) && onRemove()}>
            <Icon name="trash" />
          </button>
        </div>
      </header>
      {open && (
        <div className={a.blockBody}>
          <Fields fields={f.fields} value={item} onChange={onChange} errors={errors} path={`${path}.${index}`} />
        </div>
      )}
    </section>
  );
}

function ListField({ f, value, onChange, errors, path }: { f: Extract<Field, { kind: "list" }>; value: Obj[]; onChange: (v: Obj[]) => void; errors: Errors; path: string }) {
  // Стабільні id для перетягування (дані з бази їх не мають)
  const ids = useRef<string[]>([]);
  const counter = useRef(0);
  while (ids.current.length < value.length) ids.current.push(`i${counter.current++}`);
  ids.current.length = value.length;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Помилка в записі — розкрити його
  useEffect(() => {
    const withErr = value.map((_, i) => i).filter((i) => Object.keys(errors).some((k) => k.startsWith(`${path}.${i}.`)));
    if (withErr.length) setOpen((s) => new Set([...s, ...withErr.map((i) => ids.current[i])]));
  }, [errors, path, value]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.current.indexOf(String(active.id));
    const to = ids.current.indexOf(String(over.id));
    ids.current = arrayMove(ids.current, from, to);
    onChange(arrayMove(value, from, to));
  };

  const add = () => {
    const item = emptyObject(f.fields) as Obj;
    const id = `i${counter.current++}`;
    if (f.addTo === "start") {
      ids.current = [id, ...ids.current];
      onChange([item, ...value]);
    } else {
      ids.current = [...ids.current, id];
      onChange([...value, item]);
    }
    setOpen((s) => new Set(s).add(id));
  };

  const query = q.trim().toLowerCase();
  const visible = value.map((item, i) => ({ item, i })).filter(({ item }) => !query || JSON.stringify(item).toLowerCase().includes(query));

  return (
    <FieldBox label={`${f.label} · ${value.length}`} hint={f.hint} error={errors[path]}>
      <div className={a.toolbar} style={{ marginBottom: 0 }}>
        <button type="button" className={a.btnPrimary} onClick={add}>
          <Icon name="plus" />
          Добавить {f.item}
        </button>
        {value.length > 8 && <input className={a.input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по списку" aria-label="Поиск по списку" />}
        <button type="button" className={a.linkBtn} onClick={() => setOpen(open.size ? new Set() : new Set(ids.current))}>
          {open.size ? "Свернуть все" : "Развернуть все"}
        </button>
      </div>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={visible.map(({ i }) => ids.current[i])} strategy={verticalListSortingStrategy}>
          <div className={a.repeat}>
            {visible.map(({ item, i }) => {
              const id = ids.current[i];
              return (
                <SortableItem
                  key={id}
                  id={id}
                  f={f}
                  item={item}
                  index={i}
                  open={open.has(id)}
                  onToggle={() => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
                  onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
                  onRemove={() => {
                    ids.current = ids.current.filter((_, j) => j !== i);
                    onChange(value.filter((_, j) => j !== i));
                  }}
                  onDuplicate={() => {
                    const nid = `i${counter.current++}`;
                    ids.current = [...ids.current.slice(0, i + 1), nid, ...ids.current.slice(i + 1)];
                    onChange([...value.slice(0, i + 1), structuredClone(item), ...value.slice(i + 1)]);
                    setOpen((s) => new Set(s).add(nid));
                  }}
                  errors={errors}
                  path={path}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </FieldBox>
  );
}

/** Поля об'єкта — рекурсивно */
function Fields({ fields, value, onChange, errors, path }: { fields: readonly Field[]; value: Obj; onChange: (v: Obj) => void; errors: Errors; path: string }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <>
      {fields.map((f) => {
        const p = path ? `${path}.${f.key}` : f.key;
        const v = value[f.key];
        const err = errors[p];
        switch (f.kind) {
          case "text":
          case "url":
            return (
              <FieldBox key={f.key} label={f.label} hint={f.hint} error={err}>
                <input className={a.input} value={String(v ?? "")} placeholder={"placeholder" in f ? f.placeholder : undefined} maxLength={f.kind === "text" ? f.max ?? 300 : 4000} onChange={(e) => set(f.key, e.target.value)} aria-label={f.label} />
              </FieldBox>
            );
          case "textarea":
            return (
              <FieldBox key={f.key} label={f.label} hint={f.hint} error={err}>
                <textarea className={a.textarea} style={{ ...autosize, minHeight: 0 }} rows={f.rows ?? 3} value={String(v ?? "")} maxLength={f.max ?? 5000} onChange={(e) => set(f.key, e.target.value)} aria-label={f.label} />
              </FieldBox>
            );
          case "image":
            return (
              <div key={f.key}>
                <ImageInput label={f.label} image={(v as CaseImage | null) ?? null} onChange={(img) => set(f.key, img)} error={err ?? errors[`${p}.src`]} />
                {f.hint && <p className={a.fieldHint}>{f.hint}</p>}
              </div>
            );
          case "select":
            return (
              <FieldBox key={f.key} label={f.label} hint={f.hint} error={err}>
                <select className={a.select} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)}>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldBox>
            );
          case "boolean":
            return (
              <label key={f.key} className={a.check}>
                <input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} />
                {f.label}
              </label>
            );
          case "strings":
            return <StringsField key={f.key} f={f} value={(v as string[]) ?? []} onChange={(x) => set(f.key, x)} error={err ?? Object.entries(errors).find(([k]) => k.startsWith(`${p}.`))?.[1]} />;
          case "group":
            return (
              <section key={f.key} className={a.card}>
                <h3 className={a.cardTitle}>{f.label}</h3>
                {f.hint && <p className={a.fieldHint}>{f.hint}</p>}
                <Fields fields={f.fields} value={(v as Obj) ?? {}} onChange={(x) => set(f.key, x)} errors={errors} path={p} />
              </section>
            );
          case "list":
            return <ListField key={f.key} f={f} value={(v as Obj[]) ?? []} onChange={(x) => set(f.key, x)} errors={errors} path={p} />;
        }
      })}
    </>
  );
}

/* ---------- редактор розділу ---------- */

type SaveState = "saved" | "dirty" | "saving" | "error";

export default function ContentEditor({
  contentKey,
  initial,
  saved,
  updatedAt,
  updatedBy,
}: {
  contentKey: string;
  initial: Obj;
  /** Чи є збережена версія (інакше — тексти з коду) */
  saved: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}) {
  const def = contentDef(contentKey)!;
  const [value, setValue] = useState<Obj>(initial);
  const [state, setState] = useState<SaveState>("saved");
  const [errors, setErrors] = useState<Errors>({});
  const [errorList, setErrorList] = useState<{ path: string; message: string }[]>([]);
  const [meta, setMeta] = useState({ saved, updatedAt, updatedBy });

  const onChange = (v: Obj) => {
    setValue(v);
    setState("dirty");
  };

  const save = useCallback(async () => {
    setState("saving");
    const res = await saveContent(contentKey, value).catch(() => null);
    if (!res) {
      setState("error");
      setErrorList([{ path: "", message: "Нет связи с сервером — изменения не сохранены" }]);
      return;
    }
    if (res.ok) {
      setState("saved");
      setErrors({});
      setErrorList([]);
      setMeta({ saved: true, updatedAt: res.updatedAt, updatedBy: "вы" });
    } else {
      setState("error");
      setErrors(Object.fromEntries(res.errors.map((e) => [e.path, e.message])));
      setErrorList(res.errors);
      requestAnimationFrame(() => document.getElementById("content-issues")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
  }, [contentKey, value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  useEffect(() => {
    if (state === "saved") return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [state]);

  const reset = async () => {
    if (!window.confirm("Вернуть тексты, которые были на сайте изначально? Все правки этого раздела удалятся.")) return;
    await resetContent(contentKey);
    window.location.reload();
  };

  const LABEL: Record<SaveState, string> = { saved: "Всё сохранено", dirty: "Есть несохранённые изменения", saving: "Сохраняем…", error: "Не сохранено" };
  const viewPath = def.paths.find((p) => p.startsWith("/"));
  const when = useMemo(
    () => (meta.updatedAt ? new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(meta.updatedAt)) : null),
    [meta.updatedAt],
  );

  return (
    <div>
      <div className={a.edBar}>
        <Link href="/admin/content" className={a.edBack}>
          <Icon name="back" />
          Разделы
        </Link>
        <span className={`${a.edSave} ${state === "error" ? a.edSaveError : ""}`} aria-live="polite">
          {LABEL[state]}
        </span>
        <div className={a.edActions}>
          {viewPath && (
            <a className={a.btn} href={viewPath} target="_blank" rel="noopener noreferrer">
              <Icon name="eye" />
              Открыть на сайте
            </a>
          )}
          <button type="button" className={a.btnPrimary} onClick={save} disabled={state === "saving" || state === "saved"}>
            Сохранить
          </button>
        </div>
      </div>

      <div className={a.pageHead}>
        <div>
          <h1 className={a.h1}>{def.title}</h1>
          {def.hint && <p className={a.muted} style={{ margin: "10px 0 0", maxWidth: 640 }}>{def.hint}</p>}
        </div>
        <p className={a.muted} style={{ margin: 0, textAlign: "right" }}>
          {meta.saved ? (
            <>
              Изменено {when}
              {meta.updatedBy ? ` · ${meta.updatedBy}` : ""}
              <br />
              <button type="button" className={a.linkBtn} onClick={reset}>
                Вернуть исходные тексты
              </button>
            </>
          ) : (
            "Пока исходные тексты сайта"
          )}
        </p>
      </div>

      {errorList.length > 0 && (
        <div className={a.issues} id="content-issues" role="alert">
          <p>Изменения не сохранены — исправьте:</p>
          <ul>
            {errorList.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={a.contentForm}>
        <Fields fields={def.fields} value={value} onChange={onChange} errors={errors} path="" />
      </div>
    </div>
  );
}
