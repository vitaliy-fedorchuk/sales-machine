import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import Book3D from "@/components/inner/Book3D";
import CaseGrid from "@/components/inner/CaseGrid";
import ContactCta from "@/components/inner/ContactCta";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import { getContent } from "@/lib/content";
import styles from "./kniga.module.css";

export const metadata: Metadata = {
  title: "Книга «Иммерсивный маркетинг» — Sales Machine",
  description: "Иммерсивный маркетинг: система хищных продаж. Книга для практиков — с подписью авторов.",
};

const Arrow = () => (
  <svg className={styles.arrow} width="41" height="41" viewBox="0 0 41 41" aria-hidden="true">
    <circle cx="20.5" cy="20.5" r="20" />
    <path d="M15 26 26 15M16 15h10v10" />
  </svg>
);

export default async function KnigaPage() {
  const K = await getContent("kniga");
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
          <p className={page.p} data-reveal>{K.intro}</p>

          <div className={styles.book} data-book-zone>
            <div className={styles.buy}>
              <div className={styles.coverBox}>
                <Book3D
                  className={styles.coverArea}
                  cover={K.book.cover.src}
                  alt={K.book.cover.alt}
                  width={451}
                  height={621}
                  spine="Иммерсивный маркетинг"
                  back={K.book.back}
                  zone="[data-book-zone]"
                />
              </div>
              <div className={styles.buttons}>
                {K.book.buy.map((b) => (
                  <a key={b.label} className={styles.btn} href={b.href} target="_blank" rel="noopener noreferrer">
                    {b.label}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.about}>
              {K.book.lists.map((list) => (
                <div key={list.title} className={styles.list}>
                  <h3 className={styles.listTitle}>{list.title}</h3>
                  <ul className={styles.items}>
                    {list.items.map((it) => (
                      <li key={it} className={styles.item}>
                        <div data-reveal>{it}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={page.section}>
          <h2 className={page.h2} data-axis-mark="02" data-twist>{K.signed.title}</h2>
          {K.signed.text.map((t) => (
            <p key={t} className={page.p} data-reveal>{t}</p>
          ))}
        </section>

        <section className={page.section}>
          <h2 className={page.h2} data-axis-mark="03" data-twist>{K.reviews.title}</h2>
          <ul className={styles.reviews}>
            {K.reviews.links.map((r) => (
              <li key={r.href}>
                <a className={styles.review} href={r.href} target="_blank" rel="noopener noreferrer">
                  <span className={styles.reviewLabel}>{r.label}</span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
          <div className={page.ctaWrap}>
            <ContactCta label={K.cta} title={K.contact.title} text={K.contact.text} />
          </div>
        </section>

        <CaseGrid title={K.casesTitle} mark="04" cases={K.cases} />

        <SocialFooter />
      </ScrollScene>
    </>
  );
}
