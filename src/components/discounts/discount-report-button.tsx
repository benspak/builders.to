"use client";

import { useState } from "react";
import { Flag, X, Loader2 } from "lucide-react";

interface DiscountReportButtonProps {
  discountId: string;
}

export function DiscountReportButton({
  discountId,
}: DiscountReportButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/discounts/${discountId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit report");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <span className="text-xs text-zinc-500">
        Report submitted
      </span>
    );
  }

  if (showForm) {
    return (
      <div className="relative">
        <div className="absolute right-0 bottom-full mb-2 w-72 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">
              Report Discount
            </span>
            <button
              onClick={() => setShowForm(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="text-xs text-red-400 mb-2">{error}</p>
            )}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you reporting this discount?"
              className="textarea text-sm min-h-[60px]"
              required
              maxLength={300}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
        <button className="text-zinc-400 hover:text-red-400 transition-colors">
          <Flag className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="text-zinc-500 hover:text-red-400 transition-colors"
      title="Report this discount"
    >
      <Flag className="h-4 w-4" />
    </button>
  );
}
