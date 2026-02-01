"use client";

import { useState } from "react";
import Image from "next/image";
import { X, User, Loader2, Users, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PartnerRequestModalProps {
  partnerId: string;
  partnerName: string;
  partnerImage: string | null;
  partnerSlug: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const frequencyOptions = [
  { value: "DAILY", label: "Daily", description: "Check in every day" },
  { value: "WEEKDAYS", label: "Weekdays", description: "Monday through Friday" },
  { value: "WEEKLY", label: "Weekly", description: "Once per week" },
];

export function PartnerRequestModal({
  partnerId,
  partnerName,
  partnerImage,
  partnerSlug,
  isOpen,
  onClose,
  onSuccess,
}: PartnerRequestModalProps) {
  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState("DAILY");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/accountability/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId,
          goal: goal.trim() || undefined,
          checkInFrequency: frequency,
          endDate: endDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send request");
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <Users className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Request Partnership
              </h2>
              <p className="text-sm text-zinc-500">
                Start an accountability partnership
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Partner info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
            {partnerImage ? (
              <Image
                src={partnerImage}
                alt={partnerName}
                width={48}
                height={48}
                className="rounded-lg ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <p className="font-medium text-white">{partnerName}</p>
              {partnerSlug && (
                <p className="text-sm text-zinc-500">@{partnerSlug}</p>
              )}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Target className="h-4 w-4 text-zinc-400" />
              Shared Goal (optional)
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What are you both working toward?"
              rows={2}
              maxLength={200}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
            />
            <p className="mt-1 text-xs text-zinc-600">{goal.length}/200</p>
          </div>

          {/* Check-in frequency */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Calendar className="h-4 w-4 text-zinc-400" />
              Check-in Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option.value)}
                  className={cn(
                    "p-3 rounded-lg border text-center transition-colors",
                    frequency === option.value
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* End date (optional) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Calendar className="h-4 w-4 text-zinc-400" />
              End Date (optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
            <p className="mt-1 text-xs text-zinc-600">
              Leave empty for an ongoing partnership
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
