-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AchievementType" ADD VALUE 'EARLY_SUPPORTER';
ALTER TYPE "AchievementType" ADD VALUE 'SENT_1K';
ALTER TYPE "AchievementType" ADD VALUE 'SENT_10K';
ALTER TYPE "AchievementType" ADD VALUE 'SENT_100K';
ALTER TYPE "AchievementType" ADD VALUE 'SENT_1M';
ALTER TYPE "AchievementType" ADD VALUE 'TOP_10';
ALTER TYPE "AchievementType" ADD VALUE 'TOP_3';
ALTER TYPE "AchievementType" ADD VALUE 'TOP_1';
ALTER TYPE "AchievementType" ADD VALUE 'MOST_WITHDRAWN_TIPS';
