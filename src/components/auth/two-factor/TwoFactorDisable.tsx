"use client";

import { useState } from "react";
import { ShieldOff, Loader2, AlertTriangle } from "lucide-react";

interface TwoFactorDisableProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function TwoFactorDisable({ onComplete, onCancel }: TwoFactorDisableProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to disable 2FA");
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-400">Warning: Disabling 2FA reduces security</p>
          <p className="text-sm text-zinc-400 mt-1">
            Without two-factor authentication, your account will only be protected by your
            login method. We recommend keeping 2FA enabled for maximum security.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="disableCode" className="block text-sm font-medium text-zinc-300 mb-2">
            Enter your 2FA code or a backup code to confirm
          </label>
          <input
            id="disableCode"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9A-Za-z-]/g, "").toUpperCase())}
            placeholder="000000 or XXXX-XXXX"
            className="w-full px-4 py-3 text-center text-xl font-mono tracking-wider bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={code.length < 6 || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Disabling...
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" />
                Disable 2FA
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
