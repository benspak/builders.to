-- Create SubscriptionTier enum (Founders Edition: Pro, Premium, Founder's Circle)
CREATE TYPE "SubscriptionTier" AS ENUM ('PRO', 'PREMIUM', 'FOUNDERS_CIRCLE');

-- Add tier to ProSubscription (existing rows default to PRO)
ALTER TABLE "ProSubscription" ADD COLUMN "tier" "SubscriptionTier" NOT NULL DEFAULT 'PRO';

-- Add ad credits to User (balance and period start for monthly grants)
ALTER TABLE "User" ADD COLUMN "adCreditsBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "adCreditsPeriodStart" TIMESTAMP(3);
