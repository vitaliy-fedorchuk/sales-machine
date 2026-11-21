import type { Metadata } from "next";
import NotFoundGame from "@/components/notfound/NotFoundGame";

export const metadata: Metadata = {
  title: "404 — страница не найдена · Sales Machine",
};

export default function NotFound() {
  return (
    <main>
      <NotFoundGame />
    </main>
  );
}
