import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseView from "@/components/cases/CaseView";
import { getCaseForPreview } from "@/lib/cases";
import { requireUser } from "@/lib/server/auth/session";
import styles from "./preview.module.css";

export const metadata: Metadata = { title: "Просмотр кейса", robots: { index: false, follow: false } };

/** Кейс так, як він виглядатиме на сайті, — і для чернетки. Лише після входу в адмінку. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const c = await getCaseForPreview((await params).id);
  if (!c) notFound();
  return (
    <CaseView
      c={c}
      banner={
        <p className={styles.banner} role="status">
          Предпросмотр · так кейс будет выглядеть на сайте
        </p>
      }
    />
  );
}
