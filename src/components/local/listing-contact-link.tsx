"use client";

import { ExternalLink } from "lucide-react";
import { useClickTracker } from "@/components/analytics/entity-view-tracker";

interface ListingContactLinkProps {
  listingSlug: string;
  contactUrl: string;
}

export function ListingContactLink({ listingSlug, contactUrl }: ListingContactLinkProps) {
  const { trackClick } = useClickTracker("listing", listingSlug);

  const handleClick = () => {
    trackClick("url");
  };

  return (
    <a
      href={contactUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
    >
      <ExternalLink className="h-5 w-5 text-cyan-400" />
      <span className="text-sm text-zinc-300 truncate">
        {contactUrl.replace(/^https?:\/\//, "")}
      </span>
    </a>
  );
}
