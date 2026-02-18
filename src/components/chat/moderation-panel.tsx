"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, Loader2, User, AlertTriangle, Plus, Trash2, X } from "lucide-react";
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

interface ModerationPanelProps {
  channelId: string;
  onClose: () => void;
}

export function ModerationPanel({ channelId, onClose }: ModerationPanelProps) {
  const [tab, setTab] = useState<"rules" | "log">("rules");
  const [rules, setRules] = useState<AutoModRule[]>([]);
  const [actions, setActions] = useState<ModAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWords, setNewWords] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [rulesRes, actionsRes] = await Promise.all([
          fetch(`/api/chat/moderation/rules?channelId=${channelId}`),
          fetch(`/api/chat/moderation/actions?channelId=${channelId}`),
        ]);
        const rulesData = await rulesRes.json();
        const actionsData = await actionsRes.json();
        setRules(rulesData.rules || []);
        setActions(actionsData.actions || []);
      } catch (error) {
        console.error("Failed to fetch moderation data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [channelId]);

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
