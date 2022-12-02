/*
  Warnings:

  - The values [SELF_WITHDRAWN,WEBLN_FUNDED] on the enum `AchievementType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AchievementType_new" AS ENUM ('SELF_CLAIMED', 'BECAME_TIPPER', 'LINKED_EMAIL', 'LINKED_WALLET', 'SET_NAME', 'SET_AVATAR_URL', 'SET_LIGHTNING_ADDRESS', 'CREATED_TIP', 'FUNDED_TIP', 'TIP_CLAIMED', 'TIP_WITHDRAWN', 'WEBLN_WITHDRAWN', 'MANUAL_WITHDRAWN', 'LNURL_WITHDRAWN');
ALTER TABLE "Notification" ALTER COLUMN "achievementType" TYPE "AchievementType_new" USING ("achievementType"::text::"AchievementType_new");
ALTER TABLE "Achievement" ALTER COLUMN "type" TYPE "AchievementType_new" USING ("type"::text::"AchievementType_new");
ALTER TYPE "AchievementType" RENAME TO "AchievementType_old";
ALTER TYPE "AchievementType_new" RENAME TO "AchievementType";
DROP TYPE "AchievementType_old";
COMMIT;
