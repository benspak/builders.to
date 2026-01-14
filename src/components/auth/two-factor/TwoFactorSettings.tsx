"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, ShieldCheck, ShieldOff, RefreshCw, KeyRound, Loader2 } from "lucide-react";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { TwoFactorDisable } from "./TwoFactorDisable";

type View = "status" | "setup" | "disable" | "regenerate";

interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

interface RegenerateBackupCodesProps {
  onComplete: (codes: string[]) => void;
  onCancel: () => void;
}

function RegenerateBackupCodes({ onComplete, onCancel }: RegenerateBackupCodesProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/2fa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate backup codes");
      }

      onComplete(data.backupCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate backup codes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Regenerate Backup Codes</h3>
        <p className="text-sm text-zinc-400">
          Enter your current 2FA code to generate new backup codes. Your old codes will be invalidated.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="regenerateCode" className="block text-sm font-medium text-zinc-300 mb-2">
            Enter your 6-digit 2FA code
          </label>
          <input
            id="regenerateCode"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
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
            disabled={code.length !== 6 || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Generate New Codes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ShowNewBackupCodesProps {
  codes: string[];
  onDone: () => void;
}

function ShowNewBackupCodes({ codes, onDone }: ShowNewBackupCodesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const codesText = codes.join("\n");
    await navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">New Backup Codes</h3>
        <p className="text-sm text-zinc-400">
          Your old backup codes have been invalidated. Save these new codes somewhere safe.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <div className="grid grid-cols-2 gap-2">
          {codes.map((code, index) => (
            <code
              key={index}
              className="text-sm font-mono text-zinc-300 bg-zinc-800/50 px-3 py-2 rounded"
            >
              {code}
            </code>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          {copied ? "Copied!" : "Copy all codes"}
        </button>
      </div>

      <button
        onClick={onDone}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
      >
        I&apos;ve saved my backup codes
      </button>
    </div>
  );
}

export function TwoFactorSettings() {
  const [view, setView] = useState<View>("status");
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/2fa/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSetupComplete = () => {
    fetchStatus();
    setView("status");
  };

  const handleDisableComplete = () => {
    fetchStatus();
    setView("status");
  };

  const handleRegenerateComplete = (codes: string[]) => {
    setNewBackupCodes(codes);
  };

  const handleNewCodesDone = () => {
    setNewBackupCodes(null);
    fetchStatus();
    setView("status");
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
        <Shield className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
      </div>

      {view === "status" && status && (
        <div className="space-y-6">
          {status.enabled ? (
            <>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">2FA is enabled</p>
                  <p className="text-sm text-zinc-400">
                    Your account is protected with two-factor authentication.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <KeyRound className="h-5 w-5 text-zinc-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-300">Backup Codes</p>
                  <p className="text-sm text-zinc-400">
                    {status.backupCodesRemaining} codes remaining
                  </p>
                </div>
                <button
                  onClick={() => setView("regenerate")}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
              </div>

              <button
                onClick={() => setView("disable")}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <ShieldOff className="h-4 w-4" />
                Disable two-factor authentication
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Shield className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-amber-400">2FA is not enabled</p>
                  <p className="text-sm text-zinc-400">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setView("setup")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
              >
                <Shield className="h-4 w-4" />
                Enable Two-Factor Authentication
              </button>
            </>
          )}
        </div>
      )}

      {view === "setup" && <TwoFactorSetup onComplete={handleSetupComplete} />}

      {view === "disable" && (
        <TwoFactorDisable onComplete={handleDisableComplete} onCancel={() => setView("status")} />
      )}

      {view === "regenerate" && !newBackupCodes && (
        <RegenerateBackupCodes
          onComplete={handleRegenerateComplete}
          onCancel={() => setView("status")}
        />
      )}

      {view === "regenerate" && newBackupCodes && (
        <ShowNewBackupCodes codes={newBackupCodes} onDone={handleNewCodesDone} />
      )}
    </div>
  );
}
