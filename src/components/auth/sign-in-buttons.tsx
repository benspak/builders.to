"use client";

import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";

interface SignInButtonsProps {
  className?: string;
  callbackUrl?: string;
}

export function SignInButtons({ className, callbackUrl = "/projects" }: SignInButtonsProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("resend", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to send magic link. Please try again.");
      } else {
        setEmailSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="flex flex-col items-center gap-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-8 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Check your email!</h3>
            <p className="text-sm text-zinc-400">
              We sent a magic link to <span className="text-white font-medium">{email}</span>
            </p>
          </div>
          <p className="text-xs text-zinc-500">
            Click the link in the email to sign in. The link expires in 24 hours.
          </p>
        </div>
        <button
          onClick={() => {
            setEmailSent(false);
            setEmail("");
            setShowEmailForm(false);
          }}
          className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          ← Try a different method
        </button>
      </div>
    );
  }

  if (showEmailForm) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading || !email}
            className="group relative flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 font-semibold text-white transition-all hover:from-orange-600 hover:to-orange-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Sending magic link...</span>
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                <span>Send Magic Link</span>
              </>
            )}
          </button>
        </form>
        <button
          onClick={() => setShowEmailForm(false)}
          className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all options
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <button
        onClick={() => signIn("twitter", { callbackUrl })}
        className="group relative flex items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-900 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/25 border border-zinc-800"
      >
        <XIcon className="h-5 w-5" />
        <span>Continue with X</span>
        <div className="absolute inset-0 rounded-xl ring-2 ring-white/10 ring-inset" />
      </button>
      <button
        onClick={() => signIn("github", { callbackUrl })}
        className="group relative flex items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-900 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/25 border border-zinc-800"
      >
        <GitHubIcon className="h-5 w-5" />
        <span>Continue with GitHub</span>
        <div className="absolute inset-0 rounded-xl ring-2 ring-white/10 ring-inset" />
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-900/50 px-2 text-zinc-500">or</span>
        </div>
      </div>

      <button
        onClick={() => setShowEmailForm(true)}
        className="group relative flex items-center justify-center gap-3 rounded-xl bg-zinc-900 px-6 py-4 font-semibold text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] border border-zinc-700"
      >
        <Mail className="h-5 w-5" />
        <span>Continue with Email</span>
        <div className="absolute inset-0 rounded-xl ring-1 ring-white/5 ring-inset" />
      </button>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
