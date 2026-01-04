-- Migration script to add JOB_POSTED feed event type and companyRoleId to FeedEvent
-- Run this manually against your PostgreSQL database

-- Add JOB_POSTED to the FeedEventType enum
ALTER TYPE "FeedEventType" ADD VALUE IF NOT EXISTS 'JOB_POSTED';

-- Add companyRoleId column to FeedEvent table
ALTER TABLE "FeedEvent" ADD COLUMN IF NOT EXISTS "companyRoleId" TEXT UNIQUE;

-- Create index for companyRoleId
CREATE INDEX IF NOT EXISTS "FeedEvent_companyRoleId_idx" ON "FeedEvent"("companyRoleId");

-- Add foreign key constraint
ALTER TABLE "FeedEvent"
ADD CONSTRAINT "FeedEvent_companyRoleId_fkey"
FOREIGN KEY ("companyRoleId")
REFERENCES "CompanyRole"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
