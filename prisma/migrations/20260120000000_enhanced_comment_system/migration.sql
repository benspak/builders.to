-- Enhanced Comment System Migration
-- Add rich content fields (images, videos, polls) to comment models

-- Add new fields to FeedEventComment
ALTER TABLE "FeedEventComment" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "FeedEventComment" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "FeedEventComment" ADD COLUMN "pollQuestion" TEXT;
ALTER TABLE "FeedEventComment" ADD COLUMN "pollExpiresAt" TIMESTAMP(3);

-- Add new fields to UpdateComment
ALTER TABLE "UpdateComment" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "UpdateComment" ADD COLUMN "videoUrl" TEXT;
ALTER TABLE "UpdateComment" ADD COLUMN "pollQuestion" TEXT;
ALTER TABLE "UpdateComment" ADD COLUMN "pollExpiresAt" TIMESTAMP(3);

-- Create FeedEventCommentPollOption table
CREATE TABLE "FeedEventCommentPollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "FeedEventCommentPollOption_pkey" PRIMARY KEY ("id")
);

-- Create FeedEventCommentPollVote table
CREATE TABLE "FeedEventCommentPollVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "FeedEventCommentPollVote_pkey" PRIMARY KEY ("id")
);

-- Create UpdateCommentPollOption table
CREATE TABLE "UpdateCommentPollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "UpdateCommentPollOption_pkey" PRIMARY KEY ("id")
);

-- Create UpdateCommentPollVote table
CREATE TABLE "UpdateCommentPollVote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "UpdateCommentPollVote_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "FeedEventCommentPollOption_commentId_idx" ON "FeedEventCommentPollOption"("commentId");
CREATE INDEX "FeedEventCommentPollVote_optionId_idx" ON "FeedEventCommentPollVote"("optionId");
CREATE INDEX "FeedEventCommentPollVote_commentId_idx" ON "FeedEventCommentPollVote"("commentId");
CREATE UNIQUE INDEX "FeedEventCommentPollVote_userId_commentId_key" ON "FeedEventCommentPollVote"("userId", "commentId");

CREATE INDEX "UpdateCommentPollOption_commentId_idx" ON "UpdateCommentPollOption"("commentId");
CREATE INDEX "UpdateCommentPollVote_optionId_idx" ON "UpdateCommentPollVote"("optionId");
CREATE INDEX "UpdateCommentPollVote_commentId_idx" ON "UpdateCommentPollVote"("commentId");
CREATE UNIQUE INDEX "UpdateCommentPollVote_userId_commentId_key" ON "UpdateCommentPollVote"("userId", "commentId");

-- Add foreign keys
ALTER TABLE "FeedEventCommentPollOption" ADD CONSTRAINT "FeedEventCommentPollOption_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "FeedEventComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FeedEventCommentPollVote" ADD CONSTRAINT "FeedEventCommentPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "FeedEventCommentPollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedEventCommentPollVote" ADD CONSTRAINT "FeedEventCommentPollVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "FeedEventComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpdateCommentPollOption" ADD CONSTRAINT "UpdateCommentPollOption_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "UpdateComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UpdateCommentPollVote" ADD CONSTRAINT "UpdateCommentPollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "UpdateCommentPollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UpdateCommentPollVote" ADD CONSTRAINT "UpdateCommentPollVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "UpdateComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
