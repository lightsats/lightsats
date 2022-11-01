-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('SUPERADMIN');

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleType" "RoleType" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleType")
);

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
