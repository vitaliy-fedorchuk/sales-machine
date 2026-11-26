"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { verifyAgainstDummy, verifyPassword } from "./password";
import { clearFailedLogins, getClientIp, isLoginBlocked, recordFailedLogin } from "./rate-limit";
import { describeDevice, sendTelegram } from "../telegram";
import { createSession, deleteSession } from "./session";
import { checkTotp } from "./totp";

export interface LoginState {
  error?: string;
  email?: string;
  /** Пароль вірний, потрібен код 2FA */
  needCode?: boolean;
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
  code: z.string().max(20).optional(),
  next: z.string().optional(),
});

/** Куди повернутись після входу — лише всередину адмінки (без відкритих редиректів) */
const safeNext = (next?: string) =>
  next && next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith("/admin/login")
    ? next
    : "/admin";

const WRONG = "Неверная почта или пароль";

const failed = async (email: string, ip: string, exists: boolean) => {
  const lockedNow = await recordFailedLogin(email, ip);
  if (lockedNow && exists) {
    await sendTelegram("alerts", `⚠️ Вход в админку заблокирован на 15 минут: много неверных попыток.
Почта: ${email}
IP: ${ip}
Если это не вы — кто-то подбирает пароль.`);
  }
};

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: WRONG, email: String(formData.get("email") ?? "") };

  const { email, password, code, next } = parsed.data;
  const ip = await getClientIp();

  if (await isLoginBlocked(email, ip)) {
    return { error: "Слишком много попыток. Попробуйте через 15 минут.", email };
  }

  const user = await db.user.findUnique({ where: { email } });
  const ok = user ? await verifyPassword(user.passwordHash, password) : await verifyAgainstDummy(password);

  if (!user || !ok) {
    await failed(email, ip, !!user);
    return { error: WRONG, email };
  }

  // Другий крок: код із застосунку
  let totpLastStep: number | undefined;
  if (user.totpSecret) {
    if (!code?.trim()) return { needCode: true, email };
    const step = checkTotp(user.totpSecret, code, user.totpLastStep);
    if (step === null) {
      await failed(email, ip, true);
      return { needCode: true, email, error: "Неверный или устаревший код. Введите новый код из приложения." };
    }
    totpLastStep = step;
  }

  await clearFailedLogins(email);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), ...(totpLastStep !== undefined && { totpLastStep }) } });
  await createSession(user.id, ip);

  const ua = (await headers()).get("user-agent");
  await sendTelegram(
    "alerts",
    `🔐 Вход в админку: ${user.name} (${user.email})\n${describeDevice(ua)}, IP ${ip}${user.totpSecret ? "" : "\n2FA не включена"}`,
  );

  redirect(safeNext(next));
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
