-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('tipper', 'tippee');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'tipper';
