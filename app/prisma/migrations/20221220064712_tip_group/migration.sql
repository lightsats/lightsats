-- CreateEnum
CREATE TYPE "TipGroupStatus" AS ENUM ('UNFUNDED', 'FUNDED');

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "TipGroup" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "status" "TipGroupStatus" NOT NULL,
    "name" TEXT,

    CONSTRAINT "TipGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TipGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
