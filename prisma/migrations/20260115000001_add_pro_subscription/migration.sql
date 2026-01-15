-- Add new token transaction type for Pro subscription grants
ALTER TYPE "TokenTransactionType" ADD VALUE 'PRO_SUBSCRIPTION_GRANT';

-- Create ProSubscriptionStatus enum
CREATE TYPE "ProSubscriptionStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'PAST_DUE', 'CANCELLED');

-- Create ProPlan enum
CREATE TYPE "ProPlan" AS ENUM ('MONTHLY', 'YEARLY');

-- Create ProSubscription table
CREATE TABLE "ProSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" "ProSubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "plan" "ProPlan" NOT NULL DEFAULT 'MONTHLY',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "lastTokenGrantAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProSubscription_pkey" PRIMARY KEY ("id")
);

-- Create CustomDomain table
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- Add unique constraints
CREATE UNIQUE INDEX "ProSubscription_userId_key" ON "ProSubscription"("userId");
CREATE UNIQUE INDEX "ProSubscription_stripeSubscriptionId_key" ON "ProSubscription"("stripeSubscriptionId");
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");

-- Add indexes
CREATE INDEX "ProSubscription_stripeSubscriptionId_idx" ON "ProSubscription"("stripeSubscriptionId");
CREATE INDEX "ProSubscription_status_idx" ON "ProSubscription"("status");
CREATE INDEX "CustomDomain_domain_idx" ON "CustomDomain"("domain");
CREATE INDEX "CustomDomain_userId_idx" ON "CustomDomain"("userId");

-- Add foreign keys
ALTER TABLE "ProSubscription" ADD CONSTRAINT "ProSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
