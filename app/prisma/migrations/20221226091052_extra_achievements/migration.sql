-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AchievementType" ADD VALUE 'TIPPED_A_BITCOINER';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_CREATED';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_FUNDED';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_CLAIMED';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_WITHDRAWN';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_ALL_WITHDRAWN';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_10';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_25';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_50';
ALTER TYPE "AchievementType" ADD VALUE 'BULK_TIP_100';
ALTER TYPE "AchievementType" ADD VALUE 'PRINTED_CARD_TIP_CLAIMED';
ALTER TYPE "AchievementType" ADD VALUE 'PRINTED_CARD_TIP_WITHDRAWN';
