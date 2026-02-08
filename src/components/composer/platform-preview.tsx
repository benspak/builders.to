"use client";

import { SocialPlatform } from "@prisma/client";
import { PLATFORMS } from "./platform-selector";
import { cn } from "@/lib/utils";

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

  // Use the most restrictive character limit across all selected platforms
  const maxLength = Math.min(...platforms.map((p) => PLATFORMS[p].maxLength));
  const isOverLimit = content.length > maxLength;
  const truncatedContent = isOverLimit
    ? content.slice(0, maxLength) + "..."
    : content;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
      <div className="border border-white/10 rounded-xl p-4 bg-zinc-800/30">
        {/* Platform badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-zinc-500 mr-1">Posting to</span>
          {platforms.map((platform) => {
            const config = PLATFORMS[platform];
            const connection = connectedPlatforms.find((c) => c.platform === platform);
            return (
              <span
                key={platform}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs bg-white/5 border border-white/10"
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold",
                    config.color
                  )}
                >
                  {config.icon}
                </span>
                <span className="font-medium text-zinc-300">{config.name}</span>
                {connection?.username && (
                  <span className="text-zinc-500">@{connection.username}</span>
                )}
              </span>
            );
          })}
          <span className={cn(
            "ml-auto text-xs",
            isOverLimit ? "text-red-400 font-medium" : "text-zinc-500"
          )}>
            {content.length}/{maxLength}
          </span>
        </div>

        {/* Unified content preview */}
        <div className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
          {truncatedContent || (
            <span className="text-zinc-500 italic">Your post will appear here...</span>
          )}
        </div>

        {isOverLimit && (
          <p className="text-xs text-red-400 mt-3">
            Content exceeds the character limit by {content.length - maxLength} characters
          </p>
        )}
      </div>
    </div>
  );
}
