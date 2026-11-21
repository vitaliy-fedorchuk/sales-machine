import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BackLink from "@/components/inner/BackLink";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import Accordion from "@/components/kurs/Accordion";
import Graduates from "@/components/kurs/Graduates";
import { KursButton, SectionLink } from "@/components/kurs/KursAction";
import KursDialogs from "@/components/kurs/KursDialogs";
import KursNav from "@/components/kurs/KursNav";
import LeadForm from "@/components/kurs/LeadForm";
import { getContent } from "@/lib/content";
import { toReview } from "@/lib/content/reviews";
import { KAIF_VIDEO as KAIF_DEFAULT, KURS_FORMS, KURS_PAGE, type Speaker } from "@/lib/pages/kurs";
import { toEmbed } from "@/lib/video";
import styles from "./kurs.module.css";

export const metadata: Metadata = {
  title: "Курс «Иммерсивный маркетинг» — школа Sales Machine",
  description:
    "Живой онлайн-курс для практиков: программа из 4 модулей, индивидуальная сессия с командой Sales Machine, отзывы выпускников и запись на поток.",
};

const COURSE = "Полный курс «Иммерсивный маркетинг»";

function Arrow() {
  return (
    <svg width="41" height="41" viewBox="0 0 41 41" aria-hidden="true">
      <circle cx="20.5" cy="20.5" r="19.5" />
      <path d="M15 26 26 15M16 15h10v10" />
    </svg>
  );
}

/** Картка людини: фото, ім'я, підпис, кругла стрілка → попап з біографією. */
function PersonCard({ s, className, eager }: { s: Speaker; className?: string; eager?: boolean }) {
  return (
    <KursButton dialog={{ kind: "bio", speaker: s }} className={`${styles.person} ${className ?? ""}`} label={`${s.name} — подробнее`}>
      <span className={styles.personPhoto}>
        <Image src={s.photo} alt="" fill sizes="(max-width: 767px) 90vw, 30vw" loading={eager ? "eager" : undefined} />
      </span>
      <span className={styles.personFoot}>
        <span className={styles.personText}>
          <span className={styles.personName}>{s.name}</span>
          {s.role && <span className={styles.personRole}>{s.role}</span>}
        </span>
        <span className={styles.personArrow}>
          <Arrow />
        </span>
      </span>
    </KursButton>
  );
}

export default async function KursPage() {
  // Вміст — з адмінки («Курс»); навігація по розділах і тексти форм — з коду
  const C = await getContent("kurs");
  const K = {
    ...C,
    nav: KURS_PAGE.nav,
    speakers: { ...C.speakers, lead: [C.speakers.leadBefore, C.speakers.leadLink, C.speakers.leadAfter] },
  };
  const CURATOR: Speaker = {
    id: "boev", // для куратора в попапі є кнопка «Связаться со мной»
    name: C.unique.curatorName,
    role: C.unique.curatorRole,
    photo: C.unique.curatorPhoto.src,
    bio: C.unique.curatorBio,
  };
  const SPEAKERS: Speaker[] = C.speakers.people.map((p, i) => ({ id: `s${i}`, name: p.name, role: p.role || undefined, photo: p.photo.src, bio: p.bio, book: p.book }));
  const GRADUATES = C.reviews.items.map(toReview);
  const KAIF_VIDEO = { ...KAIF_DEFAULT, video: C.faq.video ? toEmbed(C.faq.video) : KAIF_DEFAULT.video };

  const program = K.program.items.map((it) => ({
    title: it.title,
    body: (
      <>
        {it.text && <p>{it.text}</p>}
        {it.points.length > 0 && (
          <ul className={`${styles.points} ${styles.strong}`}>
            {it.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        {it.summary && <p className={styles.summary}>{it.summary}</p>}
        {it.note && <p className={styles.note}>{it.note}</p>}
        {it.module && (
          <div className={styles.moduleBtns}>
            <KursButton dialog={{ kind: "form", form: "module", topic: `${it.module} курса «Иммерсивный маркетинг»` }} className={styles.btnLine}>
              {K.program.toModule}
            </KursButton>
            <KursButton dialog={{ kind: "form", form: "module", topic: COURSE }} className={styles.btnFill}>
              {K.program.toCourse}
            </KursButton>
          </div>
        )}
      </>
    ),
  }));

  const faq = K.faq.items.map((f) => ({
    title: f.q,
    body: (
      <p>
        {f.a}
        {f.watch && C.faq.video && (
          <>
            {" "}
            <KursButton dialog={{ kind: "video", review: KAIF_VIDEO }} className={styles.watch}>
              {f.watch}
            </KursButton>
          </>
        )}
      </p>
    ),
  }));

  return (
    <>
      <BackLink word={K.word} />
      <KursNav items={K.nav} />
      <ScrollScene className={`${page.page} ${styles.page}`}>
        {/* ---------- 01 · герой ---------- */}
        <section className={`${page.hero} ${styles.hero}`}>
          <ul className={styles.badges}>
            {K.hero.badges.map((b, i) => (
              <li key={b} className={styles.badge}>
                {i === 0 && (
                  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                    <circle cx="11" cy="11" r="10.25" />
                    <path d="M11 5.5v7.5M11 15.5v1.25" />
                  </svg>
                )}
                {b}
              </li>
            ))}
          </ul>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {K.hero.title}
            </h1>
          </div>
          <p className={`${page.p} ${styles.lead}`} data-reveal>{K.hero.lead}</p>
          <SectionLink to="signup" className={styles.heroCta}>
            <span className={styles.swap}>
              <span>{K.hero.cta[0]}</span>
              <span aria-hidden="true">{K.hero.cta[1]}</span>
            </span>
          </SectionLink>
        </section>

        {/* ---------- 02 · унікальність ---------- */}
        <section className={page.section} aria-labelledby="unique-title">
          <div className={styles.unique}>
            <PersonCard s={CURATOR} className={styles.curator} eager />
            <div className={styles.uniqueBody}>
              <h2 id="unique-title" className={page.h2} data-axis-mark="02" data-twist>
                {K.unique.title}
              </h2>
              <p className={styles.text}>{K.unique.intro}</p>
              <ul className={styles.points}>
                {K.unique.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className={styles.text}>{K.unique.bonus}</p>
              <p className={styles.text}>{K.unique.outro}</p>
              <SectionLink to="reviews" className={styles.btnFill}>
                {K.unique.toReviews}
              </SectionLink>
            </div>
          </div>
        </section>

        {/* ---------- 03 · програма ---------- */}
        <section id="program" className={page.section} aria-labelledby="program-title">
          <h2 id="program-title" className={page.h2} data-axis-mark="03" data-twist>
            {K.program.title}{" "}
            <SectionLink to="signup" className={styles.book}>
              {K.program.book}
            </SectionLink>
          </h2>
          <p className={page.p} data-reveal>{K.program.lead}</p>
          <Accordion id="program" items={program} numbered />
        </section>

        {/* ---------- 04 · спікери ---------- */}
        <section id="speakers" className={page.section} aria-labelledby="speakers-title">
          <h2 id="speakers-title" className={page.h2} data-axis-mark="04" data-twist>
            {K.speakers.title}
          </h2>
          <p className={page.p}>
            {K.speakers.lead[0]}
            <Link href="/" className={styles.inlineLink}>{K.speakers.lead[1]}</Link>
            {K.speakers.lead[2]}
          </p>
          <div className={styles.speakers}>
            {SPEAKERS.map((s) => (
              <PersonCard key={s.id} s={s} />
            ))}
          </div>
          <p className={page.callout}>{K.speakers.caption}</p>
        </section>

        {/* ---------- 05 · відгуки ---------- */}
        <section id="reviews" className={page.section} aria-labelledby="reviews-title">
          <h2 id="reviews-title" className={page.h2} data-axis-mark="05" data-twist>
            {K.reviews.title}
          </h2>
          <Graduates reviews={GRADUATES} />
        </section>

        {/* ---------- 06 · ціна + заявка ---------- */}
        <section id="signup" className={page.section} aria-labelledby="price-title">
          <div className={styles.price}>
            <div className={styles.priceBody}>
              <h2 id="price-title" className={page.h2} data-axis-mark="06">
                {K.price.title}
              </h2>
              <p className={styles.text}>{K.price.text}</p>
              <div className={styles.tiles}>
                <div className={styles.tile}>
                  <p className={styles.tileLabel}>{K.price.course.label}</p>
                  <p className={styles.tileValue}>
                    {K.price.course.value} <span>{K.price.course.unit}</span>
                  </p>
                  <p className={styles.tileNote}>{K.price.course.note}</p>
                  <p className={styles.tileNote}>{K.price.course.full}</p>
                </div>
                <div className={styles.tile}>
                  <p className={styles.tileLabel}>{K.price.answer.label}</p>
                  <p className={styles.tileAnswer}>
                    {K.price.answer.lines.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </p>
                  <a className={styles.tileLink} href={K.price.answer.href} target="_blank" rel="noopener noreferrer">
                    {K.price.answer.link}
                  </a>
                </div>
              </div>
              <KursButton dialog={{ kind: "form", form: "installment", topic: "Рассрочка на курс «Иммерсивный маркетинг»" }} className={styles.installment}>
                <span className={styles.personArrow}>
                  <Arrow />
                </span>
                {K.price.installment}
              </KursButton>
            </div>
            <div className={styles.priceForm}>
              <LeadForm title={KURS_FORMS.signup.title} sub={KURS_FORMS.signup.sub} topic={COURSE} />
            </div>
          </div>
        </section>

        {/* ---------- 07 · результати ---------- */}
        <section className={page.section} aria-labelledby="results-title">
          <h2 id="results-title" className={page.h2} data-axis-mark="07" data-twist>
            {K.results.title}
          </h2>
          <ul className={styles.results}>
            {K.results.items.map((r) => (
              <li key={r}>
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                  <circle cx="11" cy="11" r="11" />
                  <path d="m6.5 11.25 3 3 6-6.5" />
                </svg>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- 08 · FAQ ---------- */}
        <section className={page.section} aria-labelledby="faq-title">
          <h2 id="faq-title" className={page.h2} data-axis-mark="08" data-twist>
            {K.faq.title}
          </h2>
          <Accordion id="faq" items={faq} />
        </section>

        <SocialFooter />
      </ScrollScene>
      <KursDialogs />
    </>
  );
}
