/*
  Warnings:

  - A unique constraint covering the columns `[tipGroupId]` on the table `LnbitsWallet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LnbitsWallet" ADD COLUMN     "tipGroupId" TEXT;

-- AlterTable
ALTER TABLE "TipGroup" ADD COLUMN     "invoice" TEXT,
ADD COLUMN     "invoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "LnbitsWallet_tipGroupId_key" ON "LnbitsWallet"("tipGroupId");

-- AddForeignKey
ALTER TABLE "LnbitsWallet" ADD CONSTRAINT "LnbitsWallet_tipGroupId_fkey" FOREIGN KEY ("tipGroupId") REFERENCES "TipGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
