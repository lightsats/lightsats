/*
  Warnings:

  - Added the required column `tipperId` to the `TipGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TipGroup" ADD COLUMN     "tipperId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TipGroup" ADD CONSTRAINT "TipGroup_tipperId_fkey" FOREIGN KEY ("tipperId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
