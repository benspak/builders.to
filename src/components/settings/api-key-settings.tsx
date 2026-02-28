"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ApiKeyRecord = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export function ApiKeySettings() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/settings/api-keys");
      if (!res.ok) throw new Error("Failed to load keys");
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    const name = newKeyName.trim() || "API Key";
    setCreating(true);
    setError("");
    setCreatedKey(null);
    try {
      const res = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create key");
      setCreatedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? Any apps using it will stop working.")) return;
    try {
      const res = await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke");
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (createdKey) setCreatedKey(null);
    } catch {
      setError("Failed to revoke key");
    }
  };

  const copyKey = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Create API keys to post and manage updates from scripts or apps. Keys are shown once; store them securely.
      </p>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Create new key */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="key-name" className="block text-xs font-medium text-zinc-500 mb-1">
            Key name
          </label>
          <input
            id="key-name"
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. My script"
            className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            disabled={creating}
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create key
        </button>
      </div>

      {/* Show new key once */}
      {createdKey && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4">
          <p className="text-sm font-medium text-amber-200 mb-2">Your new API key (copy it now):</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200">
              {createdKey}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="flex-shrink-0 rounded p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              title="Copy"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">It won’t be shown again.</p>
        </div>
      )}

      {/* List keys */}
      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading keys…
        </div>
      ) : keys.length === 0 && !createdKey ? (
        <p className="text-sm text-zinc-500">No API keys yet. Create one above.</p>
      ) : (
        <ul className="space-y-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-3"
            >
              <div>
                <span className="font-medium text-white">{k.name}</span>
                <span className="ml-2 font-mono text-sm text-zinc-500">{k.keyPrefix}…</span>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Created {formatDistanceToNow(new Date(k.createdAt), { addSuffix: true })}
                  {k.lastUsedAt && ` · Last used ${formatDistanceToNow(new Date(k.lastUsedAt), { addSuffix: true })}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRevoke(k.id)}
                className="rounded p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                title="Revoke key"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
