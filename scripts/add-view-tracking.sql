-- Add view and click tracking tables for analytics
-- Run this script to add view tracking for projects, updates, and local listings

-- Project views - track when someone views a project page
CREATE TABLE IF NOT EXISTS "ProjectView" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectView_pkey" PRIMARY KEY ("id")
);

-- Project clicks - track when someone clicks through to project URL
CREATE TABLE IF NOT EXISTS "ProjectClick" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "visitorId" TEXT,
    "clickType" TEXT NOT NULL DEFAULT 'url',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectClick_pkey" PRIMARY KEY ("id")
);

-- Update views - track when someone views an update
CREATE TABLE IF NOT EXISTS "UpdateView" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UpdateView_pkey" PRIMARY KEY ("id")
);

-- Local listing views - track when someone views a listing
CREATE TABLE IF NOT EXISTS "LocalListingView" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocalListingView_pkey" PRIMARY KEY ("id")
);

-- Local listing clicks - track when someone clicks contact info
CREATE TABLE IF NOT EXISTS "LocalListingClick" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "visitorId" TEXT,
    "clickType" TEXT NOT NULL DEFAULT 'contact',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocalListingClick_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "ProjectView_projectId_idx" ON "ProjectView"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectView_createdAt_idx" ON "ProjectView"("createdAt");
CREATE INDEX IF NOT EXISTS "ProjectView_projectId_visitorId_idx" ON "ProjectView"("projectId", "visitorId");

CREATE INDEX IF NOT EXISTS "ProjectClick_projectId_idx" ON "ProjectClick"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectClick_createdAt_idx" ON "ProjectClick"("createdAt");

CREATE INDEX IF NOT EXISTS "UpdateView_updateId_idx" ON "UpdateView"("updateId");
CREATE INDEX IF NOT EXISTS "UpdateView_createdAt_idx" ON "UpdateView"("createdAt");
CREATE INDEX IF NOT EXISTS "UpdateView_updateId_visitorId_idx" ON "UpdateView"("updateId", "visitorId");

CREATE INDEX IF NOT EXISTS "LocalListingView_listingId_idx" ON "LocalListingView"("listingId");
CREATE INDEX IF NOT EXISTS "LocalListingView_createdAt_idx" ON "LocalListingView"("createdAt");
CREATE INDEX IF NOT EXISTS "LocalListingView_listingId_visitorId_idx" ON "LocalListingView"("listingId", "visitorId");

CREATE INDEX IF NOT EXISTS "LocalListingClick_listingId_idx" ON "LocalListingClick"("listingId");
CREATE INDEX IF NOT EXISTS "LocalListingClick_createdAt_idx" ON "LocalListingClick"("createdAt");

-- Add foreign key constraints
ALTER TABLE "ProjectView" ADD CONSTRAINT "ProjectView_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectClick" ADD CONSTRAINT "ProjectClick_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpdateView" ADD CONSTRAINT "UpdateView_updateId_fkey"
    FOREIGN KEY ("updateId") REFERENCES "DailyUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingView" ADD CONSTRAINT "LocalListingView_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalListingClick" ADD CONSTRAINT "LocalListingClick_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "LocalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
