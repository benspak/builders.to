"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export function EmailOptIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Subscribed!</span>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-zinc-300">
            You're on the list. We'll keep you in the loop with builder updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-500/30 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-orange-500/20 bg-orange-500/5">
        <Mail className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-medium text-orange-400">Stay in the Loop</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-zinc-300 mb-3">
          Get the latest builder updates, launches, and community news delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/25 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 text-sm font-medium text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                Subscribe
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
        {status === "error" && (
          <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
        )}
        <p className="mt-2 text-xs text-zinc-500">No spam, unsubscribe anytime.</p>
      </div>
    </div>
  );
}
