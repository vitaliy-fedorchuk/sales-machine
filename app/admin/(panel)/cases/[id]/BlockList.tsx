"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_TYPES } from "@/lib/cases/editor";
import type { CaseBlock, CaseBlockType } from "@/lib/cases/schema";
import a from "../../../admin.module.css";
import { Icon } from "../../../icons";
import { BLOCK_INFO, BlockFields } from "./BlockFields";

interface Props {
  blocks: CaseBlock[];
  errors: Record<string, string>;
  onChange: (block: CaseBlock) => void;
  onInsert: (index: number, type: CaseBlockType) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
}

/** Вікно вибору типу блоку */
function BlockPicker({ onPick, onClose }: { onPick: (t: CaseBlockType) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} className={`${a.modal} ${a.modalSmall}`} onClose={onClose} onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()} aria-label="Добавить блок">
      <div className={a.modalHead}>
        <h2 className={a.modalTitle}>Добавить блок</h2>
        <button type="button" className={a.iconBtn} onClick={() => ref.current?.close()} aria-label="Закрыть">
          <Icon name="close" />
        </button>
      </div>
      <div className={`${a.modalBody} ${a.pickerGrid}`}>
        {BLOCK_TYPES.map((t) => (
          <button key={t} type="button" className={a.pickerItem} onClick={() => onPick(t)}>
            <strong>{BLOCK_INFO[t].label}</strong>
            <span>{BLOCK_INFO[t].hint}</span>
          </button>
        ))}
      </div>
    </dialog>
  );
}

function Inserter({ onOpen }: { onOpen: () => void }) {
  return (
    <div className={a.inserter}>
      <button type="button" onClick={onOpen} title="Добавить блок сюда" aria-label="Добавить блок сюда">
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 1v10M1 6h10" />
        </svg>
      </button>
    </div>
  );
}

function BlockCard({
  block,
  index,
  total,
  error,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: Omit<Props, "blocks" | "errors" | "onInsert"> & { block: CaseBlock; index: number; total: number; error?: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const info = BLOCK_INFO[block.type];
  return (
    <section
      ref={setNodeRef}
      id={`block-${block.id}`}
      className={`${a.block} ${isDragging ? a.blockDragging : ""} ${error ? a.blockHasError : ""}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      aria-label={info.label}
    >
      <header className={a.blockHead}>
        <button type="button" ref={setActivatorNodeRef} className={a.handle} title="Перетащить" {...attributes} {...listeners}>
          <Icon name="grip" />
        </button>
        <span className={a.blockType}>
          <span className={a.blockNum}>{String(index + 1).padStart(2, "0")}</span>
          {info.label}
          {block.type === "text" && block.label ? <span className={a.blockNum}>· {block.label}</span> : null}
        </span>
        <div className={a.blockActions}>
          <button type="button" className={a.iconBtn} onClick={() => onMove(index, index - 1)} disabled={index === 0} title="Выше">
            <Icon name="up" />
          </button>
          <button type="button" className={a.iconBtn} onClick={() => onMove(index, index + 1)} disabled={index === total - 1} title="Ниже">
            <Icon name="down" />
          </button>
          <button type="button" className={a.iconBtn} onClick={() => onDuplicate(index)} title="Дублировать">
            <Icon name="copy" />
          </button>
          <button
            type="button"
            className={a.iconBtn}
            title="Удалить"
            onClick={() => window.confirm(`Удалить блок «${info.label}»?`) && onRemove(index)}
          >
            <Icon name="trash" />
          </button>
        </div>
      </header>
      <div className={a.blockBody}>
        <BlockFields block={block} onChange={onChange} />
        {error && (
          <p className={a.blockError} role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

export default function BlockList({ blocks, errors, onChange, onInsert, onMove, onDuplicate, onRemove }: Props) {
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onMove(blocks.findIndex((b) => b.id === active.id), blocks.findIndex((b) => b.id === over.id));
  };

  return (
    <div className={a.blocks}>
      <DndContext id="case-blocks" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block, i) => (
            <Fragment key={block.id}>
              <Inserter onOpen={() => setInsertAt(i)} />
              <BlockCard
                block={block}
                index={i}
                total={blocks.length}
                error={errors[block.id]}
                onChange={onChange}
                onMove={onMove}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
              />
            </Fragment>
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && <p className={a.empty}>Кейс пока пустой. Начните с блока «Текст» с заголовком «Задача».</p>}
      <button type="button" className={a.addBlock} onClick={() => setInsertAt(blocks.length)}>
        <Icon name="plus" />
        Добавить блок
      </button>

      {insertAt !== null && (
        <BlockPicker
          onClose={() => setInsertAt(null)}
          onPick={(t) => {
            onInsert(insertAt, t);
            setInsertAt(null);
          }}
        />
      )}
    </div>
  );
}
