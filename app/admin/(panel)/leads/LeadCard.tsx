"use client";

import { useState, useTransition } from "react";
import { deleteLead, setLeadNote, setLeadStatus } from "@/lib/server/admin/lead-actions";
import a from "../../admin.module.css";

import { STATUS_LABEL, type LeadStatusKey as Status } from "@/lib/leads";

export type LeadView = {
  id: string;
  topic: string;
  name: string;
  phone: string;
  telegram: string;
  question: string;
  page: string;
  status: Status;
  note: string;
  notified: boolean;
  createdAt: string;
};

/** Телеграм-контакт → посилання, якщо це схоже на @нік або t.me-адресу */
const tgHref = (v: string) => {
  const s = v.trim();
  if (/^https?:\/\//.test(s)) return s;
  if (/^@?[a-z0-9_]{4,}$/i.test(s)) return `https://t.me/${s.replace(/^@/, "")}`;
  return null;
};

/** Картка заявки: контакти, статус, нотатка менеджера */
export default function LeadCard({ lead }: { lead: LeadView }) {
  const [status, setStatus] = useState<Status>(lead.status);
  const [note, setNote] = useState(lead.note);
  const [savedNote, setSavedNote] = useState(lead.note);
  const [pending, start] = useTransition();
  const tg = lead.telegram ? tgHref(lead.telegram) : null;
  const when = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(
    new Date(lead.createdAt),
  );

  return (
    <article className={`${a.lead} ${status === "NEW" ? a.leadNew : ""}`}>
      <header className={a.leadHead}>
        <strong className={a.leadName}>{lead.name}</strong>
        <span className={a.muted}>{when}</span>
        <select
          className={a.select}
          style={{ width: "auto", marginLeft: "auto" }}
          value={status}
          disabled={pending}
          aria-label="Статус заявки"
          onChange={(e) => {
            const v = e.target.value as Status;
            setStatus(v);
            start(() => setLeadStatus(lead.id, v));
          }}
        >
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </header>
      <p className={a.leadTopic}>{lead.topic}</p>
      <dl className={a.dl}>
        <dt>Телефон</dt>
        <dd>
          <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} style={{ color: "var(--ink)" }}>
            {lead.phone}
          </a>
        </dd>
        {lead.telegram && (
          <>
            <dt>Телеграм</dt>
            <dd>
              {tg ? (
                <a href={tg} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink)" }}>
                  {lead.telegram}
                </a>
              ) : (
                lead.telegram
              )}
            </dd>
          </>
        )}
        {lead.question && (
          <>
            <dt>Вопрос</dt>
            <dd>{lead.question}</dd>
          </>
        )}
        {lead.page && (
          <>
            <dt>Страница</dt>
            <dd>{lead.page}</dd>
          </>
        )}
        <dt>Telegram-бот</dt>
        <dd>{lead.notified ? "доставлено" : "не отправлялось"}</dd>
      </dl>
      <textarea
        className={a.textarea}
        style={{ minHeight: 0 }}
        rows={2}
        value={note}
        placeholder="Заметка: перезвонить завтра, договорились о встрече…"
        aria-label="Заметка"
        maxLength={2000}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if (note === savedNote) return;
          setSavedNote(note);
          start(() => setLeadNote(lead.id, note));
        }}
      />
      <button
        type="button"
        className={a.btnDanger}
        style={{ alignSelf: "flex-end" }}
        onClick={() => {
          if (window.confirm(`Удалить заявку «${lead.name}»?`)) start(() => deleteLead(lead.id));
        }}
      >
        Удалить
      </button>
    </article>
  );
}
