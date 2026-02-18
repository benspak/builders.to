"use client";

import { useState } from "react";
import { X, Loader2, Trash2, UserPlus, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChannelSettingsProps {
  channel: {
    id: string;
    name: string;
    description: string | null;
    topic: string | null;
    slowModeSeconds: number;
    type: string;
  };
  membership: { role: string } | null;
  onClose: () => void;
}

export function ChannelSettings({ channel, membership, onClose }: ChannelSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description || "");
  const [topic, setTopic] = useState(channel.topic || "");
  const [slowMode, setSlowMode] = useState(channel.slowModeSeconds);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteStatus, setInviteStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const isAdmin = membership && ["OWNER", "ADMIN"].includes(membership.role);
  const isPrivate = channel.type === "PRIVATE";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/chat/channels/${channel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, topic, slowModeSeconds: slowMode }),
      });
      onClose();
    } catch (error) {
      console.error("Failed to update channel:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteSearch.trim()) return;
    setIsInviting(true);
    setInviteStatus(null);
    try {
      const searchRes = await fetch(`/api/users/search?q=${encodeURIComponent(inviteSearch.trim())}&limit=1`);
      if (!searchRes.ok) {
        setInviteStatus({ type: "error", msg: "User search failed. Try a username or email." });
        return;
      }
      const searchData = await searchRes.json();
      const user = searchData.users?.[0];
      if (!user) {
        setInviteStatus({ type: "error", msg: "No user found with that name or email." });
        return;
      }
      const res = await fetch(`/api/chat/channels/${channel.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setInviteStatus({ type: "error", msg: data.error || "Invite failed" });
        return;
      }
      setInviteStatus({ type: "success", msg: `Invited ${user.name || user.username || "user"} successfully.` });
      setInviteSearch("");
    } catch {
      setInviteStatus({ type: "error", msg: "Something went wrong" });
    } finally {
      setIsInviting(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this channel?")) return;
    try {
      await fetch(`/api/chat/channels/${channel.id}`, { method: "DELETE" });
      router.push("/messages");
    } catch (error) {
      console.error("Failed to archive channel:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Channel Settings</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1 block">Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin}
              className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={!isAdmin}
              placeholder="What's this channel about?"
              className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin}
              placeholder="Describe this channel..."
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none disabled:opacity-50 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1 block">Slow Mode (seconds)</label>
            <select
              value={slowMode}
              onChange={(e) => setSlowMode(parseInt(e.target.value))}
              disabled={!isAdmin}
              className="w-full rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none disabled:opacity-50"
            >
              <option value="0">Off</option>
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
          </div>

          {/* Invite section for private channels */}
          {isPrivate && isAdmin && (
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1 block">
                <span className="flex items-center gap-1">
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite User
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteSearch}
                  onChange={(e) => { setInviteSearch(e.target.value); setInviteStatus(null); }}
                  placeholder="Username or name..."
                  className="flex-1 rounded-lg border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                />
                <button
                  onClick={handleInvite}
                  disabled={isInviting || !inviteSearch.trim()}
                  className="px-3 py-2 rounded-lg bg-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                >
                  {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                </button>
              </div>
              {inviteStatus && (
                <div className={`mt-2 flex items-center gap-1.5 text-xs ${inviteStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {inviteStatus.type === "success" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {inviteStatus.msg}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
          {membership?.role === "OWNER" && (
            <button
              onClick={handleArchive}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Archive Channel
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            {isAdmin && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
