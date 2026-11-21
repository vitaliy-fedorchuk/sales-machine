import type { Metadata } from "next";
import BackLink from "@/components/inner/BackLink";
import SocialFooter from "@/components/inner/SocialFooter";
import Reviews from "@/components/otzyvy/Reviews";
import { getContent } from "@/lib/content";
import { toReview } from "@/lib/content/reviews";

export const metadata: Metadata = {
  title: "Отзывы — Sales Machine",
  description: "Видеоотзывы клиентов Sales Machine: голоса, которые громче любой рекламы.",
};

export default async function OtzyvyPage() {
  const P = await getContent("otzyvy");
  return (
    <>
      <BackLink word={P.word} />
      <Reviews title={P.title} reviews={P.reviews.map(toReview)} footer={<SocialFooter />} />
    </>
  );
}
