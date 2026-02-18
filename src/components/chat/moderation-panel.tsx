"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, Loader2, User, AlertTriangle, Plus, Trash2, X, Gavel } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface ModAction {
  id: string;
  action: string;
  reason: string | null;
  createdAt: string;
  target: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null };
  moderator: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null };
}

interface AutoModRule {
  id: string;
  type: string;
  config: { words?: string[] };
  isEnabled: boolean;
}

interface MemberForMod {
  id: string;
  role: string;
  user: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null };
}

interface ModerationPanelProps {
  channelId: string;
  onClose: () => void;
}

export function ModerationPanel({ channelId, onClose }: ModerationPanelProps) {
  const [tab, setTab] = useState<"rules" | "actions" | "log">("rules");
  const [rules, setRules] = useState<AutoModRule[]>([]);
  const [actions, setActions] = useState<ModAction[]>([]);
  const [members, setMembers] = useState<MemberForMod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWords, setNewWords] = useState("");
  const [actionTarget, setActionTarget] = useState("");
  const [actionType, setActionType] = useState("WARN_USER");
  const [actionReason, setActionReason] = useState("");
  const [actionDuration, setActionDuration] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [rulesRes, actionsRes, membersRes] = await Promise.all([
          fetch(`/api/chat/moderation/rules?channelId=${channelId}`),
          fetch(`/api/chat/moderation/actions?channelId=${channelId}`),
          fetch(`/api/chat/channels/${channelId}/members`),
        ]);
        const rulesData = await rulesRes.json();
        const actionsData = await actionsRes.json();
        const membersData = await membersRes.json();
        setRules(rulesData.rules || []);
        setActions(actionsData.actions || []);
        setMembers(membersData.members || []);
      } catch (error) {
        console.error("Failed to fetch moderation data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [channelId]);

  const submitModAction = async () => {
    if (!actionTarget || !actionType) return;
    setIsSubmittingAction(true);
    setActionError("");
    try {
      const res = await fetch("/api/chat/moderation/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          targetUserId: actionTarget,
          action: actionType,
          reason: actionReason.trim() || undefined,
          duration: actionDuration ? parseInt(actionDuration) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || "Action failed");
        return;
      }
      const newAction = await res.json();
      setActions((prev) => [newAction, ...prev]);
      setActionTarget("");
      setActionReason("");
      setActionDuration("");
      if (actionType === "BAN_USER") {
        setMembers((prev) => prev.filter((m) => m.user.id !== actionTarget));
      }
    } catch {
      setActionError("Something went wrong");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const addWordFilter = async () => {
    if (!newWords.trim()) return;
    const words = newWords.split(",").map((w) => w.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/chat/moderation/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, type: "WORD_FILTER", config: { words } }),
      });
      const rule = await res.json();
      setRules((prev) => [...prev, rule]);
      setNewWords("");
    } catch (error) {
      console.error("Failed to add rule:", error);
    }
  };

  const toggleRule = async (ruleId: string, isEnabled: boolean) => {
    try {
      await fetch("/api/chat/moderation/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ruleId, isEnabled: !isEnabled }),
      });
      setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: !isEnabled } : r)));
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl max-h-[80vh] rounded-xl border border-white/10 bg-zinc-900 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">Moderation</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-white/5">
          <button
            onClick={() => setTab("rules")}
            className={`px-4 py-2 text-sm ${tab === "rules" ? "text-white border-b-2 border-cyan-500" : "text-zinc-400"}`}
          >
            Auto-Mod Rules
          </button>
          <button
            onClick={() => setTab("actions")}
            className={`px-4 py-2 text-sm ${tab === "actions" ? "text-white border-b-2 border-cyan-500" : "text-zinc-400"}`}
          >
            Take Action
          </button>
          <button
            onClick={() => setTab("log")}
            className={`px-4 py-2 text-sm ${tab === "log" ? "text-white border-b-2 border-cyan-500" : "text-zinc-400"}`}
          >
            Audit Log
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
            </div>
          ) : tab === "actions" ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-zinc-800/30 p-4 space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-yellow-500" />
                  Moderation Action
                </h3>

                {actionError && (
                  <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                    {actionError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1 block">Target User</label>
                  <select
                    value={actionTarget}
                    onChange={(e) => setActionTarget(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option value="">Select a user...</option>
                    {members
                      .filter((m) => m.role === "MEMBER")
                      .map((m) => {
                        const name = m.user.firstName && m.user.lastName
                          ? `${m.user.firstName} ${m.user.lastName}`
                          : m.user.name || "User";
                        return (
                          <option key={m.user.id} value={m.user.id}>{name}</option>
                        );
                      })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1 block">Action</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option value="WARN_USER">Warn User</option>
                    <option value="MUTE_USER">Mute User</option>
                    <option value="BAN_USER">Ban User (removes from channel)</option>
                    <option value="DELETE_MESSAGE">Delete Message</option>
                  </select>
                </div>

                {actionType === "MUTE_USER" && (
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1 block">Duration (minutes)</label>
                    <select
                      value={actionDuration}
                      onChange={(e) => setActionDuration(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                    >
                      <option value="5">5 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="1440">24 hours</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1 block">Reason</label>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Reason for this action..."
                    className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>

                <button
                  onClick={submitModAction}
                  disabled={!actionTarget || isSubmittingAction}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-sm text-yellow-400 hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAction ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gavel className="h-4 w-4" />
                  )}
                  Execute Action
                </button>
              </div>
            </div>
          ) : tab === "rules" ? (
            <div className="space-y-4">
              {/* Add word filter */}
              <div className="rounded-lg border border-white/10 bg-zinc-800/30 p-4">
                <h3 className="text-sm font-medium text-white mb-2">Add Word Filter</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWords}
                    onChange={(e) => setNewWords(e.target.value)}
                    placeholder="Comma-separated words..."
                    className="flex-1 rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <button
                    onClick={addWordFilter}
                    className="px-3 py-2 rounded-lg bg-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {rules.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No auto-mod rules configured</p>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="rounded-lg border border-white/10 bg-zinc-800/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-300">{rule.type.replace("_", " ")}</span>
                      <button
                        onClick={() => toggleRule(rule.id, rule.isEnabled)}
                        className={`text-xs px-2 py-0.5 rounded ${rule.isEnabled ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-500"}`}
                      >
                        {rule.isEnabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    {rule.config.words && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.config.words.map((word, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {actions.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No moderation actions yet</p>
              ) : (
                actions.map((action) => {
                  const targetName = action.target.firstName && action.target.lastName
                    ? `${action.target.firstName} ${action.target.lastName}`
                    : action.target.name || "User";
                  const modName = action.moderator.firstName && action.moderator.lastName
                    ? `${action.moderator.firstName} ${action.moderator.lastName}`
                    : action.moderator.name || "Moderator";

                  return (
                    <div key={action.id} className="rounded-lg border border-white/10 bg-zinc-800/30 p-3">
                      <div className="flex items-center gap-2 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-zinc-300">{modName}</span>
                        <span className="text-zinc-500">{action.action.replace("_", " ").toLowerCase()}</span>
                        <span className="text-zinc-300">{targetName}</span>
                        <span className="text-zinc-600 ml-auto">{formatRelativeTime(action.createdAt)}</span>
                      </div>
                      {action.reason && (
                        <p className="text-xs text-zinc-500 mt-1">Reason: {action.reason}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
