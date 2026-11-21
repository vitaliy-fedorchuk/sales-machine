"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/server/auth/actions";
import a from "../admin.module.css";

export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className={a.form}>
      {next && <input type="hidden" name="next" value={next} />}
      <label className={a.field}>
        <span className={a.fieldLabel}>Почта</span>
        <input className={a.input} type="email" name="email" autoComplete="username" required defaultValue={state.email} autoFocus />
      </label>
      <label className={a.field}>
        <span className={a.fieldLabel}>Пароль</span>
        <input className={a.input} type="password" name="password" autoComplete="current-password" required />
      </label>
      {state.error && (
        <p className={a.alert} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className={a.btnPrimary} disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
