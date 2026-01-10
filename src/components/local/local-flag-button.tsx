"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Flag, Loader2, X, AlertTriangle } from "lucide-react";
import { FLAG_REASONS } from "./types";

interface LocalFlagButtonProps {
  listingId: string;
  onFlagged?: () => void;
}

export function LocalFlagButton({ listingId, onFlagged }: LocalFlagButtonProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/local-listings/${listingId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          description: description.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to report listing");
      }

      setSuccess(true);
      onFlagged?.();

      // Close modal after a delay
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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 rounded-lg border border-zinc-700 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        <Flag className="h-4 w-4" />
        Report
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
              {success ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Report Submitted
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Thank you for helping keep our community safe.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Flag className="h-5 w-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Report Listing
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      disabled={isSubmitting}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Reason selection */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Reason for reporting *
                      </label>
                      <div className="space-y-2">
                        {FLAG_REASONS.map((reason) => (
                          <label
                            key={reason.value}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="reason"
                              value={reason.value}
                              checked={selectedReason === reason.value}
                              onChange={(e) => setSelectedReason(e.target.value)}
                              className="text-orange-500 focus:ring-orange-500 bg-zinc-800 border-zinc-600"
                            />
                            <span className="text-sm text-zinc-300">
                              {reason.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Additional details */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Additional details (optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Provide any additional context..."
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-zinc-400 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedReason || isSubmitting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Flag className="h-4 w-4" />
                            Submit Report
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
