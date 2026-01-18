import Link from "next/link";
import type { Metadata } from "next";
import {
  Eye,
  Users,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  ArrowRight,
  Globe,
  Share2,
  Megaphone,
  Sparkles,
  Zap,
  MessageCircle,
  Calendar,
  BarChart3,
  Heart,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Trophy,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Build in Public: The Complete 2026 Guide - Builders.to",
  description: "Learn how to build in public effectively. A comprehensive guide for indie hackers covering daily updates, transparency marketing, and growing an audience while building your product.",
  keywords: ["build in public", "building in public", "indie hacker marketing", "transparency marketing", "startup marketing", "build in public guide"],
};

export default function BuildInPublicPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/articles"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            Articles
          </Link>
          <span className="text-zinc-600">/</span>
          <Link
            href="/growth-hacks"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            Growth Hacks
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">Build in Public</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/25">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">How to Build in Public</h1>
              <p className="text-zinc-400 mt-1">The Complete 2026 Guide for Indie Hackers</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              12 min read
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Growth Strategy
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              For Indie Hackers
            </span>
          </div>
        </div>

        {/* Hook Section */}
        <div className="mb-12 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-8">
          <p className="text-lg text-zinc-200 leading-relaxed">
            The most successful indie hackers of the last decade have one thing in common: they built in public.
            From Pieter Levels to Jon Yongfook, transparency became their unfair advantage.
          </p>
          <p className="mt-4 text-emerald-400 font-semibold">
            This guide will show you exactly how to do it—without feeling like a fraud or oversharing.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            In this guide
          </h2>
          <nav className="space-y-2">
            {[
              { href: "#what-is-bip", label: "What is Building in Public?" },
              { href: "#why-it-works", label: "Why It Works (The Psychology)" },
              { href: "#what-to-share", label: "What to Share vs. Keep Private" },
              { href: "#daily-updates", label: "The Daily Update Framework" },
              { href: "#platforms", label: "Best Platforms for Building in Public" },
              { href: "#mistakes", label: "Common Mistakes to Avoid" },
              { href: "#examples", label: "Real Examples from Successful Builders" },
              { href: "#getting-started", label: "Getting Started Today" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-orange-400 transition-colors"
              >
                <ArrowRight className="h-3 w-3" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-12 text-zinc-300">

            {/* What is Building in Public */}
            <section id="what-is-bip">
              <h2 className="text-2xl font-semibold text-white mb-6">What is Building in Public?</h2>

              <div className="space-y-4 leading-relaxed">
                <p>
                  <span className="text-emerald-400 font-semibold">Building in public</span> is the practice of
                  openly sharing your journey as you create a product, company, or project. Instead of working
                  in stealth mode and revealing a finished product, you share:
                </p>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 my-6">
                  <ul className="space-y-3 text-zinc-300">
                    <li className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span><strong className="text-white">Revenue numbers</strong> — MRR, ARR, growth rates</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span><strong className="text-white">User metrics</strong> — signups, active users, churn</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span><strong className="text-white">Decisions and reasoning</strong> — why you built X, why you pivoted</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span><strong className="text-white">Failures and setbacks</strong> — what went wrong and lessons learned</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span><strong className="text-white">Daily progress</strong> — what you shipped today</span>
                    </li>
                  </ul>
                </div>

                <p>
                  Think of it as <span className="text-white font-medium">reality TV for startups</span>.
                  People follow along not just for the information, but for the story. They become invested
                  in your success because they&apos;ve watched you struggle and grow.
                </p>
              </div>
            </section>

            {/* Why It Works */}
            <section id="why-it-works">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Why It Works (The Psychology)</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Building in public taps into several powerful psychological principles:
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Heart className="h-6 w-6 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">The IKEA Effect</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        When people watch you build something, they feel ownership over it. They&apos;ve
                        &quot;helped&quot; by following along, giving feedback, or just rooting for you.
                        This makes them more likely to buy, recommend, and defend your product.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Users className="h-6 w-6 text-cyan-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Parasocial Relationships</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        By sharing regularly, followers feel like they know you personally. This one-sided
                        relationship creates loyalty that traditional marketing can&apos;t buy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Eye className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Accountability & Motivation</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        When you commit publicly, you&apos;re more likely to follow through.
                        The audience becomes your accountability partner.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Share2 className="h-6 w-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Built-in Marketing</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Every update is content. Every milestone is news. You&apos;re marketing your
                        product while building it—not as an afterthought.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">3x</div>
                  <div className="text-xs text-zinc-400">Higher engagement</div>
                </div>
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-center">
                  <Users className="h-6 w-6 text-violet-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Free</div>
                  <div className="text-xs text-zinc-400">Customer acquisition</div>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                  <Heart className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Loyal</div>
                  <div className="text-xs text-zinc-400">Customer base</div>
                </div>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center">
                  <Zap className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Fast</div>
                  <div className="text-xs text-zinc-400">Feedback loops</div>
                </div>
              </div>
            </section>

            {/* What to Share vs Keep Private */}
            <section id="what-to-share">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <Target className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">What to Share vs. Keep Private</h2>
              </div>

              <p className="leading-relaxed mb-6">
                The biggest fear with building in public is oversharing. Here&apos;s a framework to decide what to share:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Share Column */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                  <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Safe to Share
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Revenue numbers (MRR, growth %)</li>
                    <li>• User/customer counts</li>
                    <li>• Features you&apos;re building</li>
                    <li>• Decisions and why you made them</li>
                    <li>• Mistakes and lessons learned</li>
                    <li>• Tech stack and tools</li>
                    <li>• Marketing experiments</li>
                    <li>• Conversion rates</li>
                    <li>• Your daily/weekly wins</li>
                    <li>• Roadmap and goals</li>
                  </ul>
                </div>

                {/* Keep Private Column */}
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6">
                  <h4 className="font-semibold text-rose-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Keep Private
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Specific customer names (without permission)</li>
                    <li>• Proprietary algorithms or code</li>
                    <li>• Unannounced partnerships</li>
                    <li>• Personal financial details</li>
                    <li>• Team salary information</li>
                    <li>• Investor negotiations in progress</li>
                    <li>• Customer support conversations</li>
                    <li>• Security vulnerabilities</li>
                    <li>• Legal issues</li>
                    <li>• Employee performance</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-amber-300 text-sm">
                  <strong>Rule of thumb:</strong> If sharing it could hurt a customer, team member, or
                  give competitors an unfair advantage, keep it private. Everything else? Share away.
                </p>
              </div>
            </section>

            {/* Daily Update Framework */}
            <section id="daily-updates">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <Calendar className="h-5 w-5 text-orange-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">The Daily Update Framework</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Consistency is key to building in public. Here&apos;s a framework for sharing daily updates
                that keeps your audience engaged without burning you out:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-white">What I Shipped</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Lead with what you accomplished. Features, fixes, content—anything tangible.
                      Screenshots and demos work best.
                    </p>
                    <div className="mt-2 text-xs text-zinc-500 italic">
                      Example: &quot;Shipped dark mode today! Took 3 hours but worth it.&quot;
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-white">Key Metrics</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Share one relevant number. Revenue, users, conversion rate—pick what matters today.
                    </p>
                    <div className="mt-2 text-xs text-zinc-500 italic">
                      Example: &quot;Hit 100 users this week. Growing 15% week-over-week.&quot;
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-white">Challenge or Learning</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Share something you struggled with or learned. This humanizes you and invites engagement.
                    </p>
                    <div className="mt-2 text-xs text-zinc-500 italic">
                      Example: &quot;Spent 2 hours debugging a cache issue. Lesson: always clear cache in staging first.&quot;
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold text-white">What&apos;s Next</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      End with tomorrow&apos;s focus. Creates anticipation and accountability.
                    </p>
                    <div className="mt-2 text-xs text-zinc-500 italic">
                      Example: &quot;Tomorrow: launching the beta waitlist page!&quot;
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-6">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                  Pro Tip: Build Streaks
                </h4>
                <p className="text-zinc-300 text-sm">
                  Platforms like Builders.to track your posting streaks. A 30-day streak becomes content
                  itself: &quot;Just hit 30 consecutive days of shipping!&quot; People love following streak builders.
                </p>
              </div>
            </section>

            {/* Platforms */}
            <section id="platforms">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                  <Globe className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Best Platforms for Building in Public</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-orange-500/30 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shrink-0">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Builders.to</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Purpose-built for indie hackers. Daily updates feed, milestone tracking, streak system,
                        and a community that actually cares about your journey. Your updates get seen by other builders.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">Recommended</span>
                        <span className="text-xs text-zinc-500">Best for: Dedicated build logs</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">X (Twitter)</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        The original home of #buildinpublic. Great for reach and connecting with other
                        founders. Threads work well for longer updates.
                      </p>
                      <div className="mt-2 text-xs text-zinc-500">Best for: Reach & networking</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Personal Blog / Newsletter</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Long-form content you own. Weekly or monthly deep dives work best here.
                        Great for SEO and building email list.
                      </p>
                      <div className="mt-2 text-xs text-zinc-500">Best for: SEO & owned audience</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-purple-600 shrink-0">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">YouTube</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Video build logs have massive engagement potential. Weekly vlogs showing your
                        screen, face, and process. High effort, high reward.
                      </p>
                      <div className="mt-2 text-xs text-zinc-500">Best for: Deep engagement & tutorials</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                <p className="text-cyan-300 text-sm">
                  <strong>Multi-platform strategy:</strong> Post daily on Builders.to (your home base),
                  share highlights on X for reach, and write monthly deep-dives on your blog for SEO.
                </p>
              </div>
            </section>

            {/* Common Mistakes */}
            <section id="mistakes">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Common Mistakes to Avoid</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">1. Only Sharing Wins</h4>
                  <p className="text-sm text-zinc-400">
                    If every update is &quot;we hit a new milestone!&quot; people will tune out or stop believing you.
                    Share the struggles too—they&apos;re often more valuable and relatable.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">2. Being Inconsistent</h4>
                  <p className="text-sm text-zinc-400">
                    Posting daily for a week, then disappearing for a month kills momentum.
                    Better to post 3x per week consistently than daily for a burst.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">3. Treating It Like Marketing Copy</h4>
                  <p className="text-sm text-zinc-400">
                    &quot;Excited to announce...&quot; language feels fake. Be real. &quot;Shipped X today.
                    Took longer than expected but learned Y.&quot;
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">4. No Call to Action</h4>
                  <p className="text-sm text-zinc-400">
                    Building in public should drive business outcomes. Occasionally ask for feedback,
                    beta testers, or point to your waitlist. Don&apos;t be shy.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">5. Comparing to Others</h4>
                  <p className="text-sm text-zinc-400">
                    Someone else hit $10k MRR in 3 months? Good for them. Your journey is yours.
                    Comparison kills consistency.
                  </p>
                </div>
              </div>
            </section>

            {/* Real Examples */}
            <section id="examples">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Trophy className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Real Examples from Successful Builders</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white">Pieter Levels (@levelsio)</h4>
                  <p className="text-sm text-zinc-400 mt-2">
                    Built Nomad List and Remote OK while sharing everything publicly. His transparency
                    about revenue ($2.7M/year) and approach inspired thousands of indie hackers.
                  </p>
                  <p className="text-xs text-emerald-400 mt-2">Key tactic: Revenue transparency + contrarian opinions</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white">Jon Yongfook (@yongfook)</h4>
                  <p className="text-sm text-zinc-400 mt-2">
                    Documented building Bannerbear from $0 to acquisition. Monthly transparency reports
                    and honest reflection on what worked.
                  </p>
                  <p className="text-xs text-emerald-400 mt-2">Key tactic: Monthly detailed reports + focus on one product</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white">Tony Dinh (@tdinh_me)</h4>
                  <p className="text-sm text-zinc-400 mt-2">
                    Left his job and built multiple products publicly. Regular updates on X with
                    exact revenue numbers and genuine reflection.
                  </p>
                  <p className="text-xs text-emerald-400 mt-2">Key tactic: Relatable journey + multiple product experiments</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>Common thread:</strong> All of them share real numbers, admit failures,
                  and maintain consistency over years—not weeks.
                </p>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Getting Started Today</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Ready to start building in public? Here&apos;s your action plan:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-white">Create Your Builders.to Profile</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Set up your profile with your current project. The milestone tracking and
                      daily updates feed make it easy to maintain consistency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-white">Post Your First Update</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Right now. Share what you&apos;re working on today. It doesn&apos;t have to be perfect.
                      The first update is always the hardest.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-white">Set a Streak Goal</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Commit to 7 days of updates. Then 14. Then 30. The streak gamification
                      helps maintain consistency when motivation fades.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold text-white">Engage with Other Builders</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Comment on other builders&apos; updates. Build relationships. The community
                      aspect is what makes building in public sustainable.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Start Building in Public Today</h3>
              <p className="text-zinc-300 mb-6 max-w-lg mx-auto">
                Join thousands of indie hackers sharing their journey on Builders.to.
                Track your progress, connect with builders, and grow your audience.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 font-semibold text-white transition-all hover:from-emerald-600 hover:to-cyan-700"
                >
                  <Rocket className="h-4 w-4" />
                  Get Started Free
                </Link>
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  <Eye className="h-4 w-4" />
                  See the Feed
                </Link>
              </div>
            </section>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between">
          <Link
            href="/growth-hacks"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
          >
            ← Back to Growth Hacks
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
