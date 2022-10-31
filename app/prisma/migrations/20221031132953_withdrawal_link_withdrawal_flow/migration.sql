/*
  Warnings:

  - You are about to drop the column `withdrawalCode` on the `WithdrawalLink` table. All the data in the column will be lost.
  - Added the required column `withdrawalFlow` to the `WithdrawalLink` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WithdrawalLink_withdrawalCode_key";

-- AlterTable
ALTER TABLE "WithdrawalLink" DROP COLUMN "withdrawalCode",
ADD COLUMN     "withdrawalFlow" "WithdrawalFlow" NOT NULL;
