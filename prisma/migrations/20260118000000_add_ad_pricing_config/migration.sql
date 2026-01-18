-- Add Ad Pricing Configuration table for dynamic ad pricing
-- Tier 0 = $5, Tier 1 = $10, Tier 2 = $20, etc. (doubles each time slots fill)

-- CreateTable
CREATE TABLE "AdPricingConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "currentTier" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdPricingConfig_pkey" PRIMARY KEY ("id")
);

-- Insert the singleton row with initial tier
-- Starting at tier 1 ($10) since we currently have 10 ads running (over the 8 slot limit)
INSERT INTO "AdPricingConfig" ("id", "currentTier", "lastUpdated")
VALUES ('singleton', 1, CURRENT_TIMESTAMP);
