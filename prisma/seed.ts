/**
 * Перше наповнення бази: кейси, перенесені зі старого сайту (prisma/seed/*.ts).
 * Фото проходять ту саму обробку, що й завантажені в адмінці (4 розміри webp у сховищі)
 * і з'являються в медіатеці. Кейс, який уже є в базі (за slug), пропускається — сид можна запускати повторно.
 *
 *   npm run db:seed            — локально (фото в ./uploads)
 *   на проді: з DATABASE_URL і BLOB_READ_WRITE_TOKEN від Vercel (фото в Blob)
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../lib/generated/prisma/client";
import { caseBlockSchema, type CaseImage } from "../lib/cases/schema";
import { newMediaId, processAudio, processImage } from "../lib/server/media/process";
import avtoKungFu from "./seed/avto-kung-fu";
import dobryyKot from "./seed/dobryy-kot";
import europeanPropertyAwards from "./seed/european-property-awards";
import golosGucci from "./seed/golos-gucci";
import kashemirovyyKrab from "./seed/kashemirovyy-krab";
import fundamentalnyeOtcy from "./seed/fundamentalnye-otcy";
import harizmy from "./seed/harizmy";
import krasivoModnoVkusno from "./seed/krasivo-modno-vkusno";
import mamino from "./seed/mamino";
import pereupakovka from "./seed/pereupakovka";
import richspeys from "./seed/richspeys";
import type { SeedAudio, SeedCase, SeedImage } from "./seed/types";

const CASES: SeedCase[] = [kashemirovyyKrab, golosGucci, pereupakovka, europeanPropertyAwards, avtoKungFu, dobryyKot, krasivoModnoVkusno, fundamentalnyeOtcy, richspeys, harizmy, mamino];

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

/** Один файл — одне фото в медіатеці, навіть якщо стоїть у кейсі двічі (обкладинка + блок) */
const uploaded = new Map<string, CaseImage>();

const upload = async (img: SeedImage): Promise<CaseImage> => {
  const done = uploaded.get(img.file);
  if (done) return { ...done, alt: img.alt };
  const file = path.join(import.meta.dirname, "seed", "img", img.file);
  const buf = await readFile(file);
  const id = newMediaId();
  const p = await processImage(buf, id);
  await db.media.create({
    data: { id, ...p, originalName: path.basename(img.file), originalBytes: buf.byteLength, alt: img.alt },
  });
  const res = { src: p.url, alt: img.alt, width: p.width, height: p.height };
  uploaded.set(img.file, res);
  console.log(`  фото ${img.file} → ${p.url}`);
  return res;
};

/** Аудіо → медіатека (як є) */
const uploadAudio = async (a: SeedAudio) => {
  const buf = await readFile(path.join(import.meta.dirname, "seed", "audio", a.file));
  const id = newMediaId();
  const p = await processAudio(buf, id);
  await db.media.create({
    data: { id, kind: "AUDIO", ...p, originalName: path.basename(a.file), originalBytes: buf.byteLength, alt: a.title },
  });
  console.log(`  аудио ${a.file} → ${p.url}`);
  return { title: a.title, src: p.url };
};

async function main() {
  for (const c of CASES) {
    if (await db.case.findUnique({ where: { slug: c.slug } })) {
      console.log(`• ${c.slug} — уже есть, пропускаю`);
      continue;
    }
    console.log(`• ${c.slug}`);
    const blocks = [];
    for (const b of c.blocks) {
      const block: Record<string, unknown> = { ...b, id: randomUUID() };
      if ("image" in b) block.image = await upload(b.image);
      if ("images" in b) block.images = await Promise.all(b.images.map(upload));
      if (b.type === "audio") block.items = await Promise.all(b.items.map(uploadAudio));
      blocks.push(caseBlockSchema.parse(block)); // той самий контроль, що й при публікації в адмінці
    }
    const cover = c.cover ? await upload(c.cover) : null;
    await db.case.create({
      data: {
        slug: c.slug,
        title: c.title,
        seoTitle: c.seoTitle ?? null,
        description: c.description,
        cats: c.cats,
        coverSrc: cover?.src ?? "",
        coverAlt: cover?.alt ?? "",
        cta: c.cta ?? null,
        status: "PUBLISHED",
        publishedAt: new Date(c.publishedAt),
        blocks: blocks as Prisma.InputJsonValue,
      },
    });
  }
}

main()
  .then(() => console.log("Готово"))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
