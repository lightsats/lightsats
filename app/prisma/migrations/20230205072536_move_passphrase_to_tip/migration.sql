/*
  Warnings:

  - You are about to drop the `TipPassphrase` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[passphrase]` on the table `Tip` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TipPassphrase" DROP CONSTRAINT "TipPassphrase_tipId_fkey";

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "passphrase" TEXT;

-- DropTable
DROP TABLE "TipPassphrase";

-- CreateIndex
CREATE UNIQUE INDEX "Tip_passphrase_key" ON "Tip"("passphrase");
