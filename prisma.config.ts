import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // npm run db:seed — перенесені кейси (з фото в медіатеку)
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Міграції й сид — через пряме з'єднання. Neon (Vercel) дає пул у DATABASE_URL і пряме в
    // DATABASE_URL_UNPOOLED; локально й на своєму сервері є лише DATABASE_URL.
    url: process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL"),
  },
});
