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
  UserPlus,
  Loader2,
  Navigation,
  Filter,
  Search,
  Handshake,
  Sparkles,
  Target,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { BuildingCategory } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PartnerRequestModal } from "@/components/accountability/partner-request-modal";

interface NearbyUser {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  headline: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  currentStreak: number;
  distanceKm: number;
  projectCount: number;
  followerCount: number;
  isFollowing: boolean;
  openToWork: boolean;
  lookingForCofounder: boolean;
  availableForContract: boolean;
  openToMeeting: boolean;
}

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

type DiscoveryTab = "nearby" | "similar" | "accountability";

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

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }
  return `${Math.round(distanceKm)}km`;
}

export function DiscoverDashboard({ userId }: DiscoverDashboardProps) {
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("nearby");
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(50);
  const [partnerModalUser, setPartnerModalUser] = useState<SimilarUser | NearbyUser | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Filters for nearby
  const [filters, setFilters] = useState({
    openToWork: false,
    lookingForCofounder: false,
    openToMeeting: false,
  });

  // Get user's location
  const requestLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Unable to get your location. Please enable location services.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Fetch nearby users
  const fetchNearbyUsers = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString(),
        radius: radius.toString(),
        limit: "50",
      });

      if (filters.openToWork) params.append("openToWork", "true");
      if (filters.lookingForCofounder) params.append("lookingForCofounder", "true");
      if (filters.openToMeeting) params.append("openToMeeting", "true");

      const response = await fetch(`/api/users/nearby?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNearbyUsers(data.users);
        // Update following state
        const followingSet = new Set<string>(
          data.users.filter((u: NearbyUser) => u.isFollowing).map((u: NearbyUser) => u.id)
        );
        setFollowingIds(followingSet);
      }
    } catch (error) {
      console.error("Error fetching nearby users:", error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, radius, filters]);

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
    if (activeTab === "nearby") {
      requestLocation();
    } else if (activeTab === "similar" || activeTab === "accountability") {
      fetchSimilarUsers();
    }
  }, [activeTab, requestLocation, fetchSimilarUsers]);

  // Fetch nearby when location is available
  useEffect(() => {
    if (userLocation && activeTab === "nearby") {
      fetchNearbyUsers();
    }
  }, [userLocation, activeTab, fetchNearbyUsers]);

  const handleFollow = async (targetUserId: string) => {
    setLoadingFollow(targetUserId);
    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowingIds((prev) => {
          const next = new Set(prev);
          if (data.isFollowing) {
            next.add(targetUserId);
          } else {
            next.delete(targetUserId);
          }
          return next;
        });
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setLoadingFollow(null);
    }
  };

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

  const renderUserCard = (user: NearbyUser | SimilarUser, type: "nearby" | "similar") => {
    const displayName = getDisplayName(user);
    const profileUrl = user.slug ? `/${user.slug}` : null;
    const isFollowing = followingIds.has(user.id);
    const isNearby = type === "nearby";
    const nearbyUser = user as NearbyUser;
    const similarUser = user as SimilarUser;

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
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={profileUrl || "#"}>
                <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {displayName}
                </h3>
              </Link>

              {/* Badges */}
              {isNearby && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(nearbyUser.distanceKm)}
                </span>
              )}

              {!isNearby && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400">
                  {similarUser.similarityScore}% match
                </span>
              )}
            </div>

            {user.headline && (
              <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{user.headline}</p>
            )}

            {/* Location for nearby */}
            {isNearby && (nearbyUser.city || nearbyUser.country) && (
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[nearbyUser.city, nearbyUser.country].filter(Boolean).join(", ")}
              </p>
            )}

            {/* Match reasons for similar */}
            {!isNearby && similarUser.matchReasons.length > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                {similarUser.matchReasons[0]}
              </p>
            )}

            {/* Intent flags for nearby */}
            {isNearby && (
              <div className="flex flex-wrap gap-1 mt-2">
                {nearbyUser.openToMeeting && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400">
                    Open to meeting
                  </span>
                )}
                {nearbyUser.lookingForCofounder && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-400">
                    Looking for cofounder
                  </span>
                )}
                {nearbyUser.openToWork && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-400">
                    Open to work
                  </span>
                )}
              </div>
            )}

            {/* Tech stack for similar */}
            {!isNearby && similarUser.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {similarUser.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-400"
                  >
                    {tech}
                  </span>
                ))}
                {similarUser.techStack.length > 4 && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-500">
                    +{similarUser.techStack.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <button
            onClick={() => handleFollow(user.id)}
            disabled={loadingFollow === user.id}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isFollowing
                ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            )}
          >
            {loadingFollow === user.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className={cn("h-4 w-4", isFollowing && "fill-current")} />
                {isFollowing ? "Following" : "Follow"}
              </>
            )}
          </button>

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
            onClick={() => setActiveTab("nearby")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "nearby"
                ? "bg-blue-500/20 text-blue-400"
                : "text-zinc-500 hover:text-white hover:bg-zinc-800"
            )}
          >
            <MapPin className="h-4 w-4" />
            Nearby
          </button>
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

        {/* Nearby Tab */}
        {activeTab === "nearby" && (
          <div>
            {/* Location controls */}
            {locationError ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 mb-6">
                <p className="text-amber-400 text-sm mb-3">{locationError}</p>
                <button
                  onClick={requestLocation}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Enable Location
                </button>
              </div>
            ) : !userLocation ? (
              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-8 mb-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-4" />
                <p className="text-zinc-400">Getting your location...</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-500">Filter:</span>
                  </div>

                  <select
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                    <option value={100}>100 km</option>
                    <option value={250}>250 km</option>
                    <option value={500}>500 km</option>
                  </select>

                  <button
                    onClick={() => setFilters((f) => ({ ...f, openToMeeting: !f.openToMeeting }))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors",
                      filters.openToMeeting
                        ? "bg-green-500/20 text-green-400"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    Open to Meeting
                  </button>

                  <button
                    onClick={() => setFilters((f) => ({ ...f, lookingForCofounder: !f.lookingForCofounder }))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors",
                      filters.lookingForCofounder
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    Looking for Cofounder
                  </button>

                  <button
                    onClick={() => setFilters((f) => ({ ...f, openToWork: !f.openToWork }))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors",
                      filters.openToWork
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    Open to Work
                  </button>
                </div>
              </>
            )}

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
              </div>
            ) : nearbyUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No builders nearby</h3>
                <p className="text-zinc-500 mb-4">
                  Try increasing the radius or adjusting your filters
                </p>
                <button
                  onClick={copyInviteLink}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Invite builders to join
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {nearbyUsers.map((user) => renderUserCard(user, "nearby"))}
              </div>
            )}
          </div>
        )}

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
                {similarUsers.map((user) => renderUserCard(user, "similar"))}
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
                {similarUsers.map((user) => renderUserCard(user, "similar"))}
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
