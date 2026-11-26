import "server-only";
import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";

/**
 * Двофакторний вхід: 6-значний код із застосунку (Google Authenticator, Яндекс Ключ, 1Password…).
 * Стандарт TOTP: код змінюється кожні 30 секунд.
 */
const PERIOD = 30;

const totp = (secret: string, label = "") =>
  new TOTP({ issuer: "Sales Machine", label, algorithm: "SHA1", digits: 6, period: PERIOD, secret: Secret.fromBase32(secret) });

export const newTotpSecret = () => new Secret({ size: 20 }).base32;

/** QR-код для застосунку (data:image/png) */
export const totpQr = (secret: string, email: string) =>
  QRCode.toDataURL(totp(secret, email).toString(), { margin: 1, width: 240, errorCorrectionLevel: "M" });

/**
 * Перевірка коду. Повертає номер 30-секундного кроку (зберігаємо його, щоб той самий код
 * не пройшов вдруге) або null. Допускаємо ±1 крок — годинник телефона може трохи відставати.
 */
export const checkTotp = (secret: string, code: string, lastStep?: number | null): number | null => {
  const token = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(token)) return null;
  const delta = totp(secret).validate({ token, window: 1 });
  if (delta === null) return null;
  const step = Math.floor(Date.now() / 1000 / PERIOD) + delta;
  if (lastStep != null && step <= lastStep) return null;
  return step;
};
