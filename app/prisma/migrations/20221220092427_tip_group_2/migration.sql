/*
  Warnings:

  - Added the required column `quantity` to the `TipGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "groupTipIndex" INTEGER;

-- AlterTable
ALTER TABLE "TipGroup" ADD COLUMN     "quantity" INTEGER NOT NULL;
