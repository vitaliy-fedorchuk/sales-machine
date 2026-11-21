import type { CaseBlock } from "../../lib/cases/schema";

/** Фото для сиду: файл у prisma/seed/img — сид завантажить його в медіатеку */
export type SeedImage = { file: string; alt: string };
/** Аудіо для сиду: файл у prisma/seed/audio */
export type SeedAudio = { file: string; title: string };

type WithSeedImages<B> = B extends { type: "audio" }
  ? Omit<B, "id" | "items"> & { items: SeedAudio[] }
  : B extends { image: unknown }
  ? Omit<B, "id" | "image"> & { image: SeedImage }
  : B extends { images: unknown }
    ? Omit<B, "id" | "images"> & { images: SeedImage[] }
    : Omit<B, "id">;

export type SeedBlock = CaseBlock extends infer B ? (B extends CaseBlock ? WithSeedImages<B> : never) : never;

export type SeedCase = {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  cats: string[];
  cover?: SeedImage;
  cta?: string;
  publishedAt: string;
  blocks: SeedBlock[];
};
