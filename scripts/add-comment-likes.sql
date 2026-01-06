-- Migration: Add CommentLike model and COMMENT_LIKED notification type
-- Run this migration to enable liking comments on projects

-- Add COMMENT_LIKED to NotificationType enum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COMMENT_LIKED';

-- Create CommentLike table
CREATE TABLE IF NOT EXISTS "CommentLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint (user can only like a comment once)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CommentLike_userId_commentId_key'
    ) THEN
        ALTER TABLE "CommentLike"
        ADD CONSTRAINT "CommentLike_userId_commentId_key"
        UNIQUE ("userId", "commentId");
    END IF;
END
$$;

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CommentLike_userId_fkey'
    ) THEN
        ALTER TABLE "CommentLike"
        ADD CONSTRAINT "CommentLike_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CommentLike_commentId_fkey'
    ) THEN
        ALTER TABLE "CommentLike"
        ADD CONSTRAINT "CommentLike_commentId_fkey"
        FOREIGN KEY ("commentId")
        REFERENCES "Comment"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "CommentLike_commentId_idx" ON "CommentLike"("commentId");
