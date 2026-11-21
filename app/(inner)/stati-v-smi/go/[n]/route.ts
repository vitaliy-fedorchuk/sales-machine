import { notFound, redirect } from "next/navigation";
import { smiRedirect } from "@/lib/pages/smi";

/** Переадресація на публікацію, посилання на яку ховають блокувальники реклами (див. smiHref). */
export async function GET(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const url = smiRedirect(Number((await params).n));
  if (!url) notFound();
  redirect(url);
}
