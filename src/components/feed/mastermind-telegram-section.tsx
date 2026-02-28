"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Loader2, ExternalLink } from "lucide-react";

const MASTERMIND_SLACK_INVITE_URL = "https://join.slack.com/t/buildersto/shared_invite/zt-3qdfqmuhu-TKxv5fHttfQ5nJooGrJLYw";

export function MastermindTelegramSection() {
  const [status, setStatus] = useState<"loading" | "pro" | "not-pro" | "signed-out">("loading");

  useEffect(() => {
    fetch("/api/pro/subscribe")
      .then((res) => {
        if (res.status === 401) {
          setStatus("signed-out");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data == null) return;
        setStatus(data.isPro ? "pro" : "not-pro");
      })
      .catch(() => setStatus("not-pro"));
  }, []);

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

  if (status === "pro") {
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
            Join the private Builders.to Mastermind Slack workspace. Get feedback, accountability, and connect with serious builders. Included with Pro membership.
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

  // not-pro (signed in, no Pro)
  return (
    <div className="rounded-xl border border-violet-500/30 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/20 bg-violet-500/5">
        <MessageCircle className="h-4 w-4 text-violet-400" />
        <span className="text-sm font-medium text-violet-400">Mastermind</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-zinc-300 mb-3">
          Join the private Builders.to Mastermind Slack workspace. Get feedback, accountability, and connect with serious builders. Included with Pro membership.
        </p>
        <Link
          href="/settings"
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-2.5 text-sm font-medium text-white hover:from-violet-600 hover:to-purple-600 transition-all"
        >
          Upgrade to Pro for access
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
