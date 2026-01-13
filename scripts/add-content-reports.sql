-- Migration: Add Content Reports System
-- This migration adds support for users to report inappropriate content
-- Reports are sent via email to admin (benvspak@gmail.com)

-- Create enum for content types that can be reported
CREATE TYPE "ReportContentType" AS ENUM (
  'USER',
  'PROJECT',
  'SERVICE_LISTING',
  'LOCAL_LISTING',
  'DAILY_UPDATE',
  'COMMENT'
);

-- Create enum for report reasons
CREATE TYPE "ReportReason" AS ENUM (
  'SPAM',
  'INAPPROPRIATE',
  'HARASSMENT',
  'IMPERSONATION',
  'SCAM',
  'COPYRIGHT',
  'OTHER'
);

-- Create enum for report status
CREATE TYPE "ReportStatus" AS ENUM (
  'PENDING',
  'REVIEWED',
  'RESOLVED',
  'DISMISSED'
);

-- Create the Report table
CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "contentType" "ReportContentType" NOT NULL,
  "contentId" TEXT NOT NULL,
  "reason" "ReportReason" NOT NULL,
  "description" TEXT,
  "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
  "adminNotes" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reporterEmail" TEXT,

  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint: one report per user per content
CREATE UNIQUE INDEX "Report_reporterId_contentType_contentId_key"
  ON "Report"("reporterId", "contentType", "contentId");

-- Create indexes for querying
CREATE INDEX "Report_contentType_contentId_idx" ON "Report"("contentType", "contentId");
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");
