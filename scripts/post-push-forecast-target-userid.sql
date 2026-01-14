-- Backfill ForecastTarget.userId from legacy companyId (if present).
-- Safe to run multiple times, and avoids violating unique(userId) by only
-- assigning ONE ForecastTarget per user (best candidate wins).

WITH candidates AS (
  SELECT
    ft."id" AS forecast_target_id,
    c."userId" AS user_id,
    ROW_NUMBER() OVER (
      PARTITION BY c."userId"
      ORDER BY
        ft."stripeConnectedAt" DESC NULLS LAST,
        ft."updatedAt" DESC
    ) AS rn
  FROM "ForecastTarget" ft
  JOIN "Company" c ON c."id" = ft."companyId"
  WHERE ft."userId" IS NULL
    AND ft."companyId" IS NOT NULL
)
UPDATE "ForecastTarget" ft
SET "userId" = candidates.user_id
FROM candidates
WHERE ft."id" = candidates.forecast_target_id
  AND candidates.rn = 1;

