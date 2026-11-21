/**
 * Будь-яке посилання на ролик → адреса вбудованого плеєра.
 * Підходить і сторінка відео, і код плеєра: youtube.com/watch?v=…, youtu.be/…, /shorts/…,
 * vimeo.com/<id>[/<hash>], rutube.ru/video/<id>, rutube.ru/video/private/<id>/?p=… .
 * Уже вбудована адреса (player.vimeo.com, rutube.ru/play/embed, youtube.com/embed) лишається як є.
 */
export const toEmbed = (raw: string) => {
  const s = raw.trim().match(/src="([^"]+)"/)?.[1] ?? raw.trim();
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com" && u.pathname === "/watch" && u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (host === "youtube.com" && u.pathname.startsWith("/shorts/")) return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
    if (host === "vimeo.com" && /^\/\d+/.test(u.pathname)) {
      const [, id, h] = u.pathname.split("/");
      return `https://player.vimeo.com/video/${id}${h ? `?h=${h}` : ""}`;
    }
    if (host === "rutube.ru" && u.pathname.startsWith("/video/private/")) {
      // приватне відео: ключ доступу ?p=… переносимо в адресу плеєра
      const p = u.searchParams.get("p");
      return `https://rutube.ru/play/embed/${u.pathname.split("/")[3]}/${p ? `?p=${p}` : ""}`;
    }
    if (host === "rutube.ru" && u.pathname.startsWith("/video/")) return `https://rutube.ru/play/embed/${u.pathname.split("/")[2]}`;
    return s;
  } catch {
    return s;
  }
};
