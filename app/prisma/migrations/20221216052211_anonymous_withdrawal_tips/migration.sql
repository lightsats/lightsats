-- DropForeignKey
ALTER TABLE "WithdrawalLink" DROP CONSTRAINT "WithdrawalLink_userId_fkey";

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "lastWithdrawal" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WithdrawalError" ADD COLUMN     "tipId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WithdrawalLink" ADD COLUMN     "tipId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WithdrawalLink" ADD CONSTRAINT "WithdrawalLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalLink" ADD CONSTRAINT "WithdrawalLink_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "Tip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalError" ADD CONSTRAINT "WithdrawalError_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "Tip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
