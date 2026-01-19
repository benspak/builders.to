"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, MapPin, Flame, Users } from "lucide-react";

interface AlsoViewedUser {
  id: string;
  name: string | null;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  headline: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  openToWork: boolean;
  lookingForCofounder: boolean;
  availableForContract: boolean;
  openToMeeting: boolean;
  currentStreak: number;
  _count?: {
    projects: number;
  };
}

interface PeopleAlsoViewedProps {
  userId: string;        // The profile being viewed
  currentUserId?: string; // The logged-in user viewing
}

function getDisplayName(user: AlsoViewedUser): string {
  if (user.displayName) return user.displayName;
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || "Builder";
}

export function PeopleAlsoViewed({ userId, currentUserId }: PeopleAlsoViewedProps) {
  const [users, setUsers] = useState<AlsoViewedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlsoViewed() {
      try {
        const response = await fetch(`/api/users/${userId}/also-viewed?limit=5`);
        if (response.ok) {
          const data = await response.json();
          // Filter out the current viewer from the list
          const filteredUsers = currentUserId 
            ? data.users.filter((u: AlsoViewedUser) => u.id !== currentUserId)
            : data.users;
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error("Error fetching also viewed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlsoViewed();
  }, [userId, currentUserId]);

  // Don't render anything if no users or still loading with no data
  if (loading || users.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">People also viewed</h3>
      </div>

      <div className="space-y-3">
        {users.map((alsoViewedUser) => {
          const displayName = getDisplayName(alsoViewedUser);
          const profileUrl = alsoViewedUser.slug ? `/${alsoViewedUser.slug}` : null;
          // Use country if available, fall back to state for legacy users
          const locationSuffix = alsoViewedUser.country || alsoViewedUser.state;
          const location = alsoViewedUser.city && locationSuffix
            ? `${alsoViewedUser.city}, ${locationSuffix}`
            : alsoViewedUser.city || null;

          const content = (
            <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors group">
              {/* Avatar */}
              <div className="relative shrink-0">
                {alsoViewedUser.image ? (
                  <Image
                    src={alsoViewedUser.image}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="rounded-lg ring-1 ring-white/10 group-hover:ring-blue-500/30 transition-all object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}

                {/* Streak badge */}
                {alsoViewedUser.currentStreak > 0 && (
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white ring-2 ring-zinc-900">
                    <Flame className="h-2 w-2" />
                    {alsoViewedUser.currentStreak}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                  {displayName}
                </h4>
                {alsoViewedUser.headline && (
                  <p className="text-xs text-zinc-500 truncate">
                    {alsoViewedUser.headline}
                  </p>
                )}
                {location && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-600 mt-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {location}
                  </span>
                )}
              </div>
            </div>
          );

          if (profileUrl) {
            // Add ref parameter to track this as a referral from the current profile
            const hrefWithRef = `${profileUrl}?ref=${userId}`;
            return (
              <Link key={alsoViewedUser.id} href={hrefWithRef}>
                {content}
              </Link>
            );
          }

          return <div key={alsoViewedUser.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
