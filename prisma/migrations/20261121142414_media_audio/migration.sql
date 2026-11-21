-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'AUDIO');

-- DropIndex
DROP INDEX "Media_createdAt_idx";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "mime" TEXT NOT NULL DEFAULT 'image/webp',
ALTER COLUMN "width" SET DEFAULT 0,
ALTER COLUMN "height" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Media_kind_createdAt_idx" ON "Media"("kind", "createdAt");
