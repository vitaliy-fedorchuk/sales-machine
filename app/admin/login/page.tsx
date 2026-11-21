import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth/session";
import a from "../admin.module.css";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Вход" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className={a.login}>
      <div className={a.loginBox}>
        <span className={a.loginBrand}>Sales Machine · админка</span>
        <h1 className={a.loginTitle}>Вход</h1>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
