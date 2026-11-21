"use server";

import { db } from "@/lib/server/db";

export type LeadState = { status: "idle" | "ok" | "error"; message?: string };

const FIELDS: Record<string, string> = {
  name: "Имя",
  phone: "Телефон",
  telegram: "Телеграм",
  question: "Суть вопроса",
};

const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim().slice(0, 500);

/**
 * Заявка з форми сайту: зберігається в базі (адмінка → «Заявки»), а якщо задано TELEGRAM_BOT_TOKEN
 * і TELEGRAM_CHAT_ID — ще й приходить повідомленням у Telegram.
 */
export async function sendLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  if (clean(form.get("website"))) return { status: "ok" }; // honeypot: боти заповнюють приховане поле

  const topic = clean(form.get("topic")) || "Курс «Иммерсивный маркетинг»";
  const name = clean(form.get("name"));
  const phone = clean(form.get("phone"));
  if (!name || phone.replace(/\D/g, "").length < 6) {
    return { status: "error", message: "Укажите имя и номер телефона" };
  }

  // 1) Спершу — в базу: заявка не загубиться, навіть якщо Telegram недоступний чи не налаштований
  const lead = await db.lead
    .create({
      data: {
        topic,
        name,
        phone,
        telegram: clean(form.get("telegram")),
        question: clean(form.get("question")),
        page: clean(form.get("page")).slice(0, 200),
      },
    })
    .catch((e) => {
      console.error("[lead] db save failed", e);
      return null;
    });

  // 2) Повідомлення в Telegram (якщо задано бота)
  const lines = [`📩 Заявка: ${topic}`];
  for (const [key, label] of Object.entries(FIELDS)) {
    const v = clean(form.get(key));
    if (v) lines.push(`${label}: ${v}`);
  }
  const text = lines.join("\n");

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) {
    console.info("[lead]", text);
    return lead ? { status: "ok" } : { status: "error" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Telegram ${res.status}`);
    if (lead) await db.lead.update({ where: { id: lead.id }, data: { notified: true } }).catch(() => {});
    return { status: "ok" };
  } catch (e) {
    console.error("[lead] telegram failed", e);
    // у базі заявка є — для людини все гаразд
    return lead ? { status: "ok" } : { status: "error" };
  }
}
