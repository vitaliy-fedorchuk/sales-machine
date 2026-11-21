import { notFound, redirect } from "next/navigation";
import { decodeOutCode, isMaskedHost } from "@/lib/outlinks";

/** Переадресація на зовнішнє посилання, яке ховають блокувальники реклами (див. lib/outlinks.ts). Лише домени зі списку. */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const url = decodeOutCode((await params).code);
  let host = "";
  try {
    host = url ? new URL(url).hostname : "";
  } catch {
    notFound();
  }
  if (!url || !/^https:\/\//.test(url) || !isMaskedHost(host)) notFound();
  redirect(url);
}
