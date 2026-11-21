/**
 * Зовнішні посилання, які ріжуть блокувальники реклами.
 *
 * uBlock / AdGuard з російськими фільтрами ховають на сторінці будь-які посилання на dzen.ru —
 * у сітках карток лишаються порожні клітинки. Такі посилання ведемо через нашу адресу
 * /go/<код> (app/go/[code]/route.ts), яка одразу переадресовує на оригінал.
 * Переадресація працює лише на домени зі списку — чужі адреси через неї не відкрити.
 */

export const MASKED_HOSTS = ["dzen.ru", "zen.yandex.ru"];

const hostOf = (href: string) => {
  try {
    return new URL(href).hostname;
  } catch {
    return null;
  }
};

export const isMaskedHost = (host: string) => MASKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

// base64url без залежностей — працює і на сервері, і в браузері
const encode = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const decodeOutCode = (code: string) => {
  try {
    const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
};

/** Адреса для href: замасковані домени — через /go/<код>, решта — як є */
export const outHref = (href: string) => {
  const host = hostOf(href);
  return host && isMaskedHost(host) ? `/go/${encode(href)}` : href;
};

/** Чи відкривати посилання в новій вкладці (зовнішнє або замасковане) */
export const isExternal = (href: string) => /^https?:/.test(href);
