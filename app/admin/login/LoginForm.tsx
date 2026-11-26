"use client";

import { useActionState, useState } from "react";
import { login, type LoginState } from "@/lib/server/auth/actions";
import a from "../admin.module.css";

/**
 * Вхід: пошта + пароль; якщо в акаунта ввімкнена 2FA — другим кроком код із застосунку.
 * Пошта й пароль у стані компонента: після першого кроку форма не очищається.
 */
export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const step2 = !!state.needCode;

  return (
    <form action={action} className={a.form}>
      {next && <input type="hidden" name="next" value={next} />}
      <label className={a.field} hidden={step2}>
        <span className={a.fieldLabel}>Почта</span>
        <input
          className={a.input}
          type="email"
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
      </label>
      <label className={a.field} hidden={step2}>
        <span className={a.fieldLabel}>Пароль</span>
        <input
          className={a.input}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {step2 && (
        <label className={a.field}>
          <span className={a.fieldLabel}>Код из приложения</span>
          <input
            key={state.error ?? "code"}
            className={a.input}
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            placeholder="123 456"
            required
            autoFocus
          />
          <span className={a.fieldHint}>Откройте Google Authenticator (или другое приложение) и введите 6 цифр для Sales Machine.</span>
        </label>
      )}
      {state.error && (
        <p className={a.alert} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className={a.btnPrimary} disabled={pending}>
        {pending ? "Входим…" : step2 ? "Подтвердить" : "Войти"}
      </button>
    </form>
  );
}
