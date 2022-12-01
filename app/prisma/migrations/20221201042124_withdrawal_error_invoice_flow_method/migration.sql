-- AlterTable
ALTER TABLE "WithdrawalError" ADD COLUMN     "withdrawalFlow" "WithdrawalFlow",
ADD COLUMN     "withdrawalInvoice" TEXT,
ADD COLUMN     "withdrawalMethod" "WithdrawalMethod";
