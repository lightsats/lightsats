/*
  Warnings:

  - You are about to drop the column `achievementId` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "achievementId",
ADD COLUMN     "achievementType" "AchievementType";
