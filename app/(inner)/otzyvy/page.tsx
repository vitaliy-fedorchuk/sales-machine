import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import Reviews from "@/components/otzyvy/Reviews";
import { OTZYVY_PAGE as P } from "@/lib/pages/otzyvy";

export const metadata: Metadata = {
  title: "Отзывы — Sales Machine",
  description: "Видеоотзывы клиентов Sales Machine: голоса, которые громче любой рекламы.",
};

export default function OtzyvyPage() {
  return (
    <>
      <BackLink word={P.word} />
      <Reviews />
    </>
  );
}
