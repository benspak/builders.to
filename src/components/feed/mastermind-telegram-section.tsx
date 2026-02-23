"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Loader2, ExternalLink } from "lucide-react";

const MASTERMIND_SLACK_INVITE_URL = "https://join.slack.com/t/buildersto-mastermind/shared_invite/zt-3qdfqmuhu-TKxv5fHttfQ5nJooGrJLYw";

export function MastermindTelegramSection() {
  const [status, setStatus] = useState<"loading" | "subscribed" | "not-subscribed" | "signed-out">("loading");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mastermind/subscribe")
      .then((res) => res.json())
      .then((data) => {
        if (data.error && data.error === "Not signed in") {
          setStatus("signed-out");
          return;
        }
        setStatus(data.isActive ? "subscribed" : "not-subscribed");
      })
      .catch(() => setStatus("not-subscribed"));
  }, []);

  const handleJoin = async () => {
    setCheckoutLoading(true);
    setJoinError(null);
    try {
      const res = await fetch("/api/mastermind/subscribe", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setJoinError(data.error || "Something went wrong. Please try again.");
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="rounded-xl border border-violet-500/30 bg-zinc-900/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/20 bg-violet-500/5">
          <MessageCircle className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-violet-400">Mastermind</span>
        </div>
        <div className="p-4 flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
        </div>
      </div>
    );
  }

  if (status === "subscribed") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-emerald-500/10">
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Mastermind</span>
        </div>
        <div className="p-4">
          <p className="text-sm text-zinc-300 mb-3">
            You have access to the private Slack workspace. Join the conversation with fellow builders.
          </p>
          <a
            href={MASTERMIND_SLACK_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            Open Slack Workspace
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className="rounded-xl border border-violet-500/30 bg-zinc-900/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/20 bg-violet-500/5">
          <MessageCircle className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-violet-400">Mastermind</span>
        </div>
        <div className="p-4">
          <p className="text-sm text-zinc-300 mb-3">
            Join the private Builders.to Mastermind Slack workspace. Get feedback, accountability, and connect with serious builders.
          </p>
          <Link
            href="/sign-in?callbackUrl=/feed"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-2.5 text-sm font-medium text-white hover:from-violet-600 hover:to-purple-600 transition-all"
          >
            Sign in to join
          </Link>
        </div>
      </div>
    );
  }

  // not-subscribed
  return (
    <div className="rounded-xl border border-violet-500/30 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/20 bg-violet-500/5">
        <MessageCircle className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-medium text-violet-400">Mastermind</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-zinc-300 mb-3">
          Join the private Builders.to Mastermind Slack workspace. Get feedback, accountability, and connect with serious builders—$9/month.
        </p>
        <button
          type="button"
          onClick={handleJoin}
          disabled={checkoutLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-2.5 text-sm font-medium text-white hover:from-violet-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              Join for $9/month
              <ExternalLink className="h-4 w-4" />
            </>
          )}
        </button>
        {joinError && (
          <p className="mt-2 text-xs text-amber-400">{joinError}</p>
        )}
      </div>
    </div>
  );
}
