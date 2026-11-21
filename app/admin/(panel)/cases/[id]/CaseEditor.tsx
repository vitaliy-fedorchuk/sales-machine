"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBlock, duplicateBlock, normalizeBlock, slugify, type EditorCase, type EditorIssue } from "@/lib/cases/editor";
import { CASE_CATEGORIES, type CaseBlock, type CaseBlockType } from "@/lib/cases/schema";
import { deleteCase, publishCase, saveCase, unpublishCase, type SaveResult } from "@/lib/server/admin/case-actions";
import type { HistoryEntry } from "@/lib/server/admin/history";
import { CATEGORIES } from "@/lib/pages/keysy";
import a from "../../../admin.module.css";
import { Icon } from "../../../icons";
import BlockList from "./BlockList";
import { Field, ImageInput, TextInput, Textarea } from "./fields";

type Status = "DRAFT" | "PUBLISHED";
type SaveState = "saved" | "dirty" | "saving" | "error";

const AUTOSAVE_MS = 1500;
const LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<string, string>;

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const SAVE_LABEL: Record<SaveState, string> = {
  saved: "Всё сохранено",
  dirty: "Есть несохранённые изменения",
  saving: "Сохраняем…",
  error: "Не удалось сохранить",
};

const ACTION_LABEL: Record<HistoryEntry["action"], string> = {
  CREATED: "создал(а)",
  EDITED: "редактировал(а)",
  PUBLISHED: "опубликовал(а)",
  UNPUBLISHED: "снял(а) с публикации",
};

const formatWhen = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export default function CaseEditor({
  id,
  initialStatus,
  initialCase,
  initialHistory,
}: {
  id: string;
  initialStatus: Status;
  initialCase: EditorCase;
  initialHistory: HistoryEntry[];
}) {
  const [c, setC] = useState<EditorCase>(() => ({ ...initialCase, blocks: initialCase.blocks.map(normalizeBlock) }));
  const [status, setStatus] = useState<Status>(initialStatus);
  const [history, setHistory] = useState(initialHistory);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [issues, setIssues] = useState<EditorIssue[]>([]);
  const [busy, setBusy] = useState(false);
  // Адреса йде за назвою, доки її не змінили вручну (і доки кейс не опублікований)
  const [slugLocked, setSlugLocked] = useState(() => initialStatus === "PUBLISHED" || !initialCase.slug.startsWith("chernovik-"));
  const [now, setNow] = useState(() => Date.now());

  const ref = useRef(c);
  const version = useRef(0);
  const saving = useRef<Promise<SaveResult | null> | null>(null);
  useEffect(() => {
    ref.current = c;
  }, [c]);

  // ---------- зміни ----------
  const clearIssues = (pred: (i: EditorIssue) => boolean) => setIssues((l) => (l.some(pred) ? l.filter((i) => !pred(i)) : l));

  const patch = useCallback((p: Partial<EditorCase>) => {
    version.current++;
    setC((x) => ({ ...x, ...p }));
    setSaveState("dirty");
    clearIssues((i) => !i.blockId && !!i.field && i.field in p);
  }, []);

  const setBlocks = (fn: (b: CaseBlock[]) => CaseBlock[]) => {
    version.current++;
    setC((x) => ({ ...x, blocks: fn(x.blocks) }));
    setSaveState("dirty");
    clearIssues((i) => i.field === "blocks");
  };

  const onTitle = (title: string) => patch(slugLocked || !slugify(title) ? { title } : { title, slug: slugify(title) });

  const onBlockChange = (block: CaseBlock) => {
    setBlocks((l) => l.map((b) => (b.id === block.id ? block : b)));
    clearIssues((i) => i.blockId === block.id);
  };

  const onInsert = (index: number, type: CaseBlockType) => {
    const block = createBlock(type);
    setBlocks((l) => [...l.slice(0, index), block, ...l.slice(index)]);
    requestAnimationFrame(() => {
      const el = document.getElementById(`block-${block.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("textarea, input, select")?.focus({ preventScroll: true });
    });
  };

  const onMove = (from: number, to: number) =>
    setBlocks((l) => {
      if (to < 0 || to >= l.length) return l;
      const n = [...l];
      const [m] = n.splice(from, 1);
      n.splice(to, 0, m);
      return n;
    });

  // ---------- збереження ----------
  const applyResult = useCallback((res: SaveResult, v: number) => {
    if (res.ok) {
      setNow(Date.now());
      setStatus(res.status);
      setHistory(res.history);
      setIssues([]);
      setSaveState(version.current === v ? "saved" : "dirty");
      setC((x) => (x.publishedAt === res.publishedAt ? x : { ...x, publishedAt: res.publishedAt }));
    } else {
      setIssues(res.issues);
      setSaveState("error");
      requestAnimationFrame(() => {
        const first = res.issues[0];
        const el = first?.blockId ? document.getElementById(`block-${first.blockId}`) : document.getElementById("case-issues");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
    return res;
  }, []);

  const run = useCallback(
    async (action: (x: EditorCase) => Promise<SaveResult>) => {
      while (saving.current) await saving.current;
      const v = version.current;
      setSaveState("saving");
      const p = action(ref.current).catch(() => null);
      saving.current = p;
      const res = await p;
      saving.current = null;
      if (!res) {
        setSaveState("error");
        setIssues([{ message: "Нет связи с сервером. Изменения не сохранены — попробуйте ещё раз." }]);
        return null;
      }
      return applyResult(res, v);
    },
    [applyResult],
  );

  const save = useCallback(() => run((x) => saveCase(id, x)), [id, run]);

  // Автозбереження — лише для чернеток: опублікований кейс змінюється на сайті тільки після «Обновить»
  useEffect(() => {
    if (status !== "DRAFT" || saveState !== "dirty") return;
    const t = setTimeout(save, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [c, status, saveState, save]);

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
    if (saveState === "saved") return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [saveState]);

  const withBusy = async <T,>(fn: () => Promise<T>) => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  };

  const onPublish = () => withBusy(() => run((x) => publishCase(id, x)));
  const onUnpublish = () => {
    if (!window.confirm("Снять кейс с публикации? Он исчезнет с сайта и станет черновиком.")) return;
    return withBusy(() => run(() => unpublishCase(id)));
  };
  const onPreview = async () => {
    const win = window.open("about:blank", "_blank");
    if (saveState !== "saved") await save();
    if (win) win.location.href = `/preview/${id}`;
  };

  // ---------- похідне ----------
  const state = status === "DRAFT" ? "draft" : c.publishedAt && new Date(c.publishedAt).getTime() > now ? "scheduled" : "published";
  const STATE = { draft: "Черновик", published: "Опубликован", scheduled: "Запланирован" };
  const blockErrors = useMemo(() => Object.fromEntries(issues.filter((i) => i.blockId).map((i) => [i.blockId!, i.message])), [issues]);
  const fieldError = (f: string) => issues.find((i) => !i.blockId && i.field === f)?.message;
  const future = c.publishedAt && new Date(c.publishedAt).getTime() > now;

  return (
    <div>
      <div className={a.edBar}>
        <Link href="/admin/cases" className={a.edBack}>
          <Icon name="back" />
          Кейсы
        </Link>
        <span className={`${a.badge} ${state === "published" ? a.badgePublished : state === "scheduled" ? a.badgeScheduled : ""}`}>{STATE[state]}</span>
        <span className={`${a.edSave} ${saveState === "error" ? a.edSaveError : ""}`} aria-live="polite">
          {SAVE_LABEL[saveState]}
        </span>
        <div className={a.edActions}>
          <button type="button" className={a.btn} onClick={onPreview}>
            <Icon name="eye" />
            Просмотр
          </button>
          {status === "DRAFT" ? (
            <>
              <button type="button" className={a.btn} onClick={save} disabled={saveState === "saving"}>
                Сохранить
              </button>
              <button type="button" className={a.btnPrimary} onClick={onPublish} disabled={busy}>
                {future ? "Запланировать" : "Опубликовать"}
              </button>
            </>
          ) : (
            <button type="button" className={a.btnPrimary} onClick={save} disabled={busy || saveState === "saving" || saveState === "saved"}>
              Обновить на сайте
            </button>
          )}
        </div>
      </div>

      {issues.length > 0 && (
        <div className={a.issues} id="case-issues" role="alert">
          <p>{status === "DRAFT" ? "Чтобы опубликовать, исправьте:" : "Изменения не сохранены — исправьте:"}</p>
          <ul>
            {issues.map((i, n) => (
              <li key={n}>{i.blockId ? <a href={`#block-${i.blockId}`}>{i.message}</a> : i.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={a.edLayout}>
        <div className={a.edMain}>
          <div className={fieldError("title") ? a.hasError : ""}>
            <textarea
              className={a.titleInput}
              value={c.title}
              rows={1}
              placeholder="Заголовок кейса"
              aria-label="Заголовок кейса"
              maxLength={300}
              onChange={(e) => onTitle(e.target.value.replace(/\n/g, " "))}
            />
            {fieldError("title") && <p className={a.fieldError}>{fieldError("title")}</p>}
          </div>
          {fieldError("blocks") && <p className={a.fieldError}>{fieldError("blocks")}</p>}
          <BlockList
            blocks={c.blocks}
            errors={blockErrors}
            onChange={onBlockChange}
            onInsert={onInsert}
            onMove={onMove}
            onDuplicate={(i) => setBlocks((l) => [...l.slice(0, i + 1), duplicateBlock(l[i]), ...l.slice(i + 1)])}
            onRemove={(i) => setBlocks((l) => l.filter((_, j) => j !== i))}
          />
        </div>

        <aside className={a.edSide}>
          <section className={a.card}>
            <h2 className={a.cardTitle}>Публикация</h2>
            <Field
              label="Дата публикации"
              hint={status === "DRAFT" ? "Пусто — опубликуется сразу. Дата в будущем — кейс появится тогда." : "Дата в будущем спрячет кейс до этого времени."}
            >
              <input type="datetime-local" className={a.input} value={toLocalInput(c.publishedAt)} onChange={(e) => patch({ publishedAt: fromLocalInput(e.target.value) })} />
            </Field>
            {status === "PUBLISHED" && (
              <button type="button" className={a.linkBtn} onClick={onUnpublish} disabled={busy}>
                Снять с публикации
              </button>
            )}
          </section>

          <section className={a.card}>
            <h2 className={a.cardTitle}>Адрес</h2>
            <Field label="Адрес страницы" error={fieldError("slug")}>
              <div className={a.slug}>
                <span className={a.slugPrefix}>/stati/</span>
                <input
                  className={a.input}
                  value={c.slug}
                  aria-label="Адрес страницы"
                  onChange={(e) => {
                    setSlugLocked(true);
                    patch({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                  }}
                />
              </div>
            </Field>
            <button
              type="button"
              className={a.linkBtn}
              onClick={() => {
                if (status === "PUBLISHED" && !window.confirm("Кейс уже опубликован: старые ссылки на него перестанут работать. Изменить?")) return;
                patch({ slug: slugify(c.title) });
              }}
            >
              Сгенерировать из заголовка
            </button>
          </section>

          <section className={a.card}>
            <h2 className={a.cardTitle}>Категории на /keysy</h2>
            <div className={a.chips} role="group" aria-label="Категории">
              {CASE_CATEGORIES.map((cat) => {
                const on = c.cats.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${a.chip} ${on ? a.chipOn : ""}`}
                    aria-pressed={on}
                    onClick={() => patch({ cats: on ? c.cats.filter((x) => x !== cat) : [...c.cats, cat] })}
                  >
                    {LABEL[cat] ?? cat}
                  </button>
                );
              })}
            </div>
            <p className={a.fieldHint}>Первая выбранная — раздел, где кейс стоит на /keysy; остальные видны в подписи карточки.</p>
            {fieldError("cats") && <p className={a.fieldError}>{fieldError("cats")}</p>}
          </section>

          <section className={a.card}>
            <h2 className={a.cardTitle}>Кнопка внизу</h2>
            <TextInput label="Текст кнопки" value={c.cta} placeholder="Клик, который поможет бизнесу" maxLength={120} onChange={(cta) => patch({ cta })} />
          </section>

          <details className={a.card}>
            <summary className={a.cardTitle}>Поиск и соцсети ▾</summary>
            <TextInput
              label="Заголовок для Google"
              value={c.seoTitle}
              placeholder={c.title || "Как заголовок кейса"}
              hint={`${c.seoTitle.length}/60 — пусто: заголовок кейса`}
              onChange={(seoTitle) => patch({ seoTitle })}
            />
            <Textarea
              label="Описание"
              value={c.description}
              rows={3}
              maxLength={400}
              hint={`${c.description.length}/160 — показывается в Google и в превью ссылки`}
              onChange={(description) => patch({ description })}
            />
            <ImageInput
              label="Картинка для соцсетей"
              image={c.coverSrc ? { src: c.coverSrc, alt: c.coverAlt, width: 0, height: 0 } : null}
              onChange={(img) => patch({ coverSrc: img?.src ?? "", coverAlt: img?.alt ?? "" })}
            />
          </details>

          <details className={a.card} open>
            <summary className={a.cardTitle}>История изменений ▾</summary>
            {history.length === 0 ? (
              <p className={a.muted}>Записей пока нет</p>
            ) : (
              <ol className={a.history}>
                {history.map((h) => (
                  <li key={h.id}>
                    <b>{h.userName ?? "Кто-то"}</b> {ACTION_LABEL[h.action]}
                    <time dateTime={h.at}>{formatWhen(h.at)}</time>
                  </li>
                ))}
              </ol>
            )}
          </details>

          <form
            action={deleteCase.bind(null, id)}
            onSubmit={(e) => {
              if (!window.confirm("Удалить кейс навсегда? Это нельзя отменить.")) e.preventDefault();
            }}
          >
            <button type="submit" className={a.btnDanger}>
              Удалить кейс
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
