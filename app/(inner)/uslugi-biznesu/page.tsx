import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import ServiceList from "@/components/uslugi/ServiceList";
import { getContent } from "@/lib/content";
import styles from "./uslugi.module.css";

export const metadata: Metadata = {
  title: "Услуги бизнесу — Sales Machine",
  description: "Идея, концепция, иммерсивный маркетинг, нейминг, сайт, реклама, SMM, продажи, PR — что Sales Machine умеет делать классно.",
};

export default async function UslugiPage() {
  const U = await getContent("uslugi");
  return (
    <>
      <BackLink word={U.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {U.title}
            </h1>
          </div>
          <p className={page.p} data-reveal>{U.intro}</p>
        </section>

        <section className={page.section} aria-labelledby="services-title">
          <h2 id="services-title" className={page.callout} data-axis-mark="02">
            {U.callout}
          </h2>
          <div className={styles.price}>
            <p className={page.p} data-reveal>{U.price.lead}</p>
            <ol className={styles.steps}>
              {U.price.steps.map((s, i) => (
                <li key={s}>
                  <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
          <ServiceList services={U.services} discuss={U.discuss} />
          <p className={`${page.p} ${styles.outro}`} data-reveal>{U.outro}</p>
          <div className={page.ctaWrap}>
            <ContactCta label={U.cta} title={U.contact.title} text={U.contact.text} />
          </div>
        </section>

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
