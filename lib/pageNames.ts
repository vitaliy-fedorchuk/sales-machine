import { DIRECTIONS } from "./directions";

const NAMES: Record<string, string> = {
  "/": "Sales Machine",
  ...Object.fromEntries(DIRECTIONS.map((d) => [d.href, d.label.replace("\n", " ")])),
};

/** Назва сторінки для панелі переходу (аналог data-page-name). */
export const pageName = (pathname: string) => NAMES[pathname.replace(/\/$/, "") || "/"] ?? "Sales Machine";
