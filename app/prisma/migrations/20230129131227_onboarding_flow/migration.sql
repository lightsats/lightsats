-- CreateEnum
CREATE TYPE "OnboardingFlow" AS ENUM ('DEFAULT', 'SKIP', 'LIGHTNING');

-- AlterTable
ALTER TABLE "Tip" ADD COLUMN     "onboardingFlow" "OnboardingFlow" NOT NULL DEFAULT 'DEFAULT';

-- Copy old skipOnboarding value to new tips
UPDATE "Tip" SET "onboardingFlow" = 'SKIP' WHERE "skipOnboarding" = true;
