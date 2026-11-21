/**
 * Створити користувача адмінки або оновити існуючого.
 *
 *   npm run admin:create -- --email vadim@example.com --name "Вадим" [--role ADMIN|EDITOR] [--password ...] [--reset-password]
 *
 * Новий користувач: без --password генерується надійний пароль і показується ОДИН раз.
 * Існуючий: оновлюються ім'я / роль; пароль змінюється лише з --password
 * або --reset-password (тоді всі його входи завершуються).
 * На проді — запускати з DATABASE_URL від Vercel.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type UserRole } from "../lib/generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../lib/server/auth/password";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    password: { type: "string" },
    "reset-password": { type: "boolean", default: false },
  },
});

const email = values.email?.trim().toLowerCase();
const role = values.role?.toUpperCase() as UserRole | undefined;

if (!email || !email.includes("@") || (role && role !== "ADMIN" && role !== "EDITOR")) {
  console.error('Использование: npm run admin:create -- --email you@example.com --name "Имя" [--role ADMIN|EDITOR]');
  process.exit(1);
}
if (values.password && values.password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`);
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const main = async () => {
  const existing = await db.user.findUnique({ where: { email } });
  const newPassword = values.password ?? (!existing || values["reset-password"] ? randomBytes(12).toString("base64url") : null);

  const user = existing
    ? await db.user.update({
        where: { email },
        data: {
          ...(values.name && { name: values.name }),
          ...(role && { role }),
          ...(newPassword && { passwordHash: await hashPassword(newPassword) }),
        },
      })
    : await db.user.create({
        data: { email, name: values.name ?? email.split("@")[0], role: role ?? "ADMIN", passwordHash: await hashPassword(newPassword!) },
      });

  if (existing && newPassword) await db.session.deleteMany({ where: { userId: user.id } });

  console.log(existing ? `Обновлён ${email}.` : `Создан ${email} (${user.role}).`);
  if (newPassword && !values.password) console.log(`Пароль: ${newPassword}\nСохраните его — больше он нигде не показывается.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
