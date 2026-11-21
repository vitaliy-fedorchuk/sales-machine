import { notFound, redirect } from "next/navigation";
import { getContent } from "@/lib/content";
import { smiRedirect } from "@/lib/pages/smi";

/** Переадресація на публікацію, посилання на яку ховають блокувальники реклами (див. smiHref). */
export async function GET(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const { articles } = await getContent("smi");
  const url = smiRedirect(articles, Number((await params).n));
  if (!url) notFound();
  redirect(url);
}
