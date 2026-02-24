-- Create MastermindSubscription table ($9/mo Telegram group access)
CREATE TABLE "MastermindSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" "ProSubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MastermindSubscription_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "MastermindSubscription_userId_key" ON "MastermindSubscription"("userId");
CREATE UNIQUE INDEX "MastermindSubscription_stripeSubscriptionId_key" ON "MastermindSubscription"("stripeSubscriptionId");

-- Indexes
CREATE INDEX "MastermindSubscription_stripeSubscriptionId_idx" ON "MastermindSubscription"("stripeSubscriptionId");
CREATE INDEX "MastermindSubscription_status_idx" ON "MastermindSubscription"("status");

-- Foreign key
ALTER TABLE "MastermindSubscription" ADD CONSTRAINT "MastermindSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
