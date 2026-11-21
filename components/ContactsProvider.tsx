"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ContentData } from "@/lib/content/registry";

export type Contacts = ContentData<"contacts">;

const Ctx = createContext<Contacts | null>(null);

/** Контакти з адмінки («Контакты и соцсети») — для клієнтських компонентів (попап «Привет, это Вадим»). */
export function ContactsProvider({ value, children }: { value: Contacts; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useContacts = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useContacts: немає ContactsProvider у layout");
  return v;
};
