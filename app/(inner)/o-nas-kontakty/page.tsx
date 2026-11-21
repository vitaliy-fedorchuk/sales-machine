import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import TeamList from "@/components/onas/TeamList";
import { ONAS_PAGE as O, TEAM } from "@/lib/pages/o-nas";

export const metadata: Metadata = {
  title: "О нас. Контакты — Sales Machine",
  description: "Sales Machine — инженеры маркетинговых прорывов. Ядро команды: Вадим Шевченко, Тимур Захарченко, Василий Боев, Артём Панченко.",
};

export default function ONasPage() {
  return (
    <>
      <BackLink word={O.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {O.title}
            </h1>
          </div>
          <div className={page.content}>
            {O.intro.map((t) => (
              <p key={t} className={page.p} data-reveal>{t}</p>
            ))}
          </div>
          <div className={page.ctaWrap}>
            <ContactCta label={O.cta} title={O.contact.title} text={O.contact.text} />
          </div>
        </section>

        <section className={page.section} aria-labelledby="team-title">
          <h2 id="team-title" className={page.h2} data-axis-mark="02" data-twist>
            {O.teamTitle}
          </h2>
          <TeamList team={TEAM} />
          <div className={page.ctaWrap}>
            <ContactCta label={O.ctaBottom} title={O.contact.title} text={O.contact.text} />
          </div>
        </section>

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
