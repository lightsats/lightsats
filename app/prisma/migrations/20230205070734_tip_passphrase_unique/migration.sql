/*
  Warnings:

  - A unique constraint covering the columns `[text]` on the table `TipPassphrase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TipPassphrase_text_key" ON "TipPassphrase"("text");
