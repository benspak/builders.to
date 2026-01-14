-- Add betting-related token transaction types
ALTER TYPE "TokenTransactionType" ADD VALUE 'BET_PLACED';
ALTER TYPE "TokenTransactionType" ADD VALUE 'BET_WON';
ALTER TYPE "TokenTransactionType" ADD VALUE 'BET_REFUND';
ALTER TYPE "TokenTransactionType" ADD VALUE 'BET_HOUSE_FEE';

-- Add betting enabled flag to User
ALTER TABLE "User" ADD COLUMN "bettingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Add Stripe Connect and betting fields to Company
ALTER TABLE "Company" ADD COLUMN "stripeConnectId" TEXT;
ALTER TABLE "Company" ADD COLUMN "stripeConnectOnboarded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN "bettingEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex for Company stripeConnectId
CREATE INDEX "Company_stripeConnectId_idx" ON "Company"("stripeConnectId");

-- CreateEnum for BetTargetType
CREATE TYPE "BetTargetType" AS ENUM ('COMPANY', 'USER');

-- CreateEnum for BetDirection
CREATE TYPE "BetDirection" AS ENUM ('LONG', 'SHORT');

-- CreateEnum for BetStatus
CREATE TYPE "BetStatus" AS ENUM ('PENDING', 'WON', 'LOST', 'CANCELLED', 'VOID');

-- CreateEnum for BettingPeriodStatus
CREATE TYPE "BettingPeriodStatus" AS ENUM ('UPCOMING', 'OPEN', 'CLOSED', 'RESOLVED');

-- CreateTable: MrrSnapshot
CREATE TABLE "MrrSnapshot" (
    "id" TEXT NOT NULL,
    "targetType" "BetTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "mrrCents" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "isStartSnapshot" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MrrSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for MrrSnapshot
CREATE UNIQUE INDEX "MrrSnapshot_targetType_targetId_quarter_isStartSnapshot_key" ON "MrrSnapshot"("targetType", "targetId", "quarter", "isStartSnapshot");
CREATE INDEX "MrrSnapshot_targetId_idx" ON "MrrSnapshot"("targetId");
CREATE INDEX "MrrSnapshot_quarter_idx" ON "MrrSnapshot"("quarter");

-- CreateTable: BettingPeriod
CREATE TABLE "BettingPeriod" (
    "id" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "bettingClosesAt" TIMESTAMP(3) NOT NULL,
    "status" "BettingPeriodStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BettingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for BettingPeriod
CREATE UNIQUE INDEX "BettingPeriod_quarter_key" ON "BettingPeriod"("quarter");
CREATE INDEX "BettingPeriod_status_idx" ON "BettingPeriod"("status");
CREATE INDEX "BettingPeriod_startsAt_idx" ON "BettingPeriod"("startsAt");

-- CreateTable: Bet
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "BetTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "direction" "BetDirection" NOT NULL,
    "targetPercentage" DOUBLE PRECISION NOT NULL,
    "stakeTokens" INTEGER NOT NULL,
    "houseFeeTokens" INTEGER NOT NULL,
    "netStakeTokens" INTEGER NOT NULL,
    "status" "BetStatus" NOT NULL DEFAULT 'PENDING',
    "winnings" INTEGER,
    "actualPercentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Bet
CREATE INDEX "Bet_userId_idx" ON "Bet"("userId");
CREATE INDEX "Bet_targetType_targetId_idx" ON "Bet"("targetType", "targetId");
CREATE INDEX "Bet_periodId_idx" ON "Bet"("periodId");
CREATE INDEX "Bet_status_idx" ON "Bet"("status");
CREATE INDEX "Bet_createdAt_idx" ON "Bet"("createdAt");

-- CreateTable: HouseEarnings
CREATE TABLE "HouseEarnings" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "betId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for HouseEarnings
CREATE INDEX "HouseEarnings_createdAt_idx" ON "HouseEarnings"("createdAt");
CREATE INDEX "HouseEarnings_source_idx" ON "HouseEarnings"("source");

-- AddForeignKey for Bet -> User
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for Bet -> BettingPeriod
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "BettingPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
