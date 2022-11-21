-- AddForeignKey
ALTER TABLE "WithdrawalError" ADD CONSTRAINT "WithdrawalError_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
