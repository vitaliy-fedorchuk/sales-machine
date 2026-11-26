import "server-only";

/**
 * Повідомлення в Telegram від бота сайту. Два чати:
 *   leads  — заявки з форм (TELEGRAM_CHAT_ID);
 *   alerts — системне: входи в адмінку, підбір пароля, зміна безпеки, бекапи (TELEGRAM_ALERTS_CHAT_ID).
 * Без токена чи id чату — тихо нічого не робить (повертає false).
 */
export type TelegramChat = "leads" | "alerts";

const chatId = (chat: TelegramChat) => (chat === "leads" ? process.env.TELEGRAM_CHAT_ID : process.env.TELEGRAM_ALERTS_CHAT_ID);

export const telegramReady = (chat: TelegramChat) => !!(process.env.TELEGRAM_BOT_TOKEN && chatId(chat));

export async function sendTelegram(chat: TelegramChat, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const id = chatId(chat);
  if (!token || !id) {
    console.info(`[telegram:${chat}]`, text);
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: id, text, disable_web_page_preview: true }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Telegram ${res.status}`);
    return true;
  } catch (e) {
    console.error(`[telegram:${chat}] failed`, e);
    return false;
  }
}

/** «Chrome · Windows» з user-agent — щоб у сповіщеннях було видно пристрій */
export const describeDevice = (ua: string | null | undefined) => {
  if (!ua) return "неизвестное устройство";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /YaBrowser/.test(ua) ? "Яндекс Браузер" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "браузер";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} · ${os}` : browser;
};
