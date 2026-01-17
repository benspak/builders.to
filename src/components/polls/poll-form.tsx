"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Plus, X, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PollFormProps {
  onSuccess?: () => void;
}

export function PollForm({ onSuccess }: PollFormProps) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxQuestionLength = 280;
  const maxOptionLength = 50;
  const minOptions = 2;
  const maxOptions = 5;

  const remainingQuestionChars = maxQuestionLength - question.length;
  const canAddOption = options.length < maxOptions;
  const canRemoveOption = options.length > minOptions;

  function handleOptionChange(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function addOption() {
    if (canAddOption) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(index: number) {
    if (canRemoveOption) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!question.trim()) {
      setError("Please enter a poll question");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setError("Please add at least 2 options");
      return;
    }

    // Check for duplicate options
    const uniqueOptions = new Set(validOptions.map((opt) => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== validOptions.length) {
      setError("Options must be unique");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          options: validOptions.map((opt) => opt.trim()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create poll");
      }

      // Reset form
      setQuestion("");
      setOptions(["", ""]);

      router.push("/feed");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Poll question */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <BarChart3 className="h-4 w-4" />
          <span>Create a Poll</span>
        </div>
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            rows={2}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50 resize-none"
          />
          <div className="absolute bottom-2 right-3 text-xs text-zinc-500">
            <span className={remainingQuestionChars < 20 ? (remainingQuestionChars < 0 ? "text-red-400" : "text-amber-400") : ""}>
              {question.length}/{maxQuestionLength}
            </span>
          </div>
        </div>
      </div>

      {/* Poll options */}
      <div className="space-y-2">
        <div className="text-sm text-zinc-400">
          Options (min {minOptions}, max {maxOptions})
        </div>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  disabled={isSubmitting}
                  maxLength={maxOptionLength}
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                  {option.length}/{maxOptionLength}
                </div>
              </div>
              {canRemoveOption && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={isSubmitting}
                  className="p-2.5 rounded-xl border border-white/10 bg-zinc-800/50 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {canAddOption && (
          <button
            type="button"
            onClick={addOption}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add another option
          </button>
        )}
      </div>

      {/* Poll duration info */}
      <div className="text-xs text-zinc-500 flex items-center gap-1.5">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 text-[10px]">⏱</span>
        Poll will run for 7 days
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !question.trim() || options.filter(o => o.trim()).length < 2}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all",
            "bg-gradient-to-r from-orange-500 to-orange-600",
            "text-white shadow-lg shadow-orange-500/25",
            "hover:shadow-orange-500/40 hover:from-orange-400 hover:to-orange-500",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Poll...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Create Poll
            </>
          )}
        </button>
      </div>
    </form>
  );
}
