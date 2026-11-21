import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import CaseSections from "@/components/keysy/CaseSections";
import { KEYSY_PAGE as P } from "@/lib/pages/keysy";

export const metadata: Metadata = {
  title: "Кейсы — Sales Machine",
  description: "Кейсы, которые принесли результат: PR, маркетинг, креатив, брендинг, реклама, ребрендинг.",
};

export default function KeysyPage() {
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
        </section>

        <CaseSections />

        <section className={page.section}>
          <div className={page.ctaWrap}>
            <ContactCta label={P.cta} title={P.contact.title} text={P.contact.text} />
          </div>
        </section>

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
