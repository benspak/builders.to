-- Add Company Members
-- This migration allows multiple users to be added to a company with different roles

-- Create the enum for company member roles
CREATE TYPE "CompanyMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- Create the CompanyMember table
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "role" "CompanyMemberRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to prevent duplicate memberships
CREATE UNIQUE INDEX "CompanyMember_companyId_userId_key" ON "CompanyMember"("companyId", "userId");

-- Create indexes for faster lookups
CREATE INDEX "CompanyMember_companyId_idx" ON "CompanyMember"("companyId");
CREATE INDEX "CompanyMember_userId_idx" ON "CompanyMember"("userId");

-- Add foreign key constraints
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: Create OWNER memberships for all existing company owners
-- This ensures existing companies have their owners as members
INSERT INTO "CompanyMember" ("id", "role", "createdAt", "updatedAt", "companyId", "userId")
SELECT
    gen_random_uuid()::text,
    'OWNER'::"CompanyMemberRole",
    NOW(),
    NOW(),
    c."id",
    c."userId"
FROM "Company" c
WHERE NOT EXISTS (
    SELECT 1 FROM "CompanyMember" cm
    WHERE cm."companyId" = c."id" AND cm."userId" = c."userId"
);
