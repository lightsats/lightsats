/*
  Warnings:

  - You are about to drop the column `suggestedWalletId` on the `Tip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tip" DROP COLUMN "suggestedWalletId",
ADD COLUMN     "recommendedWalletId" TEXT;
