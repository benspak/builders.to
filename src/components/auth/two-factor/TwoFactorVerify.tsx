"use client";

import { useState } from "react";
import { Shield, Loader2, KeyRound } from "lucide-react";

interface TwoFactorVerifyProps {
  userId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function TwoFactorVerify({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBackupInput, setShowBackupInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/2fa/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid verification code");
      }

      if (data.usedBackupCode) {
        // Show a warning about backup code usage
        console.log(`Used backup code. ${data.remainingBackupCodes} codes remaining.`);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
          <Shield className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-white">Two-Factor Authentication</h2>
        <p className="text-sm text-zinc-400 mt-2">
          {showBackupInput
            ? "Enter one of your backup codes"
            : "Enter the 6-digit code from your authenticator app"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showBackupInput ? (
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            maxLength={9}
            className="w-full px-4 py-3 text-center text-xl font-mono tracking-wider bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
          />
        ) : (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            maxLength={6}
            autoFocus
            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
          />
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={(!showBackupInput && code.length !== 6) || (showBackupInput && code.length < 8) || isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setShowBackupInput(!showBackupInput);
            setCode("");
            setError("");
          }}
          className="text-sm text-zinc-500 hover:text-zinc-400 flex items-center justify-center gap-2 mx-auto"
        >
          <KeyRound className="h-4 w-4" />
          {showBackupInput ? "Use authenticator app" : "Use a backup code instead"}
        </button>
      </div>

      {onCancel && (
        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="text-sm text-zinc-500 hover:text-zinc-400"
          >
            Cancel and sign out
          </button>
        </div>
      )}
    </div>
  );
}
