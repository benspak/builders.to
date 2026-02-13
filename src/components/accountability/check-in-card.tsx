"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { CheckCircle, Loader2, Smile, Meh, Frown, Zap, ImageIcon, X } from "lucide-react";
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = note.trim().length > 0 && !isSubmitting && !isUploading;

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or less");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "updates");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (hasCheckedInToday || success || !canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/accountability/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnershipId,
          note: note.trim(),
          mood: selectedMood || undefined,
          imageUrl: imageUrl || undefined,
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
              Let {partnerName} know you&apos;re on track
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

      {/* Message (required) */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-white mb-1.5">
          What did you work on? <span className="text-red-400">*</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Share your progress, what you accomplished, or what you're working on..."
          rows={3}
          maxLength={10000}
          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-zinc-600">
            This update will appear in the social feed
          </p>
          <span className="text-xs text-zinc-600">
            {note.length}/10000
          </span>
        </div>
      </div>

      {/* Image attachment */}
      <div className="mb-4">
        {imageUrl ? (
          <div className="relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700">
            <div className="relative aspect-video max-h-48">
              <Image
                src={imageUrl}
                alt="Attached image"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Add image
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
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
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title={!note.trim() ? "A message is required" : undefined}
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
