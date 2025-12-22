-- Add RoastMVP table for the "Roast my MVP" feature
-- Run this migration on your database

-- Create enum for RoastMVP status
DO $$ BEGIN
    CREATE TYPE "RoastMVPStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FEATURED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create RoastMVP table
CREATE TABLE IF NOT EXISTS "RoastMVP" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "amountPaid" INTEGER NOT NULL DEFAULT 2000,
    "status" "RoastMVPStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "queuePosition" INTEGER,
    "featuredAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoastMVP_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on projectId (each project can only be in queue once)
DO $$ BEGIN
    ALTER TABLE "RoastMVP" ADD CONSTRAINT "RoastMVP_projectId_key" UNIQUE ("projectId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create unique constraint on stripeSessionId
DO $$ BEGIN
    ALTER TABLE "RoastMVP" ADD CONSTRAINT "RoastMVP_stripeSessionId_key" UNIQUE ("stripeSessionId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "RoastMVP_status_idx" ON "RoastMVP"("status");
CREATE INDEX IF NOT EXISTS "RoastMVP_queuePosition_idx" ON "RoastMVP"("queuePosition");
CREATE INDEX IF NOT EXISTS "RoastMVP_userId_idx" ON "RoastMVP"("userId");

-- Add foreign key constraints
DO $$ BEGIN
    ALTER TABLE "RoastMVP" ADD CONSTRAINT "RoastMVP_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "RoastMVP" ADD CONSTRAINT "RoastMVP_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
