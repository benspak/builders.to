-- Repair token system: add missing columns/table/enum if they don't exist (idempotent).
-- Use when _prisma_migrations says token migrations were applied but the DB is missing token schema.

-- 1. Create enum with all values if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TokenTransactionType') THEN
    CREATE TYPE "TokenTransactionType" AS ENUM (
      'WELCOME_BONUS', 'REFERRAL_REWARD', 'STREAK_BONUS', 'ENGAGEMENT_BONUS',
      'AD_REDEMPTION', 'SERVICE_REDEMPTION', 'LOCAL_LISTING_REDEMPTION', 'ADMIN_ADJUSTMENT',
      'GIFT_SENT', 'GIFT_RECEIVED', 'GIFT_PURCHASED', 'PRO_SUBSCRIPTION_GRANT'
    );
  END IF;
END $$;

-- 2. Add User columns if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lifetimeTokensEarned" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredById" TEXT;

-- 3. Create TokenTransaction table if not exists
CREATE TABLE IF NOT EXISTS "TokenTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "type" "TokenTransactionType" NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TokenTransaction_pkey" PRIMARY KEY ("id")
);

-- 4. Indexes if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX IF NOT EXISTS "User_referralCode_idx" ON "User"("referralCode");
CREATE INDEX IF NOT EXISTS "TokenTransaction_userId_idx" ON "TokenTransaction"("userId");
CREATE INDEX IF NOT EXISTS "TokenTransaction_createdAt_idx" ON "TokenTransaction"("createdAt");
CREATE INDEX IF NOT EXISTS "TokenTransaction_type_idx" ON "TokenTransaction"("type");

-- 5. Foreign keys if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_referredById_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey"
      FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TokenTransaction_userId_fkey') THEN
    ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
