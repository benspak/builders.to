-- Backfill ForecastTarget.userId from legacy companyId (if present)
-- This is safe to run multiple times.

UPDATE "ForecastTarget" ft
SET "userId" = c."userId"
FROM "Company" c
WHERE ft."userId" IS NULL
  AND ft."companyId" IS NOT NULL
  AND ft."companyId" = c."id";

