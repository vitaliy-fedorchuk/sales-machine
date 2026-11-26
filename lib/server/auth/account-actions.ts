"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { sendTelegram } from "../telegram";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "./password";
import { getClientIp } from "./rate-limit";
import { deleteOtherSessions, requireUser } from "./session";
import { checkTotp, newTotpSecret, totpQr } from "./totp";

/** Профіль: свій пароль, 2FA, входи на інших пристроях. Кожна дія — лише над власним акаунтом. */

export type FormState = { ok?: string; error?: string };

const str = (v: FormDataEntryValue | null) => String(v ?? "");

// ---------- пароль ----------

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const current = str(form.get("current"));
  const next = str(form.get("next"));
  const repeat = str(form.get("repeat"));

  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(user.passwordHash, current))) return { error: "Текущий пароль указан неверно" };
  if (next.length < MIN_PASSWORD_LENGTH) return { error: `Новый пароль — не короче ${MIN_PASSWORD_LENGTH} символов` };
  if (next.length > 200) return { error: "Слишком длинный пароль" };
  if (next !== repeat) return { error: "Пароли не совпадают" };
  if (next === current) return { error: "Новый пароль совпадает с текущим" };

  await db.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(next) } });
  const closed = await deleteOtherSessions(me.id);
  await sendTelegram("alerts", `🔑 ${me.name} (${me.email}) сменил(а) пароль админки. IP ${await getClientIp()}`);
  revalidatePath("/admin/account");
  return { ok: closed ? `Пароль изменён. Вход на других устройствах завершён (${closed}).` : "Пароль изменён." };
}

// ---------- 2FA ----------

/** Крок 1: новий секрет (ще не діє) + QR для застосунку */
export async function startTotp(): Promise<{ qr: string; secret: string } | { error: string }> {
  const me = await requireUser();
  if (me.has2fa) return { error: "Двухфакторная защита уже включена" };
  const secret = newTotpSecret();
  await db.user.update({ where: { id: me.id }, data: { totpPending: secret } });
  return { qr: await totpQr(secret, me.email), secret };
}

/** Крок 2: перший код із застосунку підтверджує, що все налаштовано — вмикаємо */
export async function confirmTotp(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!user.totpPending) return { error: "Начните подключение заново" };
  const step = checkTotp(user.totpPending, str(form.get("code")));
  if (step === null) return { error: "Код не подошёл. Проверьте время на телефоне и введите новый код." };

  await db.user.update({ where: { id: me.id }, data: { totpSecret: user.totpPending, totpPending: null, totpLastStep: step } });
  await sendTelegram("alerts", `🛡 ${me.name} (${me.email}) включил(а) двухфакторную защиту.`);
  revalidatePath("/admin", "layout");
  return { ok: "Двухфакторная защита включена. Теперь при входе нужен код из приложения." };
}

/** Вимкнути 2FA — потрібні і пароль, і поточний код (щоб не вимкнув той, хто сів за відкритий ноутбук) */
export async function disableTotp(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!user.totpSecret) return { error: "Двухфакторная защита уже выключена" };
  if (!(await verifyPassword(user.passwordHash, str(form.get("password"))))) return { error: "Неверный пароль" };
  if (checkTotp(user.totpSecret, str(form.get("code")), user.totpLastStep) === null) return { error: "Неверный код из приложения" };

  await db.user.update({ where: { id: me.id }, data: { totpSecret: null, totpPending: null, totpLastStep: null } });
  await sendTelegram("alerts", `⚠️ ${me.name} (${me.email}) выключил(а) двухфакторную защиту. IP ${await getClientIp()}`);
  revalidatePath("/admin", "layout");
  return { ok: "Двухфакторная защита выключена." };
}

// ---------- сесії ----------

export async function logoutOtherDevices(_prev?: FormState): Promise<FormState> {
  const me = await requireUser();
  const closed = await deleteOtherSessions(me.id);
  if (closed) await sendTelegram("alerts", `🚪 ${me.name} (${me.email}) завершил(а) вход на других устройствах (${closed}).`);
  revalidatePath("/admin/account");
  return { ok: closed ? `Готово: завершено входов — ${closed}.` : "Других входов нет." };
}
