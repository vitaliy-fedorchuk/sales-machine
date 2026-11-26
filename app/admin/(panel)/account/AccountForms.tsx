"use client";

import { useActionState, useState, useTransition } from "react";
import {
  changePassword,
  confirmTotp,
  disableTotp,
  logoutOtherDevices,
  startTotp,
  type FormState,
} from "@/lib/server/auth/account-actions";
import a from "../../admin.module.css";

const Result = ({ state }: { state: FormState }) =>
  state.error ? (
    <p className={a.alert} role="alert">
      {state.error}
    </p>
  ) : state.ok ? (
    <p className={a.okNote} role="status">
      {state.ok}
    </p>
  ) : null;

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  return (
    <form action={action} className={a.form} key={state.ok}>
      <label className={a.field}>
        <span className={a.fieldLabel}>Текущий пароль</span>
        <input className={a.input} type="password" name="current" autoComplete="current-password" required />
      </label>
      <label className={a.field}>
        <span className={a.fieldLabel}>Новый пароль</span>
        <input className={a.input} type="password" name="next" autoComplete="new-password" minLength={10} required />
        <span className={a.fieldHint}>Не короче 10 символов. Лучше — фраза из нескольких слов, которую вы больше нигде не используете.</span>
      </label>
      <label className={a.field}>
        <span className={a.fieldLabel}>Новый пароль ещё раз</span>
        <input className={a.input} type="password" name="repeat" autoComplete="new-password" minLength={10} required />
      </label>
      <Result state={state} />
      <button type="submit" className={a.btnPrimary} disabled={pending}>
        {pending ? "Сохраняем…" : "Сменить пароль"}
      </button>
    </form>
  );
}

export function TwoFactor({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [startError, setStartError] = useState("");
  const [starting, startTransition] = useTransition();
  const [confirmState, confirmAction, confirming] = useActionState(confirmTotp, {});
  const [disableState, disableAction, disabling] = useActionState(disableTotp, {});

  if (enabled) {
    return (
      <>
        <p className={a.okNote}>Включена. При входе, кроме пароля, нужен код из приложения.</p>
        <details className={a.details}>
          <summary>Выключить двухфакторную защиту</summary>
          <form action={disableAction} className={a.form}>
            <label className={a.field}>
              <span className={a.fieldLabel}>Пароль</span>
              <input className={a.input} type="password" name="password" autoComplete="current-password" required />
            </label>
            <label className={a.field}>
              <span className={a.fieldLabel}>Код из приложения</span>
              <input className={a.input} name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required />
            </label>
            <Result state={disableState} />
            <button type="submit" className={a.btnDanger} disabled={disabling}>
              Выключить
            </button>
          </form>
        </details>
      </>
    );
  }

  if (confirmState.ok) return <p className={a.okNote}>{confirmState.ok}</p>;

  if (!setup) {
    return (
      <>
        <p className={a.lowResNote}>
          Выключена. Сейчас для входа достаточно пароля — если его украдут или подберут, в админку попадут. С защитой нужен ещё
          код из телефона.
        </p>
        {startError && <p className={a.alert}>{startError}</p>}
        <button
          type="button"
          className={a.btnPrimary}
          disabled={starting}
          onClick={() =>
            startTransition(async () => {
              const r = await startTotp();
              if ("error" in r) setStartError(r.error);
              else setSetup(r);
            })
          }
        >
          Подключить
        </button>
      </>
    );
  }

  return (
    <div className={a.totpSetup}>
      <ol className={a.steps}>
        <li>
          Установите на телефон <b>Google Authenticator</b> или <b>Яндекс Ключ</b> (подойдёт любое приложение для кодов).
        </li>
        <li>
          В приложении нажмите «+» → «Сканировать QR-код» и наведите камеру на код справа.
          <details className={a.details}>
            <summary>Не получается отсканировать?</summary>
            Введите ключ вручную: <code className={a.code}>{setup.secret.replace(/(.{4})/g, "$1 ").trim()}</code>
          </details>
        </li>
        <li>
          Введите 6 цифр, которые показало приложение:
          <form action={confirmAction} className={a.form}>
            <input
              className={a.input}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              placeholder="123 456"
              required
              autoFocus
            />
            <Result state={confirmState} />
            <button type="submit" className={a.btnPrimary} disabled={confirming}>
              Включить защиту
            </button>
          </form>
        </li>
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element -- data:-URL QR-коду */}
      <img src={setup.qr} alt="QR-код для приложения" width={240} height={240} className={a.qr} />
    </div>
  );
}

export function LogoutOthers() {
  const [state, action, pending] = useActionState(logoutOtherDevices, {});
  return (
    <form action={action} style={{ marginTop: 12 }}>
      <Result state={state} />
      <button type="submit" className={a.btn} disabled={pending}>
        Выйти на всех других устройствах
      </button>
    </form>
  );
}
