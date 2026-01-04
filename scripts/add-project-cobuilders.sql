-- Add Project Co-Builders Table
-- This migration adds support for tagging other users as co-builders on projects

-- Create the ProjectCoBuilder join table
CREATE TABLE IF NOT EXISTS "ProjectCoBuilder" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectCoBuilder_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint (user can only be co-builder once per project)
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectCoBuilder_projectId_userId_key" ON "ProjectCoBuilder"("projectId", "userId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "ProjectCoBuilder_projectId_idx" ON "ProjectCoBuilder"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectCoBuilder_userId_idx" ON "ProjectCoBuilder"("userId");

-- Add foreign key constraints
ALTER TABLE "ProjectCoBuilder" ADD CONSTRAINT "ProjectCoBuilder_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectCoBuilder" ADD CONSTRAINT "ProjectCoBuilder_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
