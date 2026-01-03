"use client";

import { useState } from "react";
import {
  Plus,
  Check,
  Trophy,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Briefcase,
  RefreshCw,
  Star,
  Calendar,
  X,
  Loader2
} from "lucide-react";
import { cn, getMilestoneColor, getMilestoneLabel, formatRelativeTime } from "@/lib/utils";

// Milestone type definitions
const milestoneTypes = [
  { value: "V1_SHIPPED", label: "v1 Shipped", icon: Target, description: "Shipped the first version" },
  { value: "FIRST_USER", label: "First User", icon: Users, description: "Got your first signup" },
  { value: "FIRST_CUSTOMER", label: "First Customer", icon: DollarSign, description: "First paying customer" },
  { value: "MRR_1K", label: "$1k MRR", icon: TrendingUp, description: "Hit $1,000 monthly recurring" },
  { value: "MRR_10K", label: "$10k MRR", icon: Trophy, description: "Hit $10,000 monthly recurring" },
  { value: "PROFITABLE", label: "Profitable", icon: DollarSign, description: "Reached profitability" },
  { value: "TEAM_HIRE", label: "First Hire", icon: Users, description: "Made your first hire" },
  { value: "FUNDING", label: "Funding", icon: Briefcase, description: "Received investment" },
  { value: "PIVOT", label: "Pivot", icon: RefreshCw, description: "Major direction change" },
  { value: "CUSTOM", label: "Custom", icon: Star, description: "Custom milestone" },
];

interface Milestone {
  id: string;
  type: string;
  title?: string | null;
  description?: string | null;
  achievedAt: Date | string;
}

interface MilestoneSectionProps {
  projectId: string;
  milestones: Milestone[];
  isOwner: boolean;
  onMilestoneAdded?: (milestone: Milestone) => void;
  onMilestoneDeleted?: (id: string) => void;
}

export function MilestoneSection({
  projectId,
  milestones,
  isOwner,
  onMilestoneAdded,
  onMilestoneDeleted,
}: MilestoneSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [achievedAt, setAchievedAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check which milestone types are already achieved
  const achievedTypes = new Set(milestones.map(m => m.type));

  const handleAddMilestone = async () => {
    if (!selectedType) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title: selectedType === "CUSTOM" ? customTitle : null,
          description: description || null,
          achievedAt: new Date(achievedAt).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add milestone");
      }

      const milestone = await response.json();
      onMilestoneAdded?.(milestone);

      // Reset form
      setShowAddForm(false);
      setSelectedType(null);
      setCustomTitle("");
      setDescription("");
      setAchievedAt(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete milestone");
      }

      onMilestoneDeleted?.(milestoneId);
    } catch (err) {
      console.error("Error deleting milestone:", err);
    }
  };

  // Sort milestones by achievedAt date (newest first)
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Milestones
        </h2>
        {isOwner && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </button>
        )}
      </div>

      {/* Add Milestone Form */}
      {showAddForm && isOwner && (
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Milestone Type Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              What did you achieve?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {milestoneTypes.map((type) => {
                const Icon = type.icon;
                const isAchieved = achievedTypes.has(type.value);
                const isSelected = selectedType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    disabled={isAchieved && type.value !== "CUSTOM"}
                    onClick={() => setSelectedType(type.value)}
                    className={cn(
                      "flex flex-col items-center rounded-lg border p-3 text-center transition-all",
                      isSelected
                        ? "border-orange-500/50 bg-orange-500/10"
                        : isAchieved && type.value !== "CUSTOM"
                        ? "border-zinc-700/30 bg-zinc-800/20 opacity-50 cursor-not-allowed"
                        : "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50"
                    )}
                    title={isAchieved && type.value !== "CUSTOM" ? "Already achieved" : type.description}
                  >
                    <Icon className={cn(
                      "h-5 w-5 mb-1",
                      isSelected ? "text-orange-400" : "text-zinc-400"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-white" : "text-zinc-300"
                    )}>
                      {type.label}
                    </span>
                    {isAchieved && type.value !== "CUSTOM" && (
                      <Check className="h-3 w-3 text-emerald-400 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Title (only for CUSTOM type) */}
          {selectedType === "CUSTOM" && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Milestone Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Featured on Product Hunt"
                className="input"
                maxLength={100}
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share more context about this milestone..."
              className="textarea"
              rows={2}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              When did this happen?
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="date"
                value={achievedAt}
                onChange={(e) => setAchievedAt(e.target.value)}
                className="input pl-11"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSelectedType(null);
                setCustomTitle("");
                setDescription("");
                setError("");
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMilestone}
              disabled={loading || !selectedType || (selectedType === "CUSTOM" && !customTitle)}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Add Milestone
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Milestone Timeline */}
      {sortedMilestones.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-700/50" />

          <div className="space-y-4">
            {sortedMilestones.map((milestone) => (
              <div key={milestone.id} className="relative pl-10 group">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center text-base border-2 border-zinc-800 bg-zinc-900",
                  getMilestoneColor(milestone.type).replace("bg-", "").split(" ")[0]
                )}>
                  {getMilestoneLabel(milestone.type).split(" ")[0]}
                </div>

                <div className={cn(
                  "rounded-lg border p-4",
                  getMilestoneColor(milestone.type)
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-white">
                        {milestone.type === "CUSTOM" && milestone.title
                          ? milestone.title
                          : getMilestoneLabel(milestone.type).split(" ").slice(1).join(" ")}
                      </h3>
                      {milestone.description && (
                        <p className="text-sm text-zinc-400 mt-1">
                          {milestone.description}
                        </p>
                      )}
                      <p className="text-xs text-zinc-500 mt-2">
                        {formatRelativeTime(milestone.achievedAt)}
                      </p>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                        title="Delete milestone"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No milestones yet</p>
          {isOwner && (
            <p className="text-sm mt-1">
              Track your project&apos;s journey by adding milestones
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Compact milestone badges for cards
export function MilestoneBadges({ milestones }: { milestones: Milestone[] }) {
  if (milestones.length === 0) return null;

  // Show max 3 badges
  const displayMilestones = milestones.slice(0, 3);
  const remaining = milestones.length - 3;

  return (
    <div className="flex flex-wrap gap-1">
      {displayMilestones.map((milestone) => (
        <span
          key={milestone.id}
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
            getMilestoneColor(milestone.type)
          )}
          title={milestone.type === "CUSTOM" && milestone.title
            ? milestone.title
            : getMilestoneLabel(milestone.type)}
        >
          {getMilestoneLabel(milestone.type).split(" ")[0]}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-xs text-zinc-500">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
