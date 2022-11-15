-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "claimed" TIMESTAMP(3);

UPDATE "Tip" SET "claimed" = CURRENT_TIMESTAMP WHERE "tippeeId" IS NOT NULL
