-- Add streaming-related fields to User model
-- twitchUrl: Twitch channel URL
-- featuredVideoUrl: Featured video URL (YouTube/Twitch video to showcase on profile)

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twitchUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "featuredVideoUrl" TEXT;
