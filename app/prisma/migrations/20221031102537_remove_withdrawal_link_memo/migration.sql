/*
  Warnings:

  - You are about to drop the column `memo` on the `WithdrawalLink` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "WithdrawalLink_memo_key";

-- AlterTable
ALTER TABLE "WithdrawalLink" DROP COLUMN "memo";
