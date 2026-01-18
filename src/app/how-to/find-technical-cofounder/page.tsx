import Link from "next/link";
import type { Metadata } from "next";
import {
  Users,
  Code,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  MessageCircle,
  Handshake,
  Search,
  Lightbulb,
  DollarSign,
  Shield,
  FileText,
  Heart,
  Zap,
  XCircle,
  Star,
  MapPin,
  Globe,
  Coffee,
  Rocket,
  Eye,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Find a Technical Co-founder (Without Getting Scammed) - Builders.to",
  description: "A comprehensive guide for non-technical founders on finding the right technical co-founder. Learn where to look, red flags to avoid, and how to structure equity fairly.",
  keywords: ["find technical co-founder", "looking for cofounder", "startup cofounder matching", "non technical founder", "find developer cofounder"],
};

export default function FindTechnicalCofounderPage() {
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
            href="/how-to"
            className="text-orange-500 hover:text-orange-400 transition-colors"
          >
            How To
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">Find a Technical Co-founder</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Find a Technical Co-founder</h1>
              <p className="text-zinc-400 mt-1">Without Getting Scammed</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              12 min read
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              For Non-Technical Founders
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Scam Prevention
            </span>
          </div>
        </div>

        {/* Hook Section */}
        <div className="mb-12 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-8">
          <p className="text-lg text-zinc-200 leading-relaxed">
            You have the idea, the market knowledge, and the business skills. What you don&apos;t have is
            the technical ability to build it. Sound familiar?
          </p>
          <p className="mt-4 text-cyan-400 font-semibold">
            This guide will help you find a technical co-founder who&apos;s the real deal—and avoid the
            charlatans who will waste your time and equity.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            In this guide
          </h2>
          <nav className="space-y-2">
            {[
              { href: "#do-you-need", label: "Do You Actually Need a Co-founder?" },
              { href: "#what-to-look-for", label: "What to Look For in a Technical Co-founder" },
              { href: "#red-flags", label: "Red Flags to Watch Out For" },
              { href: "#where-to-find", label: "Where to Find Technical Co-founders" },
              { href: "#how-to-pitch", label: "How to Pitch Your Idea to Developers" },
              { href: "#equity-splits", label: "Equity Splits & Agreements" },
              { href: "#vesting", label: "Vesting Schedules (Critical!)" },
              { href: "#first-meeting", label: "The First Meeting Checklist" },
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

            {/* Do You Actually Need a Co-founder? */}
            <section id="do-you-need">
              <h2 className="text-2xl font-semibold text-white mb-6">Do You Actually Need a Co-founder?</h2>

              <p className="leading-relaxed mb-6">
                Before searching for a co-founder, ask yourself if you truly need one.
                A co-founder is a <span className="text-cyan-400 font-medium">marriage-level commitment</span>.
                You&apos;ll spend years working together through stress and uncertainty.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* When You DO Need */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                  <h4 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    You Need a Co-founder If...
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• Your product requires deep technical expertise</li>
                    <li>• You&apos;re building for the long haul (5+ years)</li>
                    <li>• You want a true partner, not an employee</li>
                    <li>• Technical decisions will make or break the business</li>
                    <li>• You&apos;re raising venture capital</li>
                  </ul>
                </div>

                {/* When You DON&apos;T Need */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
                  <h4 className="font-semibold text-amber-400 mb-4 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Consider Alternatives If...
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li>• You can build an MVP with no-code tools</li>
                    <li>• You have budget to hire a freelancer</li>
                    <li>• The tech is straightforward (CRUD app)</li>
                    <li>• You can learn to code yourself</li>
                    <li>• You&apos;re bootstrapping a small business</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                <p className="text-cyan-300 text-sm">
                  <strong>Alternative to co-founder:</strong> Start with a freelancer or agency to build
                  your MVP. Once you have traction, you&apos;ll be in a much stronger position to attract
                  a technical co-founder (and give up less equity).
                </p>
              </div>
            </section>

            {/* What to Look For */}
            <section id="what-to-look-for">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Star className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">What to Look For in a Technical Co-founder</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Technical skill is table stakes. Here&apos;s what separates great co-founders from mediocre ones:
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Code className="h-6 w-6 text-cyan-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Shipping Track Record</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Have they actually launched products? Side projects, open source, past startups—
                        look for evidence they can finish things, not just start them.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Zap className="h-6 w-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Speed Over Perfection</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Startup engineers need to ship fast and iterate. Avoid developers who want to
                        build &quot;the right way&quot; for months before launching.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <MessageCircle className="h-6 w-6 text-violet-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Communication Skills</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Can they explain technical concepts simply? Do they listen before suggesting solutions?
                        You&apos;ll work together for years—communication is everything.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Heart className="h-6 w-6 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Problem Passion (Not Solution Passion)</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        They should care about the problem you&apos;re solving, not just the technology.
                        &quot;I want to use AI&quot; is a red flag. &quot;I hate how [problem] works&quot; is good.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Business Awareness</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        The best technical co-founders understand that code serves business goals.
                        They ask about customers, revenue, and metrics—not just features.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Handshake className="h-6 w-6 text-blue-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Complementary Skills</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        If you&apos;re business-focused, find someone deeply technical. Two business people
                        or two engineers rarely work as co-founders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Red Flags */}
            <section id="red-flags">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Red Flags to Watch Out For</h2>
              </div>

              <p className="leading-relaxed mb-6">
                These warning signs indicate someone who will waste your time, take your equity, or
                disappear when things get hard:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">🚩 &quot;I need to see the full idea first&quot;</h4>
                  <p className="text-sm text-zinc-400">
                    Legitimate developers evaluate the team and problem, not just the idea.
                    Ideas are worthless—execution matters. If they&apos;re fishing for ideas to steal, run.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">🚩 No GitHub, No Portfolio, No References</h4>
                  <p className="text-sm text-zinc-400">
                    Real developers have evidence of their work. No portfolio after years of &quot;experience&quot;
                    is a massive red flag.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">🚩 Wants Equity Upfront for &quot;Advising&quot;</h4>
                  <p className="text-sm text-zinc-400">
                    A co-founder earns equity by working full-time. Asking for significant equity for
                    part-time &quot;advising&quot; or &quot;when I have time&quot; is a scam.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">🚩 Can&apos;t Explain Previous Project Failures</h4>
                  <p className="text-sm text-zinc-400">
                    Everyone fails. But if they blame teammates, bad luck, or the market for everything—
                    they&apos;ll do the same with your startup.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">🚩 Wants to &quot;Build It Properly&quot; for 6+ Months</h4>
                  <p className="text-sm text-zinc-400">
                    If their timeline for MVP is 6 months+, they don&apos;t understand startups.
                    You need someone who can ship in weeks, not quarters.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">🚩 Won&apos;t Sign a Vesting Agreement</h4>
                  <p className="text-sm text-zinc-400">
                    Refusing vesting means they plan to take equity and leave. No legitimate co-founder
                    objects to standard vesting. This is non-negotiable.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">🚩 &quot;I&apos;ll Start After [Event]&quot;</h4>
                  <p className="text-sm text-zinc-400">
                    After their current job ends, after the holidays, after they finish their course...
                    People who want to start, start. The rest make excuses.
                  </p>
                </div>
              </div>
            </section>

            {/* Where to Find */}
            <section id="where-to-find">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                  <Search className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Where to Find Technical Co-founders</h2>
              </div>

              <p className="leading-relaxed mb-6">
                The best co-founders rarely come from cold outreach. They come from your network and
                communities you&apos;re already part of:
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-violet-500/30 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shrink-0">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Builder Communities</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Platforms like <span className="text-orange-400">Builders.to</span> where developers
                        actively signal they&apos;re looking for co-founders. Use the &quot;Looking for Co-founder&quot;
                        filter to find interested builders.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">Recommended</span>
                        <span className="text-xs text-zinc-500">Vetted builders with public profiles</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                      <Globe className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Indie Hacker Communities</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Indie Hackers forum, WIP.co, and Twitter/X #buildinpublic communities.
                        Developers here understand startup constraints.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                      <MapPin className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Local Meetups & Events</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Startup Weekend, hackathons, tech meetups. In-person connections are stronger
                        than cold online messages.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                      <Coffee className="h-6 w-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Your Existing Network</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Former colleagues, college friends, friends of friends. The best partnerships
                        often come from existing relationships.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 shrink-0">
                      <Code className="h-6 w-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Open Source Contributors</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        Find developers contributing to projects relevant to your idea.
                        They clearly care about the problem space.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                <p className="text-violet-300 text-sm">
                  <strong>Pro tip:</strong> Build in public before looking for a co-founder.
                  When developers see you have traction, audience, or deep market knowledge,
                  they&apos;ll approach you.
                </p>
              </div>
            </section>

            {/* How to Pitch */}
            <section id="how-to-pitch">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">How to Pitch Your Idea to Developers</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Developers get pitched constantly. Most pitches are terrible. Here&apos;s how to stand out:
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-white">Lead with the Problem, Not the Solution</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      &quot;I want to build an app that...&quot; → ❌<br />
                      &quot;I noticed that [users] struggle with [problem], and here&apos;s why...&quot; → ✅
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-white">Show Your Unique Insight</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Why are you the right person to solve this? Industry experience, customer
                      research, or personal pain point—share your unfair advantage.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-white">Demonstrate Traction or Validation</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Waitlist signups, customer interviews, pre-orders, or even a no-code MVP.
                      Show you&apos;ve done work beyond having an idea.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold text-white">Be Specific About What You Bring</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      &quot;I&apos;ll handle the business side&quot; → ❌<br />
                      &quot;I&apos;ll handle sales, marketing, and customer success. I have 10 years in [industry] and relationships with [target customers]&quot; → ✅
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shrink-0">5</span>
                  <div>
                    <h4 className="font-semibold text-white">Respect Their Time</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Don&apos;t send a 10-paragraph email. Keep it short. Ask for a specific meeting time.
                      Make it easy to say yes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Template */}
              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 font-mono text-sm">
                <div className="text-zinc-400 mb-4">// Outreach Template</div>
                <div className="space-y-4 text-zinc-200">
                  <p>Hey <span className="text-amber-400">[Name]</span>,</p>
                  <p>
                    I saw your work on <span className="text-amber-400">[project/profile]</span>—impressive stuff.
                  </p>
                  <p>
                    I&apos;m working on a problem in <span className="text-amber-400">[industry]</span>: <span className="text-amber-400">[one sentence problem description]</span>.
                    I&apos;ve talked to <span className="text-amber-400">[X]</span> potential customers and <span className="text-amber-400">[validation point]</span>.
                  </p>
                  <p>
                    I&apos;m looking for a technical co-founder. My background is <span className="text-amber-400">[your relevant experience]</span>.
                  </p>
                  <p>
                    Would you be open to a 20-min call this week to explore if there&apos;s a fit?
                  </p>
                </div>
              </div>
            </section>

            {/* Equity Splits */}
            <section id="equity-splits">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Scale className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Equity Splits & Agreements</h2>
              </div>

              <p className="leading-relaxed mb-6">
                The #1 cause of co-founder breakups is poorly negotiated equity. Here&apos;s how to do it right:
              </p>

              <h3 className="text-xl font-semibold text-white mb-4">Common Equity Splits</h3>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">50/50</div>
                  <div className="text-sm text-white font-medium">Equal Partners</div>
                  <p className="text-xs text-zinc-400 mt-2">
                    When both join at the same time, commit equally, and bring equal value.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                  <div className="text-3xl font-bold text-amber-400 mb-2">60/40</div>
                  <div className="text-sm text-white font-medium">Slight Advantage</div>
                  <p className="text-xs text-zinc-400 mt-2">
                    When one founder started earlier, has more traction, or brings unique expertise.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                  <div className="text-3xl font-bold text-rose-400 mb-2">70/30+</div>
                  <div className="text-sm text-white font-medium">Founding + Joining</div>
                  <p className="text-xs text-zinc-400 mt-2">
                    When one founder has significant traction and the other joins later.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Factors That Affect Equity</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-emerald-400 font-medium text-sm">More Equity →</p>
                    <ul className="text-xs text-zinc-400 mt-1 space-y-1">
                      <li>• Started the company</li>
                      <li>• Full-time commitment</li>
                      <li>• More industry expertise</li>
                      <li>• Existing traction/customers</li>
                      <li>• Capital investment</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-amber-400 font-medium text-sm">Less Equity →</p>
                    <ul className="text-xs text-zinc-400 mt-1 space-y-1">
                      <li>• Joining later</li>
                      <li>• Part-time initially</li>
                      <li>• More junior role</li>
                      <li>• Less risk taken</li>
                      <li>• Salary from day one</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>Important:</strong> Don&apos;t obsess over a few percentage points. A slightly unfair
                  split with the right person beats a perfect split with the wrong person.
                </p>
              </div>
            </section>

            {/* Vesting */}
            <section id="vesting">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                  <Shield className="h-5 w-5 text-rose-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Vesting Schedules (Critical!)</h2>
              </div>

              <p className="leading-relaxed mb-6">
                <span className="text-rose-400 font-semibold">This is non-negotiable.</span> Vesting protects both
                founders if someone leaves early. Without it, a co-founder can work for 3 months, leave,
                and keep 50% of the company.
              </p>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Standard Vesting: 4 Years with 1-Year Cliff</h4>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                    <span><strong>1-year cliff:</strong> No equity vests until month 12. If someone leaves before then, they get nothing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                    <span><strong>Monthly vesting:</strong> After the cliff, equity vests monthly over the remaining 3 years.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                    <span><strong>Example:</strong> With 40% equity, you get 10% at month 12, then ~0.83% per month after.</span>
                  </li>
                </ul>
              </div>

              {/* Visual Timeline */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
                <h4 className="font-semibold text-white mb-4">How Vesting Works (40% Total Equity)</h4>
                <div className="relative">
                  <div className="absolute left-0 top-3 h-0.5 w-full bg-zinc-700"></div>
                  <div className="flex justify-between relative">
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-xs text-zinc-400 relative z-10">0</div>
                      <p className="text-xs text-zinc-500 mt-2">Start</p>
                      <p className="text-xs text-rose-400">0%</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-xs text-white relative z-10">1</div>
                      <p className="text-xs text-zinc-500 mt-2">Year 1</p>
                      <p className="text-xs text-emerald-400">10%</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-emerald-500 flex items-center justify-center text-xs text-zinc-400 relative z-10">2</div>
                      <p className="text-xs text-zinc-500 mt-2">Year 2</p>
                      <p className="text-xs text-emerald-400">20%</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-emerald-500 flex items-center justify-center text-xs text-zinc-400 relative z-10">3</div>
                      <p className="text-xs text-zinc-500 mt-2">Year 3</p>
                      <p className="text-xs text-emerald-400">30%</p>
                    </div>
                    <div className="text-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white relative z-10">4</div>
                      <p className="text-xs text-zinc-500 mt-2">Year 4</p>
                      <p className="text-xs text-emerald-400">40%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-amber-300 text-sm">
                  <strong>Both founders should vest.</strong> Yes, even if you started the company.
                  This protects the company if any founder leaves early.
                </p>
              </div>
            </section>

            {/* First Meeting Checklist */}
            <section id="first-meeting">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                  <FileText className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">The First Meeting Checklist</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Your first call with a potential co-founder should cover these topics:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-cyan-400" />
                    About Them
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li>□ Past projects they&apos;ve shipped</li>
                    <li>□ Why they want to be a founder</li>
                    <li>□ Their financial runway</li>
                    <li>□ Time they can commit</li>
                    <li>□ What they&apos;re looking for in a co-founder</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-400" />
                    About the Opportunity
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li>□ The problem and your insight</li>
                    <li>□ What you&apos;ve done so far</li>
                    <li>□ What you bring to the table</li>
                    <li>□ Your vision for the company</li>
                    <li>□ Timeline and next steps</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-cyan-400" />
                    Working Style
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li>□ How they handle disagreements</li>
                    <li>□ Communication preferences</li>
                    <li>□ Remote vs. in-person</li>
                    <li>□ Decision-making style</li>
                    <li>□ Work-life balance expectations</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-cyan-400" />
                    The Hard Questions
                  </h4>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li>□ Equity expectations</li>
                    <li>□ Views on vesting</li>
                    <li>□ What if it doesn&apos;t work out?</li>
                    <li>□ Long-term goals (exit, lifestyle)</li>
                    <li>□ Outside commitments</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                <p className="text-cyan-300 text-sm">
                  <strong>Don&apos;t rush.</strong> Have 3-5 meetings before committing. Work on a small
                  project together first. You&apos;re choosing someone to work with for years—take your time.
                </p>
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Looking for a Co-founder?</h3>
              <p className="text-zinc-300 mb-6 max-w-lg mx-auto">
                Enable the &quot;Looking for Co-founder&quot; flag on your Builders.to profile to connect with
                developers who are actively seeking partnerships.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all hover:from-cyan-600 hover:to-blue-700"
                >
                  <Users className="h-4 w-4" />
                  Create Your Profile
                </Link>
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  <Search className="h-4 w-4" />
                  Browse Builders
                </Link>
              </div>
            </section>

          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between">
          <Link
            href="/how-to"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors"
          >
            ← Back to How To
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
