import { toEmbed } from "@/lib/video";
import type { Review } from "@/lib/pages/otzyvy";
import type { CaseImage } from "@/lib/cases/schema";

/** Відгук так, як його редагують в адмінці (Отзывы, відгуки випускників курсу) */
export type ReviewContent = {
  name: string;
  role: string;
  siteLabel: string;
  siteHref: string;
  text: string[];
  poster: CaseImage;
  preview: string;
  video: string;
  format: string;
  links?: { label: string; href: string }[];
};

/** Відгук з адмінки → формат компонентів відгуків (номер, плеєр, кнопки) */
export const toReview = (r: ReviewContent, i: number): Review => ({
  id: String(i + 1).padStart(2, "0"),
  name: r.name,
  role: r.role,
  site: r.siteHref ? { label: r.siteLabel || r.siteHref.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), href: r.siteHref } : undefined,
  text: r.text,
  preview: r.preview,
  poster: r.poster.src,
  video: toEmbed(r.video),
  format: r.format === "wide" ? "wide" : "vertical",
  links: r.links?.length ? r.links : undefined,
});
