import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { ContactsProvider } from "@/components/ContactsProvider";
import Providers from "@/components/Providers";
import SiteCode from "@/components/SiteCode";
import { headMetas } from "@/lib/siteCode";
import { getContent } from "@/lib/content";
import ThemeToggle from "@/components/ThemeToggle";
import PageTransition from "@/components/transition/PageTransition";
import "./globals.css";

// Тимчасово Manrope. Коли клієнт надасть ліцензований Gilroy Medium —
// замінити на next/font/local з тією ж змінною --font-main.
const main = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-main",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sales Machine — иммерсивный маркетинг",
  description: "Маркетинговое агентство Sales Machine. Методология «Иммерсивный маркетинг».",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0f" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [contacts, code] = await Promise.all([getContent("contacts"), getContent("code")]);
  return (
    <html lang="ru" className={`${main.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {headMetas(code.head).map((m, i) => (
          <meta key={i} {...m} />
        ))}
      </head>
      <body>
        <Providers>
          <ContactsProvider value={contacts}>{children}</ContactsProvider>
          <ThemeToggle />
          <PageTransition />
        </Providers>
        <SiteCode code={code} />
      </body>
    </html>
  );
}
