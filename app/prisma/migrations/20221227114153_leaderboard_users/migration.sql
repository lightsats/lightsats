-- AlterTable
ALTER TABLE "Leaderboard" ADD COLUMN     "password" TEXT,
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "LeaderboardUser" (
    "userId" TEXT NOT NULL,
    "leaderboardId" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardUser_pkey" PRIMARY KEY ("userId","leaderboardId")
);

-- AddForeignKey
ALTER TABLE "LeaderboardUser" ADD CONSTRAINT "LeaderboardUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardUser" ADD CONSTRAINT "LeaderboardUser_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
