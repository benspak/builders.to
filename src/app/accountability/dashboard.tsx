"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Users, Plus, Search, Loader2 } from "lucide-react";
import { PartnershipStatus, CheckInFrequency, CheckInMood } from "@prisma/client";
import { PartnershipCard } from "@/components/accountability/partnership-card";
import { CheckInCard } from "@/components/accountability/check-in-card";
import { BuildingSimilar } from "@/components/matching/building-similar";

interface Partner {
  id: string;
  slug: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  currentStreak: number;
}

interface Partnership {
  id: string;
  status: PartnershipStatus;
  checkInFrequency: CheckInFrequency;
  goal: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  requester: Partner;
  partner: Partner;
  _count: {
    checkIns: number;
  };
  recentCheckIns?: {
    id: string;
    userId: string;
    note: string | null;
    mood: CheckInMood | null;
    createdAt: string;
  }[];
}

interface AccountabilityDashboardProps {
  userId: string;
}

export function AccountabilityDashboard({ userId }: AccountabilityDashboardProps) {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");

  const fetchPartnerships = useCallback(async () => {
    try {
      const statusParam = filter === "all" ? "all_active" : filter;
      const response = await fetch(`/api/accountability?status=${statusParam}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setPartnerships(data.partnerships);
      }
    } catch (error) {
      console.error("Error fetching partnerships:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Compute whether the user has already checked in today (across any partnership)
  const activePartnerships = useMemo(
    () => partnerships.filter((p) => p.status === "ACTIVE"),
    [partnerships]
  );

  const hasCheckedInToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activePartnerships.some((p) =>
      p.recentCheckIns?.some((c) => {
        const checkInDate = new Date(c.createdAt);
        checkInDate.setHours(0, 0, 0, 0);
        return c.userId === userId && checkInDate.getTime() === today.getTime();
      })
    );
  }, [activePartnerships, userId]);

  useEffect(() => {
    fetchPartnerships();
  }, [fetchPartnerships]);

  const handleAccept = async (partnershipId: string) => {
    try {
      const response = await fetch("/api/accountability/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnershipId, accept: true }),
      });

      if (response.ok) {
        fetchPartnerships();
      }
    } catch (error) {
      console.error("Error accepting partnership:", error);
    }
  };

  const handleDecline = async (partnershipId: string) => {
    try {
      const response = await fetch("/api/accountability/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnershipId, accept: false }),
      });

      if (response.ok) {
        fetchPartnerships();
      }
    } catch (error) {
      console.error("Error declining partnership:", error);
    }
  };

  const handleEnd = async (partnershipId: string) => {
    if (!confirm("Are you sure you want to end this partnership?")) return;

    try {
      const response = await fetch(`/api/accountability/${partnershipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENDED" }),
      });

      if (response.ok) {
        fetchPartnerships();
      }
    } catch (error) {
      console.error("Error ending partnership:", error);
    }
  };

  const pendingRequests = partnerships.filter(
    (p) => p.status === "PENDING" && p.partner.id === userId
  );
  const sentRequests = partnerships.filter(
    (p) => p.status === "PENDING" && p.requester.id === userId
  );

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
              <Users className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Accountability Partners</h1>
              <p className="text-zinc-500">Stay on track with your building goals</p>
            </div>
          </div>
        </div>

        {/* Daily check-in (one for all partners) */}
        {activePartnerships.length > 0 && (
          <div className="mb-8">
            <CheckInCard
              partnerCount={activePartnerships.length}
              hasCheckedInToday={hasCheckedInToday}
              onCheckIn={() => fetchPartnerships()}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Pending Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-4">
                  {pendingRequests.map((partnership) => (
                    <PartnershipCard
                      key={partnership.id}
                      partnership={partnership}
                      currentUserId={userId}
                      onAccept={() => handleAccept(partnership.id)}
                      onDecline={() => handleDecline(partnership.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-green-500/20 text-green-400"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                All ({activePartnerships.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "pending"
                    ? "bg-green-500/20 text-green-400"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Sent Requests ({sentRequests.length})
              </button>
            </div>

            {/* Partnerships list */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
            ) : activePartnerships.length === 0 && sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 mx-auto mb-4">
                  <Users className="h-8 w-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No partnerships yet
                </h3>
                <p className="text-zinc-500 mb-4">
                  Find builders with similar goals and hold each other accountable
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(filter === "pending" ? sentRequests : activePartnerships).map(
                  (partnership) => (
                    <PartnershipCard
                      key={partnership.id}
                      partnership={partnership}
                      currentUserId={userId}
                      onEnd={() => handleEnd(partnership.id)}
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Find partners */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6">
              <h3 className="text-sm font-semibold text-white mb-4">
                Find Partners
              </h3>
              <p className="text-sm text-zinc-500 mb-4">
                Connect with builders who share your tech stack and interests
              </p>
              <Link
                href="/discover"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors text-sm"
              >
                <Search className="h-4 w-4" />
                Discover Builders
              </Link>
            </div>

            {/* Building Similar */}
            <BuildingSimilar limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}
