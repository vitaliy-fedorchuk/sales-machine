"use client";

import { usePathname } from "next/navigation";
import { useActionState, useId } from "react";
import { sendLead, type LeadState } from "@/app/(inner)/kurs/actions";
import { CONTACTS } from "@/lib/contacts";
import { KURS_FORMS } from "@/lib/pages/kurs";
import styles from "./LeadForm.module.css";

type Field = "name" | "phone" | "telegram" | "question";

const FIELDS: Record<Field, { label: string; type: string; auto?: string; required?: boolean }> = {
  name: { label: "Имя и фамилия", type: "text", auto: "name", required: true },
  phone: { label: "Номер телефона", type: "tel", auto: "tel", required: true },
  telegram: { label: "Телеграм аккаунт или номер", type: "text" },
  question: { label: "Опишите кратко суть вопроса", type: "text" },
};

const INITIAL: LeadState = { status: "idle" };

/** Форма заявки (Server Action → Telegram). Поля підпираються «плаваючими» підписами. */
export default function LeadForm({
  title,
  sub,
  topic,
  fields = ["name", "phone", "telegram"],
}: {
  title: string;
  sub: string;
  topic: string;
  fields?: Field[];
}) {
  const [state, action, pending] = useActionState(sendLead, INITIAL);
  const uid = useId();
  const pathname = usePathname();

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <p className={styles.title}>{title}</p>
        <p className={styles.sub}>{sub}</p>
      </div>

      {state.status === "ok" ? (
        <p className={styles.done} role="status">{KURS_FORMS.done}</p>
      ) : (
        <form action={action} className={styles.form}>
          <input type="hidden" name="topic" value={topic} />
          <input type="hidden" name="page" value={pathname} />
          {/* honeypot — для людей невидиме */}
          <input className={styles.hp} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {fields.map((f) => {
            const c = FIELDS[f];
            const id = `${uid}-${f}`;
            return (
              <div key={f} className={styles.field}>
                <input
                  id={id}
                  className={styles.input}
                  name={f}
                  type={c.type}
                  autoComplete={c.auto}
                  required={c.required}
                  maxLength={256}
                  placeholder=" "
                />
                <label htmlFor={id} className={styles.label}>{c.label}</label>
              </div>
            );
          })}
          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? "Отправляем…" : "Отправить"}
          </button>
          {state.status === "error" && (
            <p className={styles.fail} role="alert">{state.message ?? KURS_FORMS.fail}</p>
          )}
          <p className={styles.legal}>
            Нажимая «Отправить», вы соглашаетесь с{" "}
            <a href={CONTACTS.privacyHref}>политикой обработки персональных данных</a>
          </p>
        </form>
      )}
    </div>
  );
}
