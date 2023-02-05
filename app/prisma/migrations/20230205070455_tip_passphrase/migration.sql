-- CreateTable
CREATE TABLE "TipPassphrase" (
    "tipId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "TipPassphrase_pkey" PRIMARY KEY ("tipId")
);

-- AddForeignKey
ALTER TABLE "TipPassphrase" ADD CONSTRAINT "TipPassphrase_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "Tip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
