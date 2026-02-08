"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SocialPlatform } from "@prisma/client";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { PlatformSelector, getCharacterLimit } from "@/components/composer/platform-selector";
import { SchedulePicker } from "@/components/composer/schedule-picker";
import { PlatformPreviews } from "@/components/composer/platform-preview";
import { cn } from "@/lib/utils";

interface ConnectedPlatform {
  platform: SocialPlatform;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
  connectedAt: Date;
  scopes: string[];
}

export function ComposerWithAI() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([SocialPlatform.BUILDERS]);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch connected platforms
  useEffect(() => {
    async function fetchPlatforms() {
      try {
        const response = await fetch("/api/platforms");
        if (response.ok) {
          const data = await response.json();
          setConnectedPlatforms(data.platforms || []);
        }
      } catch (error) {
        console.error("Error fetching platforms:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlatforms();
  }, []);

  const characterLimit = getCharacterLimit(platforms);
  const isOverLimit = content.length > characterLimit;
  const canSubmit = content.trim().length > 0 && 
    !isOverLimit && 
    platforms.length > 0;

  const handleSubmit = async (publishNow: boolean) => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the post
      const createResponse = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          platforms,
          scheduledAt: scheduledAt?.toISOString(),
        }),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.error || "Failed to create post");
      }

      const { post } = await createResponse.json();

      // If publishing now (not scheduling), publish immediately
      if (publishNow && !scheduledAt) {
        const publishResponse = await fetch(`/api/posts/${post.id}/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const publishData = await publishResponse.json();

        if (publishResponse.status === 422) {
          // All platforms failed - show the specific error
          throw new Error(publishData.error || "Failed to publish to all platforms");
        }

        if (publishResponse.status === 207) {
          // Partial success - some platforms failed
          // Show a warning but still redirect (some content was published)
          console.warn("Partial publish failure:", publishData.warnings);
          setError(publishData.message || "Post published but some platforms failed");
          // Wait briefly so the user sees the warning, then redirect
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else if (!publishResponse.ok) {
          throw new Error(publishData.error || "Failed to publish post");
        }
      }

      // Redirect to feed on success
      router.push("/feed");
      router.refresh();
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-card border rounded-xl p-6 space-y-6">
        {/* Platform Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Post to
          </label>
          <PlatformSelector
            selectedPlatforms={platforms}
            onPlatformsChange={setPlatforms}
            connectedPlatforms={connectedPlatforms}
            disabled={isSubmitting}
          />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Content
          </label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share?"
              disabled={isSubmitting}
              rows={6}
              className={cn(
                "w-full px-4 py-3 text-base border rounded-lg bg-background resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                isOverLimit && "border-destructive focus:ring-destructive/50"
              )}
            />
            <div className={cn(
              "absolute bottom-3 right-3 text-xs",
              isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
            )}>
              {content.length}/{characterLimit}
            </div>
          </div>
        </div>

        {/* Schedule Picker */}
        <SchedulePicker
          scheduledAt={scheduledAt}
          onScheduleChange={setScheduledAt}
          disabled={isSubmitting}
        />

        {/* Previews */}
        {content.trim() && (
          <PlatformPreviews
            platforms={platforms}
            content={content}
            connectedPlatforms={connectedPlatforms}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          {scheduledAt ? (
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={!canSubmit || isSubmitting}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Schedule Post
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg border transition-colors",
                  "hover:bg-muted",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={!canSubmit || isSubmitting}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
