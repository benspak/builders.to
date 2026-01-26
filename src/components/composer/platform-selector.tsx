"use client";

import { SocialPlatform } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// Platform configuration
const PLATFORMS = {
  TWITTER: {
    name: "Twitter/X",
    icon: "𝕏",
    color: "bg-black text-white",
    maxLength: 3000,
  },
  LINKEDIN: {
    name: "LinkedIn",
    icon: "in",
    color: "bg-[#0077B5] text-white",
    maxLength: 3000,
  },
  BUILDERS: {
    name: "Builders.to",
    icon: "B",
    color: "bg-gradient-to-br from-yellow-500 to-orange-500 text-white",
    maxLength: 3000,
  },
};

interface ConnectedPlatform {
  platform: SocialPlatform;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  connectedAt: Date;
  scopes: string[];
}

interface PlatformSelectorProps {
  selectedPlatforms: SocialPlatform[];
  onPlatformsChange: (platforms: SocialPlatform[]) => void;
  connectedPlatforms: ConnectedPlatform[];
  disabled?: boolean;
}

export function PlatformSelector({
  selectedPlatforms,
  onPlatformsChange,
  connectedPlatforms,
  disabled = false,
}: PlatformSelectorProps) {
  const connectedPlatformSet = new Set(connectedPlatforms.map((c) => c.platform));
  // BUILDERS is always available
  connectedPlatformSet.add(SocialPlatform.BUILDERS);

  const togglePlatform = (platform: SocialPlatform) => {
    if (disabled) return;
    
    if (selectedPlatforms.includes(platform)) {
      // Don't allow deselecting all platforms
      if (selectedPlatforms.length > 1) {
        onPlatformsChange(selectedPlatforms.filter((p) => p !== platform));
      }
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(PLATFORMS) as SocialPlatform[]).map((platform) => {
        const config = PLATFORMS[platform];
        const isConnected = connectedPlatformSet.has(platform);
        const isSelected = selectedPlatforms.includes(platform);
        const connection = connectedPlatforms.find((c) => c.platform === platform);

        return (
          <button
            key={platform}
            type="button"
            onClick={() => togglePlatform(platform)}
            disabled={disabled || !isConnected}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-gray-200 dark:border-gray-700",
              !isConnected && "opacity-50 cursor-not-allowed",
              disabled && "cursor-not-allowed",
              isConnected && !disabled && "hover:border-primary/50"
            )}
          >
            <span
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                config.color
              )}
            >
              {config.icon}
            </span>
            <span className="text-sm font-medium">{config.name}</span>
            {connection?.username && (
              <span className="text-xs text-muted-foreground">
                @{connection.username}
              </span>
            )}
            {isSelected && (
              <Check className="w-4 h-4 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
            )}
            {!isConnected && platform !== SocialPlatform.BUILDERS && (
              <span className="text-xs text-muted-foreground ml-1">
                (Not connected)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function getCharacterLimit(platforms: SocialPlatform[]): number {
  if (platforms.length === 0) return 10000;
  return Math.min(...platforms.map((p) => PLATFORMS[p].maxLength));
}

export { PLATFORMS };
