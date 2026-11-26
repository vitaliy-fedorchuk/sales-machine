"use server";

import { db } from "@/lib/server/db";
import { sendTelegram } from "@/lib/server/telegram";

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
  const page = clean(form.get("page"));
  if (page) lines.push(`Страница: ${page}`);
  const site = process.env.SITE_URL?.replace(/\/$/, "");
  if (site) lines.push(`Все заявки: ${site}/admin/leads`);
  const text = lines.join("\n");

  const sent = await sendTelegram("leads", text);
  if (sent && lead) await db.lead.update({ where: { id: lead.id }, data: { notified: true } }).catch(() => {});
  // у базі заявка є — для людини все гаразд, навіть якщо Telegram недоступний
  return lead || sent ? { status: "ok" } : { status: "error" };
}
