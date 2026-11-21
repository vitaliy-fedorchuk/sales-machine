import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseView from "@/components/cases/CaseView";
import { getCase } from "@/lib/cases";
import { variantOf } from "@/lib/media/urls";

// Кейси з бази. Сторінка будується при першому відкритті й кешується;
// після збереження в адмінці кеш скидається (revalidatePath у server/admin/case-actions.ts).
export const generateStaticParams = async () => [];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCase((await params).slug);
  if (!c) return {};
  const title = c.seoTitle ?? c.title;
  return {
    title: `${title} — кейс Sales Machine`,
    description: c.description || undefined,
    openGraph: {
      title,
      description: c.description || undefined,
      type: "article",
      images: c.cover ? [{ url: variantOf(c.cover.src, 1600), alt: c.cover.alt }] : undefined,
    },
  };
}

export default async function CasePage({ params }: Props) {
  const c = await getCase((await params).slug);
  if (!c) notFound();
  return <CaseView c={c} />;
}
