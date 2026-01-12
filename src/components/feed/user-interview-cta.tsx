"use client";

import { MessageCircle, Calendar, ArrowRight, Sparkles } from "lucide-react";

export function UserInterviewCTA() {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-zinc-900/50 to-zinc-900/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-transparent">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/25">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Share Your Voice</h3>
          <p className="text-[10px] text-cyan-400/70">Help shape Builders.to</p>
        </div>
        <Sparkles className="h-3.5 w-3.5 text-cyan-400/50 ml-auto" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
            <Calendar className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-white">
              User Interview
            </h4>
            <p className="text-xs text-zinc-400">15-minute chat</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          We&apos;d love to hear from you! Share your experience and help us make Builders.to even better.
        </p>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            🎁 Free
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
            ⏱️ 15 min
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <a
        href="https://tidycal.com/team/builiders/user-interview"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 hover:from-cyan-500/20 hover:to-teal-500/20 border-t border-cyan-500/20 transition-all"
      >
        Book a Chat
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}
