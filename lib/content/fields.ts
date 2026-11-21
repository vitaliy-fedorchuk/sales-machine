import { z } from "zod";
import { caseImageSchema, type CaseImage } from "@/lib/cases/schema";

/*
 * Опис полів вмісту сторінки. З одного опису будуються:
 *  - zod-схема (перевірка при збереженні в адмінці й при читанні на сайті) — schemaOf();
 *  - форма в адмінці (app/admin/(panel)/content/ContentForm.tsx).
 * Тип даних у коді сторінки — з defaults (вони ж показуються, поки в базі нічого не змінено).
 */

type Base = { key: string; label: string; hint?: string };

export type Field =
  | (Base & { kind: "text"; max?: number; required?: boolean; placeholder?: string })
  | (Base & { kind: "textarea"; max?: number; required?: boolean; rows?: number; rich?: boolean })
  /** Посилання: https://…, /сторінка, mailto:, tel: */
  | (Base & { kind: "url"; required?: boolean; placeholder?: string })
  /** Фото з медіатеки: { src, alt, width, height } або null */
  | (Base & { kind: "image"; required?: boolean })
  | (Base & { kind: "select"; options: readonly { value: string; label: string }[] })
  | (Base & { kind: "boolean" })
  /** Список рядків (абзаци, тези) */
  | (Base & { kind: "strings"; item: string; max?: number; rows?: number; min?: number })
  /** Вкладена група полів */
  | (Base & { kind: "group"; fields: readonly Field[] })
  /** Список однакових записів (статті, люди, нагороди) — з перетягуванням */
  | (Base & {
      kind: "list";
      fields: readonly Field[];
      /** Підпис запису в згорнутому вигляді: ключ поля, яке показувати */
      title: string;
      /** Додатковий підпис (дрібно): ключ поля */
      subtitle?: string;
      item: string;
      max?: number;
      /** Нові записи — зверху (статті, нагороди) чи знизу */
      addTo?: "start" | "end";
    });

const URL_RE = /^(https?:\/\/|\/|#|mailto:|tel:)\S*$/;

export const fieldSchema = (f: Field): z.ZodType => {
  switch (f.kind) {
    case "text":
    case "textarea": {
      const s = z.string().trim().max(f.max ?? (f.kind === "text" ? 300 : 5000));
      return f.required ? s.min(1, `Заполните «${f.label}»`) : s;
    }
    case "url": {
      const s = z.string().trim().max(1000);
      return f.required
        ? s.regex(URL_RE, `«${f.label}»: нужна ссылка вида https://…`)
        : s.refine((v) => v === "" || URL_RE.test(v), `«${f.label}»: нужна ссылка вида https://…`);
    }
    case "image":
      return f.required ? caseImageSchema : caseImageSchema.nullable();
    case "select":
      return z.enum(f.options.map((o) => o.value) as [string, ...string[]]);
    case "boolean":
      return z.boolean();
    case "strings":
      return z.array(z.string().trim().min(1, `«${f.label}»: пустая строка`).max(5000)).min(f.min ?? 0).max(f.max ?? 100);
    case "group":
      return objectSchema(f.fields);
    case "list":
      return z.array(objectSchema(f.fields)).max(f.max ?? 500);
  }
};

export const objectSchema = (fields: readonly Field[]) =>
  z.object(Object.fromEntries(fields.map((f) => [f.key, fieldSchema(f)])));

/** Порожнє значення поля — для нового запису списку */
export const emptyValue = (f: Field): unknown => {
  switch (f.kind) {
    case "text":
    case "textarea":
    case "url":
      return "";
    case "image":
      return null;
    case "select":
      return f.options[0]?.value ?? "";
    case "boolean":
      return false;
    case "strings":
      return f.min ? [""] : [];
    case "group":
      return emptyObject(f.fields);
    case "list":
      return [];
  }
};

export const emptyObject = (fields: readonly Field[]) => Object.fromEntries(fields.map((f) => [f.key, emptyValue(f)]));

/** Фото зі старих даних ({ src, w, h }) → формат медіатеки */
export const img = (src: string, width: number, height: number, alt = ""): CaseImage => ({ src, alt, width, height });

export type ContentDef<T = unknown> = {
  key: string;
  /** Назва в адмінці */
  title: string;
  /** Розділ меню адмінки */
  group: "Страницы" | "Списки" | "Настройки";
  /** Підказка під назвою */
  hint?: string;
  /** Які сторінки сайту оновити після збереження ("layout" — увесь сайт) */
  paths: readonly string[];
  fields: readonly Field[];
  /** Поточний вміст із коду — показується, поки в базі нічого не змінено */
  defaults: T;
};

export const defineContent = <T>(def: ContentDef<T>) => def;
