-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "ip" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totpLastStep" INTEGER,
ADD COLUMN     "totpPending" TEXT,
ADD COLUMN     "totpSecret" TEXT;
