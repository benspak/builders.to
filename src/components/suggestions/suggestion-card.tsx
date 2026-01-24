"use client";

import { useState } from "react";
import { SocialPlatform, SuggestionStatus } from "@prisma/client";
import { Check, X, Edit2, Send, Loader2, Sparkles } from "lucide-react";
import { PLATFORMS } from "@/components/composer/platform-selector";
import { cn } from "@/lib/utils";

interface AgentSuggestion {
  id: string;
  content: string;
  platforms: SocialPlatform[];
  status: SuggestionStatus;
  reasoning: string | null;
  createdAt: string;
}

interface SuggestionCardProps {
  suggestion: AgentSuggestion;
  onApprove: (id: string, editedContent?: string, publishImmediately?: boolean) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  disabled?: boolean;
}

export function SuggestionCard({
  suggestion,
  onApprove,
  onReject,
  disabled = false,
}: SuggestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(suggestion.content);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (publishImmediately: boolean) => {
    setIsSubmitting(true);
    try {
      const contentToSave = isEditing ? editedContent : undefined;
      await onApprove(suggestion.id, contentToSave, publishImmediately);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(suggestion.id, rejectReason || undefined);
      setShowRejectInput(false);
      setRejectReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = suggestion.status === SuggestionStatus.PENDING;

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-4",
      !isPending && "opacity-60"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-muted-foreground">
            AI Suggestion • {new Date(suggestion.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {suggestion.platforms.map((platform) => (
            <span
              key={platform}
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold",
                PLATFORMS[platform].color
              )}
            >
              {PLATFORMS[platform].icon}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          disabled={isSubmitting}
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap">{suggestion.content}</p>
      )}

      {/* Reasoning */}
      {suggestion.reasoning && (
        <p className="text-xs text-muted-foreground italic">
          {suggestion.reasoning}
        </p>
      )}

      {/* Reject Reason Input */}
      {showRejectInput && (
        <div className="space-y-2">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Why are you rejecting this? (optional)"
            disabled={isSubmitting}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Reject"}
            </button>
            <button
              onClick={() => {
                setShowRejectInput(false);
                setRejectReason("");
              }}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-xs border rounded-lg hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {isPending && !showRejectInput && (
        <div className="flex items-center gap-2 pt-2 border-t">
          {isEditing ? (
            <>
              <button
                onClick={() => handleApprove(false)}
                disabled={disabled || isSubmitting || !editedContent.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(suggestion.content);
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleApprove(true)}
                disabled={disabled || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Approve & Post
              </button>
              <button
                onClick={() => handleApprove(false)}
                disabled={disabled || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <Check className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={disabled || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg hover:bg-muted disabled:opacity-50"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={disabled || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 disabled:opacity-50 ml-auto"
              >
                <X className="w-3 h-3" />
                Reject
              </button>
            </>
          )}
        </div>
      )}

      {/* Status Badge */}
      {!isPending && (
        <div className={cn(
          "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full",
          suggestion.status === SuggestionStatus.APPROVED && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          suggestion.status === SuggestionStatus.REJECTED && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          suggestion.status === SuggestionStatus.PUBLISHED && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        )}>
          {suggestion.status === SuggestionStatus.APPROVED && <Check className="w-3 h-3" />}
          {suggestion.status === SuggestionStatus.REJECTED && <X className="w-3 h-3" />}
          {suggestion.status === SuggestionStatus.PUBLISHED && <Send className="w-3 h-3" />}
          {suggestion.status}
        </div>
      )}
    </div>
  );
}
