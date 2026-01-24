"use client";

import { SocialPlatform } from "@prisma/client";
import { PLATFORMS } from "./platform-selector";
import { cn } from "@/lib/utils";

interface PlatformPreviewProps {
  platform: SocialPlatform;
  content: string;
  username?: string;
}

export function PlatformPreview({ platform, content, username }: PlatformPreviewProps) {
  const config = PLATFORMS[platform];
  const isOverLimit = content.length > config.maxLength;
  const truncatedContent = isOverLimit 
    ? content.slice(0, config.maxLength) + "..."
    : content;

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
            config.color
          )}
        >
          {config.icon}
        </span>
        <span className="font-medium text-sm">{config.name}</span>
        {username && (
          <span className="text-xs text-muted-foreground">@{username}</span>
        )}
        <span className={cn(
          "ml-auto text-xs",
          isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
        )}>
          {content.length}/{config.maxLength}
        </span>
      </div>
      
      <div className={cn(
        "text-sm whitespace-pre-wrap",
        platform === "TWITTER" && "text-[15px]",
        platform === "LINKEDIN" && "text-[14px] leading-relaxed",
      )}>
        {truncatedContent || (
          <span className="text-muted-foreground italic">Your post will appear here...</span>
        )}
      </div>

      {isOverLimit && (
        <p className="text-xs text-destructive mt-2">
          Content exceeds {config.name} character limit by {content.length - config.maxLength} characters
        </p>
      )}
    </div>
  );
}

interface PlatformPreviewsProps {
  platforms: SocialPlatform[];
  content: string;
  connectedPlatforms: Array<{
    platform: SocialPlatform;
    username: string | null;
  }>;
}

export function PlatformPreviews({ platforms, content, connectedPlatforms }: PlatformPreviewsProps) {
  if (platforms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => {
          const connection = connectedPlatforms.find((c) => c.platform === platform);
          return (
            <PlatformPreview
              key={platform}
              platform={platform}
              content={content}
              username={connection?.username || undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
