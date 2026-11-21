import type { Metadata } from "next";
import Image from "next/image";
import BackLink from "@/components/inner/BackLink";
import CaseGrid from "@/components/inner/CaseGrid";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import { PR_PAGE as P } from "@/lib/pages/pr";
import styles from "./pr.module.css";

export const metadata: Metadata = {
  title: "PR — Sales Machine",
  description: "Влияем на мнения и формируем поведение. PR для компаний и личный PR.",
};

export default function PrPage() {
  return (
    <>
      <BackLink word={P.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {P.title}
            </h1>
          </div>

          <div className={page.content}>
            {P.intro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}

            <figure className={styles.quote}>
              <figcaption className={styles.author}>
                <Image className={styles.photo} src={P.quote.photo} alt="" width={92} height={92} />
                <span className={styles.who}>
                  <span className={styles.role}>{P.quote.role}</span>
                  <span className={styles.name}>{P.quote.name}</span>
                </span>
              </figcaption>
              <blockquote className={styles.quoteText} data-reveal>
                {P.quote.text}
              </blockquote>
            </figure>

            {P.outro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}
          </div>

          <div className={page.ctaWrap}>
            <ContactCta label={P.cta} title={P.contact.title} text={P.contact.text} />
          </div>
        </section>

        <CaseGrid title={P.casesTitle} mark="02" cases={P.cases} />

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
