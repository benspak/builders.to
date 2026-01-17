"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Flag, Loader2, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReportContentType =
  | "USER"
  | "PROJECT"
  | "SERVICE_LISTING"
  | "LOCAL_LISTING"
  | "DAILY_UPDATE"
  | "COMMENT";

type ReportReason =
  | "SPAM"
  | "INAPPROPRIATE"
  | "HARASSMENT"
  | "IMPERSONATION"
  | "SCAM"
  | "COPYRIGHT"
  | "OTHER";

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "Spam or misleading" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "IMPERSONATION", label: "Impersonation" },
  { value: "SCAM", label: "Scam or fraud" },
  { value: "COPYRIGHT", label: "Copyright violation" },
  { value: "OTHER", label: "Other" },
];

interface ReportButtonProps {
  contentType: ReportContentType;
  contentId: string;
  variant?: "icon" | "text" | "full" | "menu-item";
  className?: string;
  onReported?: () => void;
}

export function ReportButton({
  contentType,
  contentId,
  variant = "text",
  className,
  onReported,
}: ReportButtonProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | "">("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  // Check if user has already reported this content
  useEffect(() => {
    if (session?.user && isOpen) {
      fetch(`/api/reports?contentType=${contentType}&contentId=${contentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.hasReported) {
            setHasReported(true);
          }
        })
        .catch(console.error);
    }
  }, [session, isOpen, contentType, contentId]);

  if (!session?.user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          reason: selectedReason,
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setSuccess(true);
      onReported?.();

      // Close modal after showing success
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setSelectedReason("");
        setDescription("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setError(null);
      setSelectedReason("");
      setDescription("");
    }
  };

  // Render button based on variant
  const renderButton = () => {
    switch (variant) {
      case "icon":
        return (
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors",
              className
            )}
            title="Report"
          >
            <Flag className="h-4 w-4" />
          </button>
        );
      case "text":
        return (
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "text-xs text-zinc-500 hover:text-red-400 transition-colors",
              className
            )}
          >
            Report
          </button>
        );
      case "full":
        return (
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors",
              className
            )}
          >
            <Flag className="h-4 w-4" />
            Report
          </button>
        );
      case "menu-item":
        return (
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-700/50 transition-colors",
              className
            )}
          >
            <Flag className="h-4 w-4" />
            Report
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderButton()}

      {/* Report Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Report Content</h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {success ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    Report Submitted
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Thank you. We&apos;ll review this report shortly.
                  </p>
                </div>
              ) : hasReported ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                    <Flag className="h-8 w-8 text-amber-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    Already Reported
                  </h4>
                  <p className="text-sm text-zinc-400">
                    You&apos;ve already reported this content. We&apos;ll review it shortly.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Reason Selection */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Why are you reporting this?
                    </label>
                    <div className="space-y-2">
                      {REASON_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedReason === option.value
                              ? "border-red-500/50 bg-red-500/10"
                              : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50"
                          )}
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={option.value}
                            checked={selectedReason === option.value}
                            onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                              selectedReason === option.value
                                ? "border-red-500"
                                : "border-zinc-600"
                            )}
                          >
                            {selectedReason === option.value && (
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                          </div>
                          <span className="text-sm text-zinc-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Additional details {selectedReason === "OTHER" ? "(required)" : "(optional)"}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more context about your report..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedReason || isSubmitting}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Report"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
