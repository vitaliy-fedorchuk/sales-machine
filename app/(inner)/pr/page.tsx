import type { Metadata } from "next";
import Image from "next/image";
import BackLink from "@/components/inner/BackLink";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import { PR_PAGE as P } from "@/lib/pages/pr";
import styles from "./pr.module.css";

export const metadata: Metadata = {
  title: "PR — Sales Machine",
  description: "Влияем на мнения и формируем поведение. PR для компаний и личный PR.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function PrPage() {
  return (
    <>
      <BackLink word={P.word} />
      <ScrollScene className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.titleBox}>
            <h1 className={styles.title} data-axis-mark="01" data-reveal>
              {P.title}
            </h1>
          </div>

          <div className={styles.content}>
            {P.intro.map((t) => (
              <p key={t} className={styles.p} data-reveal>{t}</p>
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
              <p key={t} className={styles.p} data-reveal>{t}</p>
            ))}
          </div>

          <div className={styles.ctaWrap}>
            <ContactCta label={P.cta} title={P.contact.title} text={P.contact.text} />
          </div>
        </section>

        <section className={styles.cases} aria-labelledby="cases-title">
          <h2 id="cases-title" className={styles.h2} data-axis-mark="02" data-twist>
            {P.casesTitle}
          </h2>
          <ul className={styles.grid}>
            {P.cases.map((c, i) => (
              <li key={c.href}>
                <a className={styles.card} href={c.href} target="_blank" rel="noopener noreferrer">
                  <span className={styles.cardTop}>
                    <svg className={styles.cardArrow} width="41" height="41" viewBox="0 0 41 41" aria-hidden="true">
                      <circle cx="20.5" cy="20.5" r="20" />
                      <path d="M15 26 26 15M16 15h10v10" />
                    </svg>
                    <span className={styles.cardNum}>{pad(i + 1)}</span>
                  </span>
                  <span className={styles.cardTitle}>{c.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
