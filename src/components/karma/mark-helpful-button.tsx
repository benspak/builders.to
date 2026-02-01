"use client";

import { useState } from "react";
import { ThumbsUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkHelpfulButtonProps {
  commentId: string;
  commentOwnerId: string;
  isMarked?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MarkHelpfulButton({
  commentId,
  commentOwnerId,
  isMarked: initialIsMarked = false,
  disabled = false,
  className,
}: MarkHelpfulButtonProps) {
  const [isMarked, setIsMarked] = useState(initialIsMarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkHelpful = async () => {
    if (isLoading || isMarked || disabled) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/karma/mark-helpful", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          commentOwnerId,
        }),
      });

      if (response.ok) {
        setIsMarked(true);
      } else {
        const data = await response.json();
        console.error("Error marking as helpful:", data.error);
      }
    } catch (error) {
      console.error("Error marking as helpful:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkHelpful}
      disabled={isLoading || isMarked || disabled}
      className={cn(
        "inline-flex items-center gap-1 text-xs transition-colors",
        isMarked
          ? "text-green-400 cursor-default"
          : "text-zinc-500 hover:text-green-400",
        (isLoading || disabled) && "opacity-50 cursor-not-allowed",
        className
      )}
      title={isMarked ? "Marked as helpful" : "Mark as helpful (+10 karma)"}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <ThumbsUp className={cn("h-3 w-3", isMarked && "fill-current")} />
      )}
      <span>{isMarked ? "Helpful" : "Mark helpful"}</span>
    </button>
  );
}
