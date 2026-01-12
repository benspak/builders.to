-- Add lifetimeTokensEarned field to User table
-- This field tracks total tokens earned (public metric for ranking)

-- Add the column with default value of 0
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lifetimeTokensEarned" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing users: Calculate their lifetime tokens from transaction history
-- This sums all positive token transactions (tokens earned, not spent)
UPDATE "User" u
SET "lifetimeTokensEarned" = COALESCE(
  (SELECT SUM(amount)
   FROM "TokenTransaction" tt
   WHERE tt."userId" = u.id AND tt.amount > 0),
  0
);
