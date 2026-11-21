"use client";

import { useCallback, useState } from "react";
import ScrollScene from "@/components/inner/ScrollScene";
import type { ReactNode } from "react";
import page from "@/components/inner/page.module.css";
import type { Review } from "@/lib/pages/otzyvy";
import ReviewModal from "./ReviewModal";
import ReviewTitles from "./ReviewTitles";

/** Сторінка відгуків: «титри» імен + попап з повним відео. */
/** footer — серверний SocialFooter (читає соцмережі з адмінки), передається зі сторінки */
export default function Reviews({ title, reviews, footer }: { title: string; reviews: readonly Review[]; footer: ReactNode }) {
  const [open, setOpen] = useState<Review | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {title}
            </h1>
          </div>
        </section>

        <ReviewTitles reviews={reviews} onOpen={setOpen} />

        {footer}
      </ScrollScene>

      <ReviewModal review={open} onClose={close} />
    </>
  );
}
