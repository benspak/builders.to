-- Token System Migration Script
-- Run this after the Prisma migration to backfill referral codes for existing users

-- Generate unique referral codes for all existing users that don't have one
-- Using a combination of first 4 chars of slug (or 'user') + 6 random chars
UPDATE "User"
SET "referralCode" = CONCAT(
    COALESCE(UPPER(SUBSTRING("slug" FROM 1 FOR 4)), 'USER'),
    '-',
    UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6))
)
WHERE "referralCode" IS NULL;

-- Grant welcome bonus (5 tokens) to existing users who signed up before token system
-- This is optional - comment out if you don't want to retroactively grant tokens
-- INSERT INTO "TokenTransaction" ("id", "userId", "amount", "type", "description", "createdAt")
-- SELECT
--     gen_random_uuid()::text,
--     "id",
--     5,
--     'WELCOME_BONUS',
--     'Retroactive welcome bonus for early adopters',
--     NOW()
-- FROM "User"
-- WHERE "tokenBalance" = 0;

-- UPDATE "User"
-- SET "tokenBalance" = 5
-- WHERE "tokenBalance" = 0;
