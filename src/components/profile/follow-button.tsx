"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  currentUserId?: string;
  size?: "sm" | "md";
  className?: string;
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  currentUserId,
  size = "md",
  className,
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't render if no current user or if it's own profile
  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      const data = await response.json();
      setIsFollowing(data.following);
      router.refresh();
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
  };

  if (isFollowing) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "inline-flex items-center font-medium rounded-xl transition-all",
          isHovered
            ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-300",
          sizeClasses[size],
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn("animate-spin", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        ) : (
          <UserMinus className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        )}
        {isHovered ? "Unfollow" : "Following"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center font-medium rounded-xl transition-all",
        "bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20",
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        <UserPlus className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      )}
      Follow
    </button>
  );
}
