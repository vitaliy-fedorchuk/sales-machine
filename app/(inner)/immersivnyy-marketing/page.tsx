import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/inner/BackLink";
import CaseGrid from "@/components/inner/CaseGrid";
import ContactCta from "@/components/inner/ContactCta";
import QuoteCard from "@/components/inner/QuoteCard";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import { getContent } from "@/lib/content";
import styles from "./immersive.module.css";

export const metadata: Metadata = {
  title: "Иммерсивный маркетинг — Sales Machine",
  description: "Иммерсивный маркетинг — формирование у клиента эмоционально окрашенного опыта владения товаром или услугой в будущем.",
};

export default async function ImmersivePage() {
  const I = await getContent("immersive");
  return (
    <>
      <BackLink word={I.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {I.title}
            </h1>
          </div>

          <div className={page.content}>
            {I.intro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}
            <QuoteCard quote={I.quote} />
            <p className={page.p} data-reveal>{I.afterQuote}</p>

            {/* Визначення — головна думка сторінки */}
            <p className={styles.definition}>
              <dfn className={styles.term}>{I.definition.term}</dfn>
              <span data-reveal> — {I.definition.text}</span>
            </p>

            {I.outro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}
          </div>

          <div className={page.ctaWrap}>
            <ContactCta label={I.cta} title={I.contact.title} text={I.contact.text} />
          </div>

          <Link href={I.book.href} className={styles.book}>
            <span className={styles.bookText}>{I.book.text}</span>
            <span className={styles.bookLabel}>
              {I.book.label}
              <svg width="40" height="40" viewBox="0 0 41 41" aria-hidden="true">
                <circle cx="20.5" cy="20.5" r="20" />
                <path d="M15 26 26 15M16 15h10v10" />
              </svg>
            </span>
          </Link>
        </section>

        <CaseGrid title={I.casesTitle} mark="02" cases={I.cases} />

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
