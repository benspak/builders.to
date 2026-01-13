-- Add new token transaction types for gifting tokens
ALTER TYPE "TokenTransactionType" ADD VALUE 'GIFT_SENT';
ALTER TYPE "TokenTransactionType" ADD VALUE 'GIFT_RECEIVED';
ALTER TYPE "TokenTransactionType" ADD VALUE 'GIFT_PURCHASED';
