import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import CaseGrid from "@/components/inner/CaseGrid";
import ContactCta from "@/components/inner/ContactCta";
import QuoteCard from "@/components/inner/QuoteCard";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Креатив — Sales Machine",
  description: "Креативность ждет, пока вымотается заурядность. Наружная реклама, нейминг, креатив, о котором говорят.",
};

export default async function KreativPage() {
  const K = await getContent("kreativ");
  return (
    <>
      <BackLink word={K.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {K.title}
            </h1>
          </div>

          <div className={page.content}>
            {K.intro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}

            <p className={page.callout} data-reveal>{K.callout}</p>

            {K.outro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}

            <QuoteCard quote={K.quote} />
          </div>

          <div className={page.ctaWrap}>
            <ContactCta label={K.cta} title={K.contact.title} text={K.contact.text} />
          </div>
        </section>

        <CaseGrid title={K.casesTitle} mark="02" cases={K.cases} />

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
