/*
  Warnings:

  - You are about to drop the column `payInvoiceErrorBody` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `payInvoiceStatus` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `payInvoiceStatusText` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawalFlow` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawalInvoice` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawalInvoiceId` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawalMethod` on the `Tip` table. All the data in the column will be lost.
  - Added the required column `withdrawalFlow` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `withdrawalInvoice` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `withdrawalMethod` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tip" DROP COLUMN "payInvoiceErrorBody",
DROP COLUMN "payInvoiceStatus",
DROP COLUMN "payInvoiceStatusText",
DROP COLUMN "withdrawalFlow",
DROP COLUMN "withdrawalInvoice",
DROP COLUMN "withdrawalInvoiceId",
DROP COLUMN "withdrawalMethod";

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "withdrawalFlow" "WithdrawalFlow" NOT NULL,
ADD COLUMN     "withdrawalInvoice" TEXT NOT NULL,
ADD COLUMN     "withdrawalMethod" "WithdrawalMethod" NOT NULL;

-- CreateTable
CREATE TABLE "WithdrawalError" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WithdrawalError_pkey" PRIMARY KEY ("id")
);
