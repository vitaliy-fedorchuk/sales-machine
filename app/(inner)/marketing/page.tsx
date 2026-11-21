import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import CaseGrid from "@/components/inner/CaseGrid";
import ContactCta from "@/components/inner/ContactCta";
import QuoteCard from "@/components/inner/QuoteCard";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import { MARKETING_PAGE as M } from "@/lib/pages/marketing";

export const metadata: Metadata = {
  title: "Маркетинг — Sales Machine",
  description: "Продавать дороже и быстрее рынка: маркетинговая стратегия, тактика и рост продаж.",
};

export default function MarketingPage() {
  return (
    <>
      <BackLink word={M.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {M.title}
            </h1>
          </div>

          <div className={page.content}>
            {M.intro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}
            <QuoteCard quote={M.quote} />
            {M.outro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}
          </div>

          <div className={page.ctaWrap}>
            <ContactCta label={M.cta} title={M.contact.title} text={M.contact.text} />
          </div>
        </section>

        <CaseGrid title={M.casesTitle} mark="02" cases={M.cases} />

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
