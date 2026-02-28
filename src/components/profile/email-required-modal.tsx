"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, Sparkles, Shield, Bell, CheckCircle2, ArrowLeft } from "lucide-react";

interface EmailRequiredModalProps {
  userId: string;
  onComplete: () => void;
  /** If true, show verification pending state for this email */
  pendingVerificationEmail?: string | null;
  /** When true, show "Development: skip verification" (only when EMAIL_DEV_MODE=true) */
  devBypassAvailable?: boolean;
}

type ModalStep = "enter_email" | "verification_sent" | "resend";

export function EmailRequiredModal({ 
  userId, 
  onComplete,
  pendingVerificationEmail,
  devBypassAvailable = false,
}: EmailRequiredModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState(pendingVerificationEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<ModalStep>(
    pendingVerificationEmail ? "verification_sent" : "enter_email"
  );
  const [resendCooldown, setResendCooldown] = useState(0);
  const [skipLoading, setSkipLoading] = useState(false);

  // Prevent escape key from closing the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendVerificationEmail = async (emailToVerify: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/email/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send verification email");
      }

      setStep("verification_sent");
      setResendCooldown(60); // 60 second cooldown before resend
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    await sendVerificationEmail(email);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await sendVerificationEmail(email);
  };

  const handleChangeEmail = () => {
    setStep("enter_email");
    setError("");
  };

  const handleDevSkip = async () => {
    if (!devBypassAvailable || !email) return;
    setSkipLoading(true);
    setError("");
    try {
      const response = await fetch("/api/email/verify/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to skip verification");
      }
      onComplete();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSkipLoading(false);
    }
  };

  // Check if email has been verified (poll for verification status)
  useEffect(() => {
    if (step !== "verification_sent") return;

    const checkVerification = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const user = await response.json();
          if (user.email === email && user.emailVerified) {
            onComplete();
            router.refresh();
          }
        }
      } catch {
        // Silently fail - we'll check again
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [step, email, userId, onComplete, router]);

  return (
    // Modal backdrop - no onClick handler to prevent dismissal by clicking outside
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
        {step === "enter_email" ? (
          <>
            {/* Header with icon */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verify Your Email ✨
              </h2>
              <p className="text-zinc-400">
                Add and verify your email to unlock the full Builders.to experience
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Bell className="h-4 w-4 text-emerald-400" />
                </div>
                <span>Get notified when builders interact with your content</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <span>Weekly digest of your milestones and celebrations</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Shield className="h-4 w-4 text-cyan-400" />
                </div>
                <span>Secure your account and enable two-factor auth</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-3 px-4 font-semibold text-white hover:from-orange-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending verification...
                  </>
                ) : (
                  <>
                    Send Verification Email
                    <Mail className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-center text-zinc-500 mt-4">
                Your email is private and will never be displayed publicly.
                <br />
                You can unsubscribe from emails anytime in settings.
              </p>
            </form>
          </>
        ) : (
          <>
            {/* Verification Sent State */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-4">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Check Your Inbox 📬
              </h2>
              <p className="text-zinc-400">
                We sent a verification link to
              </p>
              <p className="text-emerald-400 font-medium mt-1">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4">
                <p className="text-sm text-zinc-300 text-center">
                  Click the link in the email to verify your address.
                  <br />
                  <span className="text-zinc-500">This page will update automatically once verified.</span>
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 px-4 font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={handleChangeEmail}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-medium text-zinc-500 hover:text-zinc-300 focus:outline-none transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Use a different email
              </button>

              {devBypassAvailable && (
                <button
                  type="button"
                  onClick={handleDevSkip}
                  disabled={skipLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 px-4 font-medium text-amber-400 hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 transition-all"
                >
                  {skipLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Development: skip verification"
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-center text-zinc-500 mt-6">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
