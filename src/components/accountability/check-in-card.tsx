"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Smile, Meh, Frown, Zap } from "lucide-react";
import { CheckInMood } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CheckInCardProps {
  partnershipId: string;
  partnerName: string;
  hasCheckedInToday?: boolean;
  onCheckIn?: () => void;
  className?: string;
}

const moodOptions: { value: CheckInMood; icon: typeof Smile; label: string; color: string }[] = [
  { value: "CRUSHING_IT", icon: Zap, label: "Crushing it", color: "text-amber-400" },
  { value: "GOOD", icon: Smile, label: "Good", color: "text-green-400" },
  { value: "OKAY", icon: Meh, label: "Okay", color: "text-blue-400" },
  { value: "STRUGGLING", icon: Frown, label: "Struggling", color: "text-red-400" },
];

export function CheckInCard({
  partnershipId,
  partnerName,
  hasCheckedInToday = false,
  onCheckIn,
  className,
}: CheckInCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMood, setSelectedMood] = useState<CheckInMood | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (hasCheckedInToday || success) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/accountability/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnershipId,
          note: note.trim() || undefined,
          mood: selectedMood || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to check in");
        return;
      }

      setSuccess(true);
      onCheckIn?.();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasCheckedInToday || success) {
    return (
      <div
        className={cn(
          "p-4 rounded-lg bg-green-500/10 border border-green-500/30",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-400">Checked in today!</p>
            <p className="text-xs text-green-600">
              {partnerName} will see your check-in
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "w-full p-4 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-green-500/50 transition-colors text-left",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Ready to check in?</p>
            <p className="text-xs text-zinc-500">
              Let {partnerName} know you're on track
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-zinc-800 border border-green-500/30",
        className
      )}
    >
      {/* Mood selection */}
      <div className="mb-4">
        <p className="text-sm font-medium text-white mb-2">How are you feeling?</p>
        <div className="flex gap-2">
          {moodOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedMood(option.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
                  selectedMood === option.value
                    ? "bg-zinc-700 border-white/20"
                    : "bg-zinc-900 border-zinc-700 hover:border-zinc-600"
                )}
              >
                <Icon className={cn("h-5 w-5", option.color)} />
                <span className="text-[10px] text-zinc-500">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className="mb-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          rows={2}
          maxLength={280}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-2 rounded-lg bg-red-500/10 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 text-zinc-400 hover:bg-zinc-700 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Check in
            </>
          )}
        </button>
      </div>
    </div>
  );
}
