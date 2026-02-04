"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DMButtonProps {
  userId: string;
  currentUserId?: string;
  size?: "sm" | "md";
  className?: string;
}

export function DMButton({
  userId,
  currentUserId,
  size = "md",
  className,
}: DMButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Don't render if no current user or if it's own profile
  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conversation");
      }

      const data = await response.json();
      // Navigate to the conversation
      router.push(`/messages/${data.conversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center font-medium rounded-xl transition-all",
        "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20",
        sizeClasses[size],
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      ) : (
        <MessageCircle className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      )}
      Message
    </button>
  );
}
