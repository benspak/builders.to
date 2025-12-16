"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  projectId: string;
  initialCount: number;
  initialUpvoted: boolean;
  size?: "sm" | "md" | "lg";
}

export function UpvoteButton({
  projectId,
  initialCount,
  initialUpvoted,
  size = "md",
}: UpvoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialUpvoted);

  const handleUpvote = async () => {
    if (!session) {
      router.push("/signin");
      return;
    }

    // Optimistic update
    const newUpvoted = !hasUpvoted;
    const newCount = newUpvoted ? count + 1 : count - 1;
    setHasUpvoted(newUpvoted);
    setCount(newCount);

    startTransition(async () => {
      try {
        const response = await fetch("/api/upvotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });

        if (!response.ok) {
          // Revert on error
          setHasUpvoted(!newUpvoted);
          setCount(newUpvoted ? count - 1 : count + 1);
          return;
        }

        const data = await response.json();
        setHasUpvoted(data.upvoted);
        setCount(data.count);
      } catch {
        // Revert on error
        setHasUpvoted(!newUpvoted);
        setCount(newUpvoted ? count - 1 : count + 1);
      }
    });
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-1.5",
    lg: "px-4 py-3 text-base gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={isPending}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg font-semibold transition-all duration-200",
        sizeClasses[size],
        hasUpvoted
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
          : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
        isPending && "opacity-50 cursor-not-allowed",
        "hover:scale-[1.05] active:scale-[0.95]"
      )}
    >
      <ChevronUp
        className={cn(
          iconSizes[size],
          hasUpvoted && "text-orange-400",
          "transition-transform",
          hasUpvoted && "animate-bounce"
        )}
        style={{ animationIterationCount: 1, animationDuration: "0.3s" }}
      />
      <span className="font-mono">{count}</span>
    </button>
  );
}
