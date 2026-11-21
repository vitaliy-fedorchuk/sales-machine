import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import PolicyText from "@/components/politika/PolicyText";
import PolicyToc from "@/components/politika/PolicyToc";
import styles from "@/components/politika/Policy.module.css";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — Sales Machine",
  description: "Политика обработки и защиты персональных данных (политика конфиденциальности) Sales Machine.",
};

export default async function PolicyPage() {
  const POLICY = await getContent("politika");
  return (
    <>
      <BackLink word={POLICY.word} />
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01">
              {POLICY.title}
            </h1>
          </div>
          <div className={styles.meta}>
            <span className={styles.subtitle}>{POLICY.subtitle}</span>
            <span className={styles.date}>{POLICY.date}</span>
          </div>
        </section>

        <section className={styles.layout} aria-label="Текст политики">
          <PolicyToc items={POLICY.sections} />
          <div className={styles.doc}>
            {POLICY.sections.map((s) => (
              <section key={s.n} id={`p-${s.n}`} className={styles.section} aria-labelledby={`p-${s.n}-t`}>
                <h2 id={`p-${s.n}-t`} className={styles.h2}>
                  <span className={styles.h2Num}>{s.n.padStart(2, "0")}</span>
                  <span>{s.title}</span>
                </h2>
                <PolicyText section={s} />
              </section>
            ))}
          </div>
        </section>

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
