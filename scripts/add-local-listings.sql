-- Add Local Listings tables for Craigslist-style classifieds
-- Run this with: psql $DATABASE_URL -f scripts/add-local-listings.sql

-- Create enum types
DO $$ BEGIN
    CREATE TYPE "LocalListingCategory" AS ENUM ('COMMUNITY', 'SERVICES', 'DISCUSSION', 'COWORKING_HOUSING', 'FOR_SALE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LocalListingStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'FLAGGED', 'REMOVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LocalListingFlagReason" AS ENUM ('SPAM', 'INAPPROPRIATE', 'SCAM', 'DUPLICATE', 'WRONG_CATEGORY', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create LocalListing table
CREATE TABLE IF NOT EXISTS "LocalListing" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "LocalListingCategory" NOT NULL,
    "status" "LocalListingStatus" NOT NULL DEFAULT 'DRAFT',
    "locationSlug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "stripeSessionId" TEXT,
    "priceInCents" INTEGER,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalListing_pkey" PRIMARY KEY ("id")
);

-- Create LocalListingImage table
CREATE TABLE IF NOT EXISTS "LocalListingImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "LocalListingImage_pkey" PRIMARY KEY ("id")
);

-- Create LocalListingComment table
CREATE TABLE IF NOT EXISTS "LocalListingComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "LocalListingComment_pkey" PRIMARY KEY ("id")
);

-- Create LocalListingFlag table
CREATE TABLE IF NOT EXISTS "LocalListingFlag" (
    "id" TEXT NOT NULL,
    "reason" "LocalListingFlagReason" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "LocalListingFlag_pkey" PRIMARY KEY ("id")
);

-- Create LocalListingRating table
CREATE TABLE IF NOT EXISTS "LocalListingRating" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raterId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "LocalListingRating_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "LocalListing_slug_key" ON "LocalListing"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "LocalListing_stripeSessionId_key" ON "LocalListing"("stripeSessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "LocalListingFlag_userId_listingId_key" ON "LocalListingFlag"("userId", "listingId");
CREATE UNIQUE INDEX IF NOT EXISTS "LocalListingRating_raterId_listingId_key" ON "LocalListingRating"("raterId", "listingId");

-- Create indexes for LocalListing
CREATE INDEX IF NOT EXISTS "LocalListing_userId_idx" ON "LocalListing"("userId");
CREATE INDEX IF NOT EXISTS "LocalListing_locationSlug_idx" ON "LocalListing"("locationSlug");
CREATE INDEX IF NOT EXISTS "LocalListing_category_idx" ON "LocalListing"("category");
CREATE INDEX IF NOT EXISTS "LocalListing_status_idx" ON "LocalListing"("status");
CREATE INDEX IF NOT EXISTS "LocalListing_expiresAt_idx" ON "LocalListing"("expiresAt");
CREATE INDEX IF NOT EXISTS "LocalListing_createdAt_idx" ON "LocalListing"("createdAt");

-- Create indexes for LocalListingImage
CREATE INDEX IF NOT EXISTS "LocalListingImage_listingId_idx" ON "LocalListingImage"("listingId");
CREATE INDEX IF NOT EXISTS "LocalListingImage_order_idx" ON "LocalListingImage"("order");

-- Create indexes for LocalListingComment
CREATE INDEX IF NOT EXISTS "LocalListingComment_listingId_idx" ON "LocalListingComment"("listingId");
CREATE INDEX IF NOT EXISTS "LocalListingComment_userId_idx" ON "LocalListingComment"("userId");
CREATE INDEX IF NOT EXISTS "LocalListingComment_createdAt_idx" ON "LocalListingComment"("createdAt");

-- Create indexes for LocalListingFlag
CREATE INDEX IF NOT EXISTS "LocalListingFlag_listingId_idx" ON "LocalListingFlag"("listingId");
CREATE INDEX IF NOT EXISTS "LocalListingFlag_reason_idx" ON "LocalListingFlag"("reason");

-- Create indexes for LocalListingRating
CREATE INDEX IF NOT EXISTS "LocalListingRating_ratedUserId_idx" ON "LocalListingRating"("ratedUserId");
CREATE INDEX IF NOT EXISTS "LocalListingRating_listingId_idx" ON "LocalListingRating"("listingId");

-- Add foreign key constraints
ALTER TABLE "LocalListing"
    ADD CONSTRAINT "LocalListing_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingImage"
    ADD CONSTRAINT "LocalListingImage_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingComment"
    ADD CONSTRAINT "LocalListingComment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingComment"
    ADD CONSTRAINT "LocalListingComment_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingFlag"
    ADD CONSTRAINT "LocalListingFlag_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingFlag"
    ADD CONSTRAINT "LocalListingFlag_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingRating"
    ADD CONSTRAINT "LocalListingRating_raterId_fkey"
    FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingRating"
    ADD CONSTRAINT "LocalListingRating_ratedUserId_fkey"
    FOREIGN KEY ("ratedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

SELECT 'Local Listings tables created successfully!' as result;
