-- Add Sidebar Advertising feature
-- This migration adds the Advertisement and AdView tables for the paid ad spots on the feed

-- Create the advertisement status enum
CREATE TYPE "AdvertisementStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- Create the Advertisement table
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL DEFAULT 'Learn More',
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "amountPaid" INTEGER NOT NULL DEFAULT 5000,
    "status" "AdvertisementStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- Create the AdView table for analytics
CREATE TABLE "AdView" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" TEXT,

    CONSTRAINT "AdView_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Advertisement
CREATE UNIQUE INDEX "Advertisement_stripeSessionId_key" ON "Advertisement"("stripeSessionId");
CREATE INDEX "Advertisement_userId_idx" ON "Advertisement"("userId");
CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");
CREATE INDEX "Advertisement_startDate_idx" ON "Advertisement"("startDate");
CREATE INDEX "Advertisement_endDate_idx" ON "Advertisement"("endDate");

-- Create indexes for AdView
CREATE INDEX "AdView_adId_idx" ON "AdView"("adId");
CREATE INDEX "AdView_createdAt_idx" ON "AdView"("createdAt");
CREATE INDEX "AdView_adId_visitorId_idx" ON "AdView"("adId", "visitorId");

-- Add foreign key constraints
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdView" ADD CONSTRAINT "AdView_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
