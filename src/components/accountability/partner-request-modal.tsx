"use client";

import { useState } from "react";
import Image from "next/image";
import { X, User, Loader2, Users, Calendar, Target, Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
}

interface PartnerRequestModalProps {
  // Support both old and new interfaces
  partnerId?: string;
  partnerName?: string;
  partnerImage?: string | null;
  partnerSlug?: string | null;
  // New interface
  targetUser?: TargetUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function getDisplayName(user: TargetUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
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
  targetUser,
  isOpen,
  onClose,
  onSuccess,
}: PartnerRequestModalProps) {
  // Resolve partner info from either interface
  const resolvedPartnerId = targetUser?.id || partnerId || "";
  const resolvedPartnerName = targetUser ? getDisplayName(targetUser) : partnerName || "Builder";
  const resolvedPartnerImage = targetUser?.image ?? partnerImage ?? null;
  const resolvedPartnerSlug = targetUser?.slug ?? partnerSlug ?? null;

  const [goal, setGoal] = useState("");
  const [frequency, setFrequency] = useState("DAILY");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const copyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/accountability?invite=true`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/accountability/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: resolvedPartnerId,
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
            {resolvedPartnerImage ? (
              <Image
                src={resolvedPartnerImage}
                alt={resolvedPartnerName}
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
              <p className="font-medium text-white">{resolvedPartnerName}</p>
              {resolvedPartnerSlug && (
                <p className="text-sm text-zinc-500">@{resolvedPartnerSlug}</p>
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

          {/* Invite section */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-zinc-500 text-center mb-3">
              Know someone who should be on Builders?
            </p>
            <button
              type="button"
              onClick={copyInviteLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm"
            >
              {inviteCopied ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Invite a friend to be your partner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
