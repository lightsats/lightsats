/*
  Warnings:

  - Changed the type of `smsType` on the `SmsLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SmsLog" DROP COLUMN "smsType",
ADD COLUMN     "smsType" "SmsType" NOT NULL;
