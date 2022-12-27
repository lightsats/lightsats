-- CreateEnum
CREATE TYPE "LeaderboardTheme" AS ENUM ('CHRISTMAS');

-- AlterTable
ALTER TABLE "Leaderboard" ADD COLUMN     "theme" "LeaderboardTheme";
