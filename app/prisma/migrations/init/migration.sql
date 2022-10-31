-- CreateEnum
CREATE TYPE "TipStatus" AS ENUM ('UNFUNDED', 'UNCLAIMED', 'CLAIMED', 'WITHDRAWN', 'REFUNDED', 'WITHDRAWING', 'WITHDRAWAL_FAILED', 'RECLAIMED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "WithdrawalFlow" AS ENUM ('tipper', 'tippee');

-- CreateEnum
CREATE TYPE "WithdrawalMethod" AS ENUM ('lnurlw', 'invoice');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lnurlPublicKey" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "name" TEXT,
    "avatarURL" TEXT,
    "twitterUsername" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "journeyStep" INTEGER NOT NULL DEFAULT 1,
    "inJourney" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "tipperId" TEXT NOT NULL,
    "tippeeId" TEXT,
    "tippeeName" TEXT,
    "invoice" TEXT,
    "invoiceId" TEXT,
    "status" "TipStatus" NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "currency" TEXT,
    "note" VARCHAR(255),
    "withdrawalInvoiceId" TEXT,
    "withdrawalInvoice" TEXT,
    "withdrawalFlow" "WithdrawalFlow",
    "withdrawalMethod" "WithdrawalMethod",
    "payInvoiceStatus" INTEGER,
    "payInvoiceStatusText" TEXT,
    "payInvoiceErrorBody" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "withdrawalId" TEXT,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LnbitsWallet" (
    "id" TEXT NOT NULL,
    "tipId" TEXT,
    "userId" TEXT,
    "lnbitsUserId" TEXT NOT NULL,
    "adminKey" TEXT NOT NULL,

    CONSTRAINT "LnbitsWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LnurlAuthKey" (
    "k1" TEXT NOT NULL,
    "key" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LnurlAuthKey_pkey" PRIMARY KEY ("k1")
);

-- CreateTable
CREATE TABLE "WithdrawalLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "withdrawalCode" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "lnurl" TEXT NOT NULL,

    CONSTRAINT "WithdrawalLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalLinkTip" (
    "tipId" TEXT NOT NULL,
    "withdrawalLinkId" TEXT NOT NULL,

    CONSTRAINT "WithdrawalLinkTip_pkey" PRIMARY KEY ("tipId","withdrawalLinkId")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routingFee" INTEGER NOT NULL,
    "withdrawalInvoiceId" TEXT NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_lnurlPublicKey_key" ON "User"("lnurlPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LnbitsWallet_tipId_key" ON "LnbitsWallet"("tipId");

-- CreateIndex
CREATE UNIQUE INDEX "LnbitsWallet_userId_key" ON "LnbitsWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalLink_withdrawalCode_key" ON "WithdrawalLink"("withdrawalCode");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalLink_memo_key" ON "WithdrawalLink"("memo");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tipperId_fkey" FOREIGN KEY ("tipperId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_tippeeId_fkey" FOREIGN KEY ("tippeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "Withdrawal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LnbitsWallet" ADD CONSTRAINT "LnbitsWallet_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "Tip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LnbitsWallet" ADD CONSTRAINT "LnbitsWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalLink" ADD CONSTRAINT "WithdrawalLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalLinkTip" ADD CONSTRAINT "WithdrawalLinkTip_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "Tip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalLinkTip" ADD CONSTRAINT "WithdrawalLinkTip_withdrawalLinkId_fkey" FOREIGN KEY ("withdrawalLinkId") REFERENCES "WithdrawalLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

