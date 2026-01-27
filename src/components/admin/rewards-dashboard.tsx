"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Loader2,
  AlertCircle,
  Users,
  TrendingUp,
  Wallet,
  Settings,
  Shield,
  AlertTriangle,
  Pause,
  Play,
  Flag,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  totalPendingAmount: number;
  totalLifetimeEarnings: number;
  totalPayouts: number;
  totalPayoutAmount: number;
  activeEarners: number;
  pausedUsers: number;
  flaggedUsers: number;
}

interface RewardSettings {
  baseRewardCents: number;
  engagementBonusCents: number;
  likesPerTier: number;
  maxBonusCents: number;
  minCharCount: number;
  maxPostsPerDay: number;
  minPayoutCents: number;
  globalPayoutsPaused: boolean;
}

interface UserEarning {
  userId: string;
  user: { name: string | null; email: string | null; slug: string | null };
  pendingAmount: number;
  lifetimeEarnings: number;
  isPaused: boolean;
  isFlagged: boolean;
  flagReason: string | null;
  lastPayoutAt: string | null;
}

export function AdminRewardsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<RewardSettings | null>(null);
  const [users, setUsers] = useState<UserEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<"all" | "paused" | "flagged" | "hasBalance">("all");
  const [editedSettings, setEditedSettings] = useState<Partial<RewardSettings>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const [adminRes, usersRes] = await Promise.all([
        fetch("/api/admin/rewards"),
        fetch(`/api/admin/rewards/users?filter=${userFilter}`),
      ]);

      if (adminRes.ok) {
        const data = await adminRes.json();
        setStats(data.stats);
        setSettings(data.settings);
        setEditedSettings({});
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userFilter]);

  const handleSaveSettings = async () => {
    if (Object.keys(editedSettings).length === 0) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      setSettings(data.settings);
      setEditedSettings({});
      setSuccess("Settings saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUserAction = async (
    userId: string,
    action: string,
    reason?: string
  ) => {
    setActionLoading(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/rewards/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Action failed");
      }

      // Refresh user list
      const usersRes = await fetch(`/api/admin/rewards/users?filter=${userFilter}`);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }

      // Refresh stats
      const adminRes = await fetch("/api/admin/rewards");
      if (adminRes.ok) {
        const data = await adminRes.json();
        setStats(data.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleGlobalPause = async () => {
    const newValue = !settings?.globalPayoutsPaused;
    setEditedSettings((prev) => ({ ...prev, globalPayoutsPaused: newValue }));

    // Save immediately
    setSaving(true);
    try {
      const response = await fetch("/api/admin/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalPayoutsPaused: newValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setEditedSettings({});
        setSuccess(newValue ? "Payouts paused globally" : "Payouts resumed");
      }
    } catch (err) {
      setError("Failed to toggle global pause");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Rewards Admin</h1>
            <p className="text-zinc-400">Manage creator rewards system</p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-zinc-400">Total Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${((stats?.totalPendingAmount ?? 0) / 100).toFixed(2)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-zinc-400">Total Paid Out</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${((stats?.totalPayoutAmount ?? 0) / 100).toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500">{stats?.totalPayouts ?? 0} payouts</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-zinc-400">Active Earners</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats?.activeEarners ?? 0}</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-zinc-400">Issues</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {(stats?.pausedUsers ?? 0) + (stats?.flaggedUsers ?? 0)}
          </p>
          <p className="text-xs text-zinc-500">
            {stats?.pausedUsers ?? 0} paused, {stats?.flaggedUsers ?? 0} flagged
          </p>
        </div>
      </div>

      {/* Global Controls */}
      <div className="rounded-xl bg-zinc-900/50 border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-zinc-400" />
              Global Controls
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Emergency controls for the rewards system
            </p>
          </div>

          <button
            onClick={toggleGlobalPause}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
              settings?.globalPayoutsPaused
                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            )}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : settings?.globalPayoutsPaused ? (
              <>
                <Play className="h-4 w-4" />
                Resume Payouts
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" />
                Pause All Payouts
              </>
            )}
          </button>
        </div>

        {settings?.globalPayoutsPaused && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Payouts are currently paused globally. Users cannot receive payouts until resumed.
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="rounded-xl bg-zinc-900/50 border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          Reward Settings
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Base Reward (cents)
            </label>
            <input
              type="number"
              value={editedSettings.baseRewardCents ?? settings?.baseRewardCents ?? 5}
              onChange={(e) =>
                setEditedSettings((prev) => ({
                  ...prev,
                  baseRewardCents: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">
              ${((editedSettings.baseRewardCents ?? settings?.baseRewardCents ?? 5) / 100).toFixed(2)} per post
            </p>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Max Bonus (cents)
            </label>
            <input
              type="number"
              value={editedSettings.maxBonusCents ?? settings?.maxBonusCents ?? 2}
              onChange={(e) =>
                setEditedSettings((prev) => ({
                  ...prev,
                  maxBonusCents: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">
              ${((editedSettings.maxBonusCents ?? settings?.maxBonusCents ?? 2) / 100).toFixed(2)} max engagement
            </p>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Min Characters
            </label>
            <input
              type="number"
              value={editedSettings.minCharCount ?? settings?.minCharCount ?? 100}
              onChange={(e) =>
                setEditedSettings((prev) => ({
                  ...prev,
                  minCharCount: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Min Payout (cents)
            </label>
            <input
              type="number"
              value={editedSettings.minPayoutCents ?? settings?.minPayoutCents ?? 500}
              onChange={(e) =>
                setEditedSettings((prev) => ({
                  ...prev,
                  minPayoutCents: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-500 mt-1">
              ${((editedSettings.minPayoutCents ?? settings?.minPayoutCents ?? 500) / 100).toFixed(2)} threshold
            </p>
          </div>
        </div>

        {Object.keys(editedSettings).length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Save Changes
            </button>
            <button
              onClick={() => setEditedSettings({})}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Users */}
      <div className="rounded-xl bg-zinc-900/50 border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            Users with Earnings
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value as typeof userFilter)}
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Users</option>
              <option value="hasBalance">Has Balance</option>
              <option value="paused">Paused</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">No users found</p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.userId}
                className={cn(
                  "p-4 rounded-lg bg-zinc-800/50 border",
                  user.isFlagged
                    ? "border-red-500/30"
                    : user.isPaused
                      ? "border-amber-500/30"
                      : "border-white/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {user.user.name || user.user.email || user.userId}
                      </p>
                      {user.user.slug && (
                        <p className="text-sm text-zinc-500">@{user.user.slug}</p>
                      )}
                    </div>
                    {user.isFlagged && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                        Flagged
                      </span>
                    )}
                    {user.isPaused && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                        Paused
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Pending</p>
                      <p className="font-semibold text-white">
                        ${(user.pendingAmount / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400">Lifetime</p>
                      <p className="font-semibold text-white">
                        ${(user.lifetimeEarnings / 100).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {user.isPaused ? (
                        <button
                          onClick={() => handleUserAction(user.userId, "resume")}
                          disabled={actionLoading === user.userId}
                          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                          title="Resume"
                        >
                          {actionLoading === user.userId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.userId, "pause")}
                          disabled={actionLoading === user.userId}
                          className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                          title="Pause"
                        >
                          {actionLoading === user.userId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      {user.isFlagged ? (
                        <button
                          onClick={() => handleUserAction(user.userId, "unflag")}
                          disabled={actionLoading === user.userId}
                          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                          title="Unflag"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const reason = prompt("Enter reason for flagging:");
                            if (reason) {
                              handleUserAction(user.userId, "flag", reason);
                            }
                          }}
                          disabled={actionLoading === user.userId}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          title="Flag"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      )}

                      {user.pendingAmount > 0 && (
                        <button
                          onClick={() => {
                            const reason = prompt("Enter reason for cancelling pending rewards:");
                            if (reason) {
                              handleUserAction(user.userId, "cancelPending", reason);
                            }
                          }}
                          disabled={actionLoading === user.userId}
                          className="p-2 rounded-lg bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                          title="Cancel Pending"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {user.flagReason && (
                  <p className="mt-2 text-sm text-red-400">
                    Flag reason: {user.flagReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
