import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import ContactCta from "@/components/inner/ContactCta";
import QuoteCard from "@/components/inner/QuoteCard";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import AwardGrid from "@/components/nagrady/AwardGrid";
import { AWARD_GLOSSARY, AWARDS, NAGRADY_PAGE as N, VIDEO_AWARDS } from "@/lib/pages/nagrady";
import styles from "./nagrady.module.css";

export const metadata: Metadata = {
  title: "Награды — Sales Machine",
  description: "Награды Sales Machine: European Property Awards, WOW Awards, «Девелопер года», ReMovie Awards, Urban Awards.",
};

export default function NagradyPage() {
  return (
    <>
      <BackLink word={N.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {N.title}
            </h1>
          </div>
          <div className={page.content}>
            {N.intro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}
            <QuoteCard quote={N.quote} />
          </div>
        </section>

        <AwardGrid title={N.awardsTitle} mark="02" awards={AWARDS}>
          <dl className={styles.glossary}>
            {AWARD_GLOSSARY.map((g) => (
              <div key={g.term} style={{ display: "contents" }}>
                <dt>{g.term}</dt>
                <dd data-reveal>{g.text}</dd>
              </div>
            ))}
          </dl>
        </AwardGrid>

        <AwardGrid title={N.videoTitle} mark="03" awards={VIDEO_AWARDS} />

        <section className={page.section}>
          <div className={page.ctaWrap}>
            <ContactCta label={N.cta} title={N.contact.title} text={N.contact.text} />
          </div>
        </section>

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
