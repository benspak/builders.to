-- Pre-migration script for token system
-- This safely adds the token system columns and constraints before prisma db push

-- Add tokenBalance column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'tokenBalance') THEN
        ALTER TABLE "User" ADD COLUMN "tokenBalance" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add referralCode column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'referralCode') THEN
        ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
    END IF;
END $$;

-- Add referredById column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'referredById') THEN
        ALTER TABLE "User" ADD COLUMN "referredById" TEXT;
    END IF;
END $$;

-- Create the unique index on referralCode if it doesn't exist
-- Use NULLS NOT DISTINCT for PostgreSQL 15+, fall back to partial index for older versions
DO $$
DECLARE
    pg_version INTEGER;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_referralCode_key') THEN
        -- Get PostgreSQL major version
        SELECT current_setting('server_version_num')::INTEGER / 10000 INTO pg_version;
        
        IF pg_version >= 15 THEN
            -- PostgreSQL 15+ supports NULLS NOT DISTINCT natively
            CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
        ELSE
            -- Older PostgreSQL: use partial index to allow multiple NULLs
            CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode") WHERE "referralCode" IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Create the referralCode lookup index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'User_referralCode_idx') THEN
        CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");
    END IF;
END $$;

-- Add foreign key for referredById if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'User_referredById_fkey') THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create TokenTransactionType enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TokenTransactionType') THEN
        CREATE TYPE "TokenTransactionType" AS ENUM ('WELCOME_BONUS', 'REFERRAL_REWARD', 'STREAK_BONUS', 'ENGAGEMENT_BONUS', 'AD_REDEMPTION', 'SERVICE_REDEMPTION', 'LOCAL_LISTING_REDEMPTION', 'ADMIN_ADJUSTMENT');
    END IF;
END $$;

-- Create TokenTransaction table if it doesn't exist
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

-- Create indexes on TokenTransaction if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'TokenTransaction_userId_idx') THEN
        CREATE INDEX "TokenTransaction_userId_idx" ON "TokenTransaction"("userId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'TokenTransaction_createdAt_idx') THEN
        CREATE INDEX "TokenTransaction_createdAt_idx" ON "TokenTransaction"("createdAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'TokenTransaction_type_idx') THEN
        CREATE INDEX "TokenTransaction_type_idx" ON "TokenTransaction"("type");
    END IF;
END $$;

-- Add foreign key for TokenTransaction.userId if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'TokenTransaction_userId_fkey') THEN
        ALTER TABLE "TokenTransaction" ADD CONSTRAINT "TokenTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
