-- CreateTable
CREATE TABLE "UserAPIKey" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserAPIKey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAPIKey" ADD CONSTRAINT "UserAPIKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
