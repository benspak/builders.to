"use client";

import { SocialPlatform } from "@prisma/client";
import { ComposerWithAI } from "@/app/compose/composer-with-ai";

interface PostComposerProps {
  initialContent?: string;
  initialPlatforms?: SocialPlatform[];
  onSuccess?: () => void;
}

/**
 * Reusable post composer – thin wrapper around the unified ComposerWithAI.
 * Can be embedded anywhere (modals, sidebars, etc.) with optional defaults.
 */
export function PostComposer({
  initialContent = "",
  initialPlatforms,
  onSuccess,
}: PostComposerProps) {
  return (
    <ComposerWithAI
      compact
      initialContent={initialContent}
      initialPlatforms={initialPlatforms}
      onSuccess={onSuccess}
    />
  );
}
