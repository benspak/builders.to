-- Migration: Add USER_MENTIONED notification type
-- This migration adds support for @mentioning users in daily updates

-- Add the new enum value to NotificationType
-- Note: PostgreSQL requires a specific syntax to add enum values
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'USER_MENTIONED';

-- Verify the change
-- SELECT enum_range(NULL::"NotificationType");
