"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Users,
  Compass,
  User,
  Flame,
  Loader2,
  Handshake,
  Sparkles,
  Target,
  Share2,
  Check,
} from "lucide-react";
import { BuildingCategory } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PartnerRequestModal } from "@/components/accountability/partner-request-modal";

interface SimilarUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
  techStack: string[];
  buildingCategory: BuildingCategory | null;
  karma: number;
  currentStreak: number;
  similarityScore: number;
  matchReasons: string[];
}

type DiscoveryTab = "similar" | "accountability";

interface DiscoverDashboardProps {
  userId: string;
}

function getDisplayName(user: { displayName?: string | null; firstName?: string | null; lastName?: string | null; name?: string | null }): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
}

export function DiscoverDashboard({ userId }: DiscoverDashboardProps) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("similar");
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerModalUser, setPartnerModalUser] = useState<SimilarUser | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Fetch similar users
  const fetchSimilarUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/similar?limit=20");
      if (response.ok) {
        const data = await response.json();
        setSimilarUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching similar users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSimilarUsers();
  }, [fetchSimilarUsers]);


  const copyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/sign-in?ref=discover`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const renderUserCard = (user: SimilarUser) => {
    const displayName = getDisplayName(user);
    const profileUrl = user.slug ? `/${user.slug}` : null;
    return (
      <div
        key={user.id}
        className="group relative rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-5 hover:border-white/20 transition-all"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link href={profileUrl || "#"} className="shrink-0">
            <div className="relative">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={56}
                  height={56}
                  className="rounded-xl ring-1 ring-white/10 group-hover:ring-cyan-500/30 transition-all object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <User className="h-7 w-7 text-white" />
                </div>
              )}

              {/* Streak badge */}
              {user.currentStreak > 0 && (
                <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-zinc-900">
                  <Flame className="h-2.5 w-2.5" />
                  {user.currentStreak}
                </div>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={profileUrl || "#"} className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {displayName}
                </h3>
              </Link>

              <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 whitespace-nowrap">
                {user.similarityScore}% match
              </span>
            </div>

            {user.headline && (
              <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{user.headline}</p>
            )}

            {/* Location */}
            {(user.city || user.country) && (
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[user.city, user.country].filter(Boolean).join(", ")}
              </p>
            )}

            {/* Match reasons */}
            {user.matchReasons.length > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                {user.matchReasons[0]}
              </p>
            )}

            {/* Tech stack */}
            {user.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-400"
                  >
                    {tech}
                  </span>
                ))}
                {user.techStack.length > 4 && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-500">
                    +{user.techStack.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <button
            onClick={() => setPartnerModalUser(user)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            title="Request accountability partnership"
          >
            <Handshake className="h-4 w-4" />
            Partner
          </button>

          {profileUrl && (
            <Link
              href={profileUrl}
              className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              View
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Discover Builders</h1>
              <p className="text-zinc-500">Find builders near you and connect with those building similar things</p>
            </div>
          </div>

          {/* Invite Button */}
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-colors"
          >
            {inviteCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Invite Builder
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("similar")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "similar"
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Building Similar
          </button>
          <button
            onClick={() => setActiveTab("accountability")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "accountability"
                ? "bg-green-500/20 text-green-400"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800"
            )}
          >
            <Target className="h-4 w-4" />
            Find Partners
          </button>
        </div>

        {/* Similar Tab */}
        {activeTab === "similar" && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              </div>
            ) : similarUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No similar builders found</h3>
                <p className="text-zinc-500 mb-4">
                  Complete your profile with your tech stack and interests to find matches
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {similarUsers.map((user) => renderUserCard(user))}
              </div>
            )}
          </div>
        )}

        {/* Accountability Tab */}
        {activeTab === "accountability" && (
          <div>
            {/* Info banner */}
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 shrink-0">
                  <Handshake className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Find Accountability Partners</h3>
                  <p className="text-sm text-zinc-400">
                    Connect with builders working on similar things and hold each other accountable.
                    Partners with matching goals see 3x better completion rates!
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : similarUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 mx-auto mb-4">
                  <Target className="h-8 w-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No potential partners found</h3>
                <p className="text-zinc-500 mb-4">
                  Complete your profile to find builders with similar goals
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-400 transition-colors"
                  >
                    Complete Profile
                  </Link>
                  <button
                    onClick={copyInviteLink}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Invite a Friend
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {similarUsers.map((user) => renderUserCard(user))}
              </div>
            )}

            {/* Existing partnerships link */}
            <div className="mt-8 text-center">
              <Link
                href="/accountability"
                className="text-sm text-zinc-500 hover:text-white transition-colors"
              >
                View your existing partnerships →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Partner Request Modal */}
      {partnerModalUser && (
        <PartnerRequestModal
          isOpen={!!partnerModalUser}
          onClose={() => setPartnerModalUser(null)}
          targetUser={{
            id: partnerModalUser.id,
            slug: partnerModalUser.slug,
            displayName: partnerModalUser.displayName,
            firstName: partnerModalUser.firstName,
            lastName: partnerModalUser.lastName,
            name: partnerModalUser.name,
            image: partnerModalUser.image,
          }}
        />
      )}
    </div>
  );
}
