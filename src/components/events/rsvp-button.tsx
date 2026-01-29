"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Star, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RsvpButtonProps {
  eventId: string;
  currentStatus: string | null;
  attendeeCount: number;
  maxAttendees?: number | null;
  isPast?: boolean;
  onRsvpChange?: (status: string | null, count: number) => void;
}

export function RsvpButton({
  eventId,
  currentStatus,
  attendeeCount,
  maxAttendees,
  isPast = false,
  onRsvpChange,
}: RsvpButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [count, setCount] = useState(attendeeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isFull = maxAttendees ? count >= maxAttendees : false;

  const handleRsvp = async (newStatus: "GOING" | "INTERESTED" | "NOT_GOING") => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }

    if (isPast) return;

    setIsLoading(true);
    setShowDropdown(false);

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(newStatus);
        setCount(data.attendeeCount);
        onRsvpChange?.(newStatus, data.attendeeCount);
      }
    } catch (error) {
      console.error("Error updating RSVP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRsvp = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    setShowDropdown(false);

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(null);
        setCount(data.attendeeCount);
        onRsvpChange?.(null, data.attendeeCount);
      }
    } catch (error) {
      console.error("Error removing RSVP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Not logged in
  if (!session?.user) {
    return (
      <button
        onClick={() => router.push("/signin")}
        className="flex items-center gap-2 rounded-xl bg-orange-500/20 text-orange-400 px-4 py-2 text-sm font-medium hover:bg-orange-500/30 transition-colors"
      >
        Sign in to RSVP
      </button>
    );
  }

  // Past event
  if (isPast) {
    return (
      <span className="text-sm text-zinc-500">
        This event has ended
      </span>
    );
  }

  // User has RSVP'd
  if (status) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            status === "GOING"
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "GOING" ? (
            <Check className="h-4 w-4" />
          ) : (
            <Star className="h-4 w-4" />
          )}
          <span>{status === "GOING" ? "Going" : "Interested"}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-white/10 bg-zinc-900 shadow-xl p-1">
              {status !== "GOING" && (
                <button
                  onClick={() => handleRsvp("GOING")}
                  disabled={isFull}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    isFull
                      ? "text-zinc-500 cursor-not-allowed"
                      : "text-zinc-300 hover:bg-white/5 hover:text-emerald-400"
                  )}
                >
                  <Check className="h-4 w-4" />
                  {isFull ? "Event Full" : "Going"}
                </button>
              )}
              {status !== "INTERESTED" && (
                <button
                  onClick={() => handleRsvp("INTERESTED")}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-amber-400 transition-colors"
                >
                  <Star className="h-4 w-4" />
                  Interested
                </button>
              )}
              <button
                onClick={handleRemoveRsvp}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Cancel RSVP
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // No RSVP yet
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-xl bg-orange-500/20 text-orange-400 px-4 py-2 text-sm font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>RSVP</span>
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-white/10 bg-zinc-900 shadow-xl p-1">
            <button
              onClick={() => handleRsvp("GOING")}
              disabled={isFull}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isFull
                  ? "text-zinc-500 cursor-not-allowed"
                  : "text-zinc-300 hover:bg-white/5 hover:text-emerald-400"
              )}
            >
              <Check className="h-4 w-4" />
              {isFull ? "Event Full" : "Going"}
            </button>
            <button
              onClick={() => handleRsvp("INTERESTED")}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-amber-400 transition-colors"
            >
              <Star className="h-4 w-4" />
              Interested
            </button>
          </div>
        </>
      )}
    </div>
  );
}
