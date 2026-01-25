"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SuggestionStatus } from "@prisma/client";
import { Sparkles, RefreshCw, Loader2, Info, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { SuggestionCard } from "./suggestion-card";
import { cn } from "@/lib/utils";

// Tone presets matching the openai.service.ts
const TONE_OPTIONS = [
  { value: "professional", label: "Professional", description: "Authoritative and business-focused" },
  { value: "casual", label: "Casual", description: "Friendly and conversational" },
  { value: "witty", label: "Witty", description: "Clever humor and wordplay" },
  { value: "inspirational", label: "Inspirational", description: "Motivating and encouraging" },
  { value: "educational", label: "Educational", description: "Informative and clear" },
  { value: "provocative", label: "Provocative", description: "Thought-provoking and bold" },
] as const;

type ToneOption = typeof TONE_OPTIONS[number]["value"];

interface SuggestionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
  approvalRate: number;
}

export function SuggestionsPanel() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [stats, setStats] = useState<SuggestionStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | "ALL">("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI refinement options
  const [showRefinementOptions, setShowRefinementOptions] = useState(false);
  const [selectedTone, setSelectedTone] = useState<ToneOption>("professional");
  const [customPrompt, setCustomPrompt] = useState("");

  // Fetch suggestions and stats
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [suggestionsRes, statsRes] = await Promise.all([
        fetch(`/api/agent/suggestions${statusFilter !== "ALL" ? `?status=${statusFilter}` : ""}`),
        fetch("/api/agent/suggestions/stats"),
      ]);

      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Generate new suggestions
  const generateSuggestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/suggestions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          count: 3,
          tone: selectedTone,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate suggestions");
      }

      // Refresh the list
      await fetchData();
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setError(error instanceof Error ? error.message : "Failed to generate suggestions");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle approve
  const handleApprove = async (id: string, editedContent?: string, publishImmediately?: boolean) => {
    try {
      const response = await fetch(`/api/agent/suggestions/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editedContent, publishImmediately }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve suggestion");
      }

      await fetchData();
      router.refresh();
    } catch (error) {
      console.error("Error approving suggestion:", error);
      throw error;
    }
  };

  // Handle reject
  const handleReject = async (id: string, reason?: string) => {
    try {
      const response = await fetch(`/api/agent/suggestions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject suggestion");
      }

      await fetchData();
    } catch (error) {
      console.error("Error rejecting suggestion:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">AI Suggestions</h2>
          {stats && stats.pending > 0 && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
              {stats.pending} pending
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRefinementOptions(!showRefinementOptions)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors",
              showRefinementOptions 
                ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400"
                : "hover:bg-muted"
            )}
          >
            <Settings2 className="w-4 h-4" />
            Refine
            {showRefinementOptions ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Generate New
          </button>
        </div>
      </div>

      {/* Refinement Options Panel */}
      {showRefinementOptions && (
        <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tone</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setSelectedTone(tone.value)}
                  className={cn(
                    "p-2 text-left rounded-lg border transition-colors",
                    selectedTone === tone.value
                      ? "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700"
                      : "hover:bg-muted"
                  )}
                >
                  <p className="text-sm font-medium">{tone.label}</p>
                  <p className="text-xs text-muted-foreground">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Custom Prompt <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific guidance for the AI, e.g., 'Focus on SaaS metrics and growth tactics' or 'Write about lessons learned from bootstrapping'"
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {customPrompt.length}/500 characters
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Info className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Posts are limited to 500 characters for optimal engagement. Select a tone and optionally add custom guidance to refine your suggestions.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.published}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{stats.approvalRate}%</p>
            <p className="text-xs text-muted-foreground">Approval Rate</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED", "PUBLISHED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition-colors",
              statusFilter === status
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          <Info className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Suggestions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {statusFilter === "PENDING" 
              ? "No pending suggestions. Generate some new ones!"
              : "No suggestions found."}
          </p>
          {statusFilter === "PENDING" && (
            <button
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              Generate Suggestions
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
