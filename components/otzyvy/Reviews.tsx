"use client";

import { useCallback, useState } from "react";
import ScrollScene from "@/components/inner/ScrollScene";
import SocialFooter from "@/components/inner/SocialFooter";
import page from "@/components/inner/page.module.css";
import { OTZYVY_PAGE as P, type Review } from "@/lib/pages/otzyvy";
import ReviewModal from "./ReviewModal";
import ReviewTitles from "./ReviewTitles";

/** Сторінка відгуків: «титри» імен + попап з повним відео. */
export default function Reviews() {
  const [open, setOpen] = useState<Review | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <ScrollScene className={page.page}>
        <section className={page.hero}>
          <div className={page.titleBox}>
            <h1 className={page.title} data-axis-mark="01" data-reveal>
              {P.title}
            </h1>
          </div>
        </section>

        <ReviewTitles onOpen={setOpen} />

        <SocialFooter />
      </ScrollScene>

      <ReviewModal review={open} onClose={close} />
    </>
  );
}
