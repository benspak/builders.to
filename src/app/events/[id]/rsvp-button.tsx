"use client";

import { useState } from "react";
import { Check, Star, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RsvpButtonProps {
  eventId: string;
  initialStatus: string | null;
}

export function RsvpButton({ eventId, initialStatus }: RsvpButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRsvp(newStatus: "GOING" | "INTERESTED" | "NOT_GOING") {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      }
    } catch (error) {
      console.error("Failed to RSVP:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Updating...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleRsvp(status === "GOING" ? "NOT_GOING" : "GOING")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
          status === "GOING"
            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        )}
      >
        <Check className="h-4 w-4" />
        {status === "GOING" ? "Going" : "I'm Going"}
      </button>

      <button
        onClick={() => handleRsvp(status === "INTERESTED" ? "NOT_GOING" : "INTERESTED")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
          status === "INTERESTED"
            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        )}
      >
        <Star className="h-4 w-4" />
        {status === "INTERESTED" ? "Interested" : "Interested"}
      </button>
    </div>
  );
}
