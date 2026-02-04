"use client";

import { useState } from "react";
import {
  FileText,
  AlignLeft,
  MapPin,
  Link as LinkIcon,
  User,
  Globe,
  MessageCircle,
  Play,
  Briefcase,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Target,
  Zap,
  AtSign,
  Camera,
} from "lucide-react";
import {
  ProfileCompletenessResult,
  ProfileField,
  getScoreColor,
  getScoreGradient,
} from "@/lib/profile-completeness";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  FileText,
  AlignLeft,
  MapPin,
  Link: LinkIcon,
  User,
  Globe,
  MessageCircle,
  Play,
  Briefcase,
  Users,
  AtSign,
  Camera,
};

interface ProfileCompletenessProps {
  result: ProfileCompletenessResult;
  className?: string;
  compact?: boolean;
}

export function ProfileCompleteness({
  result,
  className,
  compact = false,
}: ProfileCompletenessProps) {
  const [showAllMissing, setShowAllMissing] = useState(false);

  const scoreColor = getScoreColor(result.score);
  const scoreGradient = getScoreGradient(result.score);

  // Get level icon
  const LevelIcon = result.level === "complete" ? Trophy :
                    result.level === "advanced" ? Zap :
                    result.level === "intermediate" ? Target : Sparkles;

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        {/* Compact circular progress */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className="stroke-zinc-800"
                strokeWidth="2"
              />
              {/* Progress circle */}
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={cn(
                  scoreColor === "emerald" && "stroke-emerald-500",
                  scoreColor === "cyan" && "stroke-cyan-500",
                  scoreColor === "amber" && "stroke-amber-500",
                  scoreColor === "orange" && "stroke-orange-500"
                )}
                strokeWidth="2"
                strokeDasharray={`${result.score} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{result.score}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{result.levelLabel}</p>
            <p className="text-xs text-zinc-500">
              {result.missingFields.length === 0
                ? "All fields complete"
                : `${result.missingFields.length} fields to go`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      {/* Header with score */}
      <div className={cn("p-6 bg-gradient-to-r", scoreGradient, "bg-opacity-10")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                scoreColor === "emerald" && "bg-emerald-500/20",
                scoreColor === "cyan" && "bg-cyan-500/20",
                scoreColor === "amber" && "bg-amber-500/20",
                scoreColor === "orange" && "bg-orange-500/20"
              )}
            >
              <LevelIcon
                className={cn(
                  "h-6 w-6",
                  scoreColor === "emerald" && "text-emerald-400",
                  scoreColor === "cyan" && "text-cyan-400",
                  scoreColor === "amber" && "text-amber-400",
                  scoreColor === "orange" && "text-orange-400"
                )}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Profile Completeness
              </h3>
              <p
                className={cn(
                  "text-sm font-medium",
                  scoreColor === "emerald" && "text-emerald-400",
                  scoreColor === "cyan" && "text-cyan-400",
                  scoreColor === "amber" && "text-amber-400",
                  scoreColor === "orange" && "text-orange-400"
                )}
              >
                {result.levelLabel}
              </p>
            </div>
          </div>

          {/* Score circle */}
          <div className="relative h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className="stroke-zinc-800"
                strokeWidth="2.5"
              />
              {/* Progress circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className={cn(
                  scoreColor === "emerald" && "stroke-emerald-500",
                  scoreColor === "cyan" && "stroke-cyan-500",
                  scoreColor === "amber" && "stroke-amber-500",
                  scoreColor === "orange" && "stroke-orange-500"
                )}
                strokeWidth="2.5"
                strokeDasharray={`${(result.score / 100) * 94.2} 94.2`}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dasharray 0.5s ease-in-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{result.score}</span>
              <span className="text-[10px] text-zinc-500 -mt-1">%</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", scoreGradient)}
            style={{ width: `${result.score}%` }}
          />
        </div>
      </div>

      {/* Next steps */}
      {result.nextSteps.length > 0 && (
        <div className="p-6 border-t border-white/5">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            Next Steps to Complete Your Profile
          </h4>
          <div className="space-y-3">
            {result.nextSteps.map((field) => {
              const Icon = iconMap[field.icon] || FileText;
              return (
                <div
                  key={field.key}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                    field.category === "essential" &&
                      "bg-orange-500/5 border-orange-500/20",
                    field.category === "important" &&
                      "bg-cyan-500/5 border-cyan-500/20",
                    field.category === "optional" &&
                      "bg-zinc-500/5 border-zinc-500/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                      field.category === "essential" && "bg-orange-500/20",
                      field.category === "important" && "bg-cyan-500/20",
                      field.category === "optional" && "bg-zinc-500/20"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        field.category === "essential" && "text-orange-400",
                        field.category === "important" && "text-cyan-400",
                        field.category === "optional" && "text-zinc-400"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {field.label}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          field.category === "essential" &&
                            "bg-orange-500/20 text-orange-400",
                          field.category === "important" &&
                            "bg-cyan-500/20 text-cyan-400",
                          field.category === "optional" &&
                            "bg-zinc-500/20 text-zinc-400"
                        )}
                      >
                        +{field.weight}%
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {field.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more missing fields */}
          {result.missingFields.length > 3 && (
            <button
              onClick={() => setShowAllMissing(!showAllMissing)}
              className="mt-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-full justify-center"
            >
              {showAllMissing ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show {result.missingFields.length - 3} more fields
                </>
              )}
            </button>
          )}

          {/* Additional missing fields */}
          {showAllMissing && result.missingFields.length > 3 && (
            <div className="mt-4 space-y-2 pt-4 border-t border-white/5">
              {result.missingFields.slice(3).map((field) => {
                const Icon = iconMap[field.icon] || FileText;
                return (
                  <div
                    key={field.key}
                    className="flex items-center gap-3 p-2 rounded-lg"
                  >
                    <Icon className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-400">{field.label}</span>
                    <span className="text-xs text-zinc-600">+{field.weight}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Completed fields summary */}
      {result.completedFields.length > 0 && (
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>
              {result.completedFields.length} of {result.completedFields.length + result.missingFields.length} fields completed
            </span>
          </div>
        </div>
      )}

      {/* Celebration for complete profile */}
      {result.score >= 100 && (
        <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-t border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <Trophy className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                Congratulations! 🎉
              </p>
              <p className="text-xs text-zinc-400">
                Your profile is complete. You&apos;re ready to connect with the builder community!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
