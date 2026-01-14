"use client";

import { useState } from "react";
import { Shield, Copy, Check, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";

interface BackupCodesDisplayProps {
  codes: string[];
  onContinue: () => void;
}

function BackupCodesDisplay({ codes, onContinue }: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const codesText = codes.join("\n");
    await navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-500">Save your backup codes</p>
          <p className="text-sm text-zinc-400 mt-1">
            These codes can be used to access your account if you lose your authenticator app.
            Each code can only be used once. Store them somewhere safe.
          </p>
        </div>
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
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy all codes
            </>
          )}
        </button>
      </div>

      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
      >
        I&apos;ve saved my backup codes
      </button>
    </div>
  );
}

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"intro" | "qr" | "verify" | "backup">("intro");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set up 2FA");
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set up 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      setStep("backup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (step === "intro") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Enable Two-Factor Authentication</h3>
            <p className="text-sm text-zinc-400">Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            Two-factor authentication adds an extra layer of security by requiring a code from
            your authenticator app in addition to your password.
          </p>
          <p>You&apos;ll need an authenticator app like:</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-300">
            <li>Google Authenticator</li>
            <li>Authy</li>
            <li>1Password</li>
            <li>Microsoft Authenticator</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleStartSetup}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Set up 2FA
            </>
          )}
        </button>
      </div>
    );
  }

  if (step === "qr") {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Scan QR Code</h3>
          <p className="text-sm text-zinc-400">
            Open your authenticator app and scan this QR code to add your account.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Can&apos;t scan? Enter this code manually:</p>
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="text-sm text-zinc-500 hover:text-zinc-400 flex items-center gap-1"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSecret ? "Hide" : "Show"}
            </button>
          </div>
          {showSecret && (
            <code className="block w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-mono text-zinc-300 break-all">
              {secret}
            </code>
          )}
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-zinc-300 mb-2">
              Enter the 6-digit code from your app
            </label>
            <input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={verificationCode.length !== 6 || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Enable 2FA"
            )}
          </button>
        </form>
      </div>
    );
  }

  if (step === "backup") {
    return <BackupCodesDisplay codes={backupCodes} onContinue={handleComplete} />;
  }

  return null;
}
