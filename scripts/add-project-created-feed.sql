-- Add PROJECT_CREATED to FeedEventType enum
-- This allows feed events to be created when new projects are added

ALTER TYPE "FeedEventType" ADD VALUE 'PROJECT_CREATED';
