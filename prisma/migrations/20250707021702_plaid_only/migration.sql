/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ExpenseToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "_ExpenseToTag" DROP CONSTRAINT "_ExpenseToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExpenseToTag" DROP CONSTRAINT "_ExpenseToTag_B_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "_ExpenseToTag";

-- DropEnum
DROP TYPE "CategoryType";

-- CreateTable
CREATE TABLE "PlaidAccount" (
    "id" TEXT NOT NULL,
    "plaidAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mask" TEXT,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "institutionId" TEXT NOT NULL,
    "linkTokenId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaidAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidTransaction" (
    "id" TEXT NOT NULL,
    "plaidTransactionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "merchantName" TEXT,
    "category" TEXT[],
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "paymentChannel" TEXT,
    "transactionType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaidTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaidLinkToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaidLinkToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaidAccount_plaidAccountId_key" ON "PlaidAccount"("plaidAccountId");

-- CreateIndex
CREATE INDEX "PlaidAccount_plaidAccountId_idx" ON "PlaidAccount"("plaidAccountId");

-- CreateIndex
CREATE INDEX "PlaidAccount_institutionId_idx" ON "PlaidAccount"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidTransaction_plaidTransactionId_key" ON "PlaidTransaction"("plaidTransactionId");

-- CreateIndex
CREATE INDEX "PlaidTransaction_accountId_idx" ON "PlaidTransaction"("accountId");

-- CreateIndex
CREATE INDEX "PlaidTransaction_date_idx" ON "PlaidTransaction"("date");

-- CreateIndex
CREATE INDEX "PlaidTransaction_pending_idx" ON "PlaidTransaction"("pending");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidLinkToken_token_key" ON "PlaidLinkToken"("token");

-- CreateIndex
CREATE INDEX "PlaidLinkToken_token_idx" ON "PlaidLinkToken"("token");

-- CreateIndex
CREATE INDEX "PlaidLinkToken_expiresAt_idx" ON "PlaidLinkToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "PlaidAccount" ADD CONSTRAINT "PlaidAccount_linkTokenId_fkey" FOREIGN KEY ("linkTokenId") REFERENCES "PlaidLinkToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidTransaction" ADD CONSTRAINT "PlaidTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PlaidAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
