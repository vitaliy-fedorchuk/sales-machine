import { DIRECTIONS } from "./directions";

const NAMES: Record<string, string> = {
  "/": "Sales Machine",
  "/politika-obrabotki-personalnyh-dannyh": "Политика",
  ...Object.fromEntries(DIRECTIONS.map((d) => [d.href, d.label.replace("\n", " ")])),
};

/** Назва сторінки для панелі переходу (аналог data-page-name). */
export const pageName = (pathname: string) => {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p.startsWith("/stati/")) return "Кейс";
  return NAMES[p] ?? "Sales Machine";
};
