"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/inner/SmoothScroll";
import ReviewModal from "@/components/otzyvy/ReviewModal";
import { KURS_FORMS, KURS_PAGE } from "@/lib/pages/kurs";
import type { Review } from "@/lib/pages/otzyvy";
import { onKurs, type KursDialog } from "./events";
import LeadForm from "./LeadForm";
import styles from "./KursDialogs.module.css";

type Panel = Exclude<KursDialog, { kind: "video" }>;

/**
 * Усі попапи сторінки курсу в одному місці: форми заявок (модуль / рассрочка / «связаться со мной»),
 * біографії спікерів і відео (модалка відгуку з /otzyvy). Відкриваються подією openKurs().
 */
export default function KursDialogs() {
  const ref = useRef<HTMLDialogElement>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [video, setVideo] = useState<Review | null>(null);

  useEffect(
    () =>
      onKurs((d) => {
        if (d.kind === "video") {
          setVideo(d.review);
          return;
        }
        setPanel(d);
        const dlg = ref.current!;
        if (!dlg.open) {
          getLenis()?.stop();
          dlg.showModal();
        }
      }),
    [],
  );

  useEffect(() => {
    const dlg = ref.current!;
    const onClose = () => {
      getLenis()?.start();
      setPanel(null);
    };
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, []);

  const closeVideo = useCallback(() => setVideo(null), []);

  const form = panel?.kind === "form" ? panel : null;
  const bio = panel?.kind === "bio" ? panel.speaker : null;
  const formCfg = form ? KURS_FORMS[form.form] : null;
  const withQuestion = form?.form === "installment" || form?.form === "personal";

  return (
    <>
      <dialog
        ref={ref}
        className={`${styles.dialog} ${bio ? styles.wide : ""}`}
        aria-label={bio ? bio.name : formCfg?.title}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
      >
        <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Закрыть">
          <span />
          <span />
        </button>

        {form && formCfg && (
          <div className={styles.formBox}>
            <p className={styles.topic}>{form.topic}</p>
            <LeadForm
              key={`${form.form}-${form.topic}`}
              title={formCfg.title}
              sub={formCfg.sub}
              topic={form.topic}
              fields={withQuestion ? ["name", "phone", "telegram", "question"] : ["name", "phone", "telegram"]}
            />
          </div>
        )}

        {bio && (
          <div className={styles.bio}>
            <Image className={styles.photo} src={bio.photo} alt={bio.name} width={420} height={530} sizes="(max-width: 767px) 90vw, 26rem" />
            <div className={styles.bioBody}>
              <h3 className={styles.name}>{bio.name}</h3>
              {bio.role && <p className={styles.role}>{bio.role}</p>}
              <p className={styles.text}>{bio.bio}</p>
              {bio.book && (
                <Link href="/kniga" className={styles.book} onClick={() => ref.current?.close()}>
                  {KURS_PAGE.speakers.bookLabel}
                  <svg width="16" height="16" viewBox="0 0 41 41" aria-hidden="true">
                    <path d="M15 26 26 15M16 15h10v10" />
                  </svg>
                </Link>
              )}
              {bio.id === "boev" && (
                <button
                  type="button"
                  className={styles.contact}
                  onClick={() => setPanel({ kind: "form", form: "personal", topic: `Связаться: ${bio.name}` })}
                >
                  Связаться со мной
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>

      <ReviewModal review={video} onClose={closeVideo} />
    </>
  );
}
