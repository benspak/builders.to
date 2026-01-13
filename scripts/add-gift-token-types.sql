-- Add new token transaction types for gifting tokens
-- These types enable the token gifting feature:
-- GIFT_SENT: When a user sends tokens as a gift to another user
-- GIFT_RECEIVED: When a user receives tokens as a gift from another user
-- GIFT_PURCHASED: When a user purchases tokens specifically to gift (via Stripe)

-- Add new enum values to TokenTransactionType
ALTER TYPE "TokenTransactionType" ADD VALUE IF NOT EXISTS 'GIFT_SENT';
ALTER TYPE "TokenTransactionType" ADD VALUE IF NOT EXISTS 'GIFT_RECEIVED';
ALTER TYPE "TokenTransactionType" ADD VALUE IF NOT EXISTS 'GIFT_PURCHASED';
