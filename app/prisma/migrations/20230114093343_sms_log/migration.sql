-- CreateEnum
CREATE TYPE "SmsType" AS ENUM ('LOGIN', 'REMINDER');

-- CreateTable
CREATE TABLE "SmsLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "userId" TEXT,
    "smsType" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "usedProvider" TEXT,

    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id")
);
