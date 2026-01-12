"use client";

import Link from "next/link";
import Image from "next/image";
import { User, MapPin, Briefcase, Users, Code, Rocket, Flame } from "lucide-react";

interface BuilderCardProps {
  builder: {
    id: string;
    name: string | null;
    slug: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    headline: string | null;
    city: string | null;
    state: string | null;  // Legacy field
    country: string | null;
    openToWork: boolean;
    lookingForCofounder: boolean;
    availableForContract: boolean;
    currentStreak: number;
    _count?: {
      projects: number;
    };
  };
}

function getDisplayName(builder: BuilderCardProps["builder"]): string {
  if (builder.displayName) return builder.displayName;
  if (builder.firstName && builder.lastName) {
    return `${builder.firstName} ${builder.lastName}`;
  }
  return builder.name || "Anonymous Builder";
}

export function BuilderCard({ builder }: BuilderCardProps) {
  const displayName = getDisplayName(builder);
  const profileUrl = builder.slug ? `/${builder.slug}` : null;
  // Use country if available, fall back to state for legacy users
  const locationSuffix = builder.country || builder.state;
  const location = builder.city && locationSuffix ? `${builder.city}, ${locationSuffix}` : builder.city || null;

  const hasIntentFlags = builder.openToWork || builder.lookingForCofounder || builder.availableForContract;

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-5 hover:border-orange-500/30 hover:bg-zinc-900/70 transition-all">
      {/* Background glow effect */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-orange-500/5 blur-3xl group-hover:bg-orange-500/10 transition-colors" />

      <div className="relative flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {builder.image ? (
            <Image
              src={builder.image}
              alt={displayName}
              width={56}
              height={56}
              className="rounded-xl ring-2 ring-white/10 group-hover:ring-orange-500/30 transition-all object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
              <User className="h-7 w-7 text-white" />
            </div>
          )}

          {/* Streak badge */}
          {builder.currentStreak > 0 && (
            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-zinc-900">
              <Flame className="h-2.5 w-2.5" />
              {builder.currentStreak}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
            {displayName}
          </h3>

          {builder.headline && (
            <p className="text-sm text-zinc-400 line-clamp-2 mt-0.5">
              {builder.headline}
            </p>
          )}

          {/* Location & Projects */}
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
            {builder._count && builder._count.projects > 0 && (
              <span className="flex items-center gap-1">
                <Rocket className="h-3 w-3" />
                {builder._count.projects} {builder._count.projects === 1 ? "project" : "projects"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Intent Flags */}
      {hasIntentFlags && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {builder.openToWork && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
              <Briefcase className="h-2.5 w-2.5" />
              Open to Work
            </span>
          )}
          {builder.lookingForCofounder && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-[10px] font-medium text-violet-400">
              <Users className="h-2.5 w-2.5" />
              Looking for Co-founder
            </span>
          )}
          {builder.availableForContract && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-[10px] font-medium text-cyan-400">
              <Code className="h-2.5 w-2.5" />
              Available for Contract
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (profileUrl) {
    return <Link href={profileUrl}>{content}</Link>;
  }

  return content;
}
