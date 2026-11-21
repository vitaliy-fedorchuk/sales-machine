import BackLink from "@/components/inner/BackLink";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import type { CaseArticle } from "@/lib/cases/types";
import { CATEGORIES, KEYSY_PAGE } from "@/lib/pages/keysy";
import CaseBlocks from "./CaseBlocks";
import CaseLightbox from "./CaseLightbox";
import styles from "./CaseView.module.css";

const LABEL = Object.fromEntries(CATEGORIES.map((x) => [x.id, x.label])) as Record<string, string>;

/** Сторінка кейсу — спільна для сайту (/stati/<slug>) і попереднього перегляду в адмінці. */
export default function CaseView({ c, banner }: { c: CaseArticle; banner?: React.ReactNode }) {
  return (
    <>
      <BackLink word={KEYSY_PAGE.word} href="/keysy" label="Назад к кейсам" />
      {banner}
      <ScrollScene className={page.page}>
        <article className={styles.article} data-case>
          <header className={page.hero}>
            <p className={styles.eyebrow}>
              <span>Кейс</span>
              {c.cats.map((id) => LABEL[id] && <span key={id}>{LABEL[id]}</span>)}
            </p>
            <div className={page.titleBox}>
              <h1 className={page.title} data-axis-mark="01" data-reveal>
                {c.title}
              </h1>
            </div>
          </header>

          <CaseBlocks blocks={c.blocks} caseTitle={c.title} />
        </article>

        <section className={page.section}>
          <div className={page.ctaWrap}>
            <ContactCta label={c.cta ?? KEYSY_PAGE.cta} title={KEYSY_PAGE.contact.title} text={KEYSY_PAGE.contact.text} />
          </div>
        </section>

        <SocialFooter />
      </ScrollScene>
      <CaseLightbox />
    </>
  );
}
