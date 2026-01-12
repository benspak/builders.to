-- Add PROFILE_COMPLETION to TokenTransactionType enum
-- This migration adds a new token transaction type for profile completion bonus

ALTER TYPE "TokenTransactionType" ADD VALUE IF NOT EXISTS 'PROFILE_COMPLETION';
