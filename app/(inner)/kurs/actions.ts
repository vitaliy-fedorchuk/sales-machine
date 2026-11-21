"use server";

export type LeadState = { status: "idle" | "ok" | "error"; message?: string };

const FIELDS: Record<string, string> = {
  name: "Имя",
  phone: "Телефон",
  telegram: "Телеграм",
  question: "Суть вопроса",
};

const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim().slice(0, 500);

/**
 * Заявка з /kurs. Якщо задано TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID — шле повідомлення боту,
 * інакше лише пише в лог сервера (зручно локально, поки бота не підключено).
 */
export async function sendLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  if (clean(form.get("website"))) return { status: "ok" }; // honeypot: боти заповнюють приховане поле

  const topic = clean(form.get("topic")) || "Курс «Иммерсивный маркетинг»";
  const name = clean(form.get("name"));
  const phone = clean(form.get("phone"));
  if (!name || phone.replace(/\D/g, "").length < 6) {
    return { status: "error", message: "Укажите имя и номер телефона" };
  }

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
    return { status: "ok" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Telegram ${res.status}`);
    return { status: "ok" };
  } catch (e) {
    console.error("[lead] send failed", e);
    return { status: "error" };
  }
}
