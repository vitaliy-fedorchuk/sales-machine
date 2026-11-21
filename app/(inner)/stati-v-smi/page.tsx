import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import YearGroups, { pubs } from "@/components/smi/YearGroups";
import { ARTICLES, SMI_PAGE as S } from "@/lib/pages/smi";
import styles from "./smi.module.css";

export const metadata: Metadata = {
  title: "Статьи в СМИ — Sales Machine",
  description: "О Sales Machine пишут с 2016 года: публикации в РБК, Коммерсантъ, vc.ru, «Российской газете» и других СМИ.",
};

export default function SmiPage() {
  const years = [...new Set(ARTICLES.map((a) => a.year))];
  return (
    <>
      <BackLink word={S.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {S.title}
            </h1>
          </div>
          <p className={styles.stats}>
            <span className={styles.stat}>
              <b>{ARTICLES.length}</b> {pubs(ARTICLES.length)}
            </span>
            <span className={styles.stat}>
              <b>{years.length}</b> лет
            </span>
            <span className={styles.stat}>
              {years[years.length - 1]}–{years[0]}
            </span>
          </p>
        </section>

        <YearGroups articles={ARTICLES} />

        <section className={page.section}>
          <div className={page.ctaWrap}>
            <ContactCta label={S.cta} title={S.contact.title} text={S.contact.text} />
          </div>
        </section>

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
