import Link from "next/link";
import type { Metadata } from "next";
import {
  Lightbulb,
  Rocket,
  Users,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  MessageCircle,
  Code,
  Zap,
  AlertTriangle,
  Trophy,
  Flag,
  BarChart3,
  Search,
  Megaphone,
  Gift,
  Star,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "From Idea to First Customer: A Step-by-Step Indie Hacker Roadmap - Builders.to",
  description: "The complete roadmap for indie hackers to go from idea to paying customer. Learn how to validate, build an MVP, launch your beta, and acquire your first customer.",
  keywords: ["indie hacker roadmap", "how to launch a SaaS", "first customer startup", "validate startup idea", "MVP development", "indie hacker guide"],
};

export default function IdeaToFirstCustomerPage() {
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
          <span className="text-zinc-400">Idea to First Customer</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">From Idea to First Customer</h1>
              <p className="text-zinc-400 mt-1">A Step-by-Step Indie Hacker Roadmap</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              15 min read
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              Actionable Guide
            </span>
            <span className="flex items-center gap-1.5">
              <Flag className="h-4 w-4" />
              4 Stages
            </span>
          </div>
        </div>

        {/* Hook Section */}
        <div className="mb-12 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-8">
          <p className="text-lg text-zinc-200 leading-relaxed">
            Most indie hackers fail not because their idea is bad—but because they skip steps.
            They build for months in isolation, launch to crickets, and wonder what went wrong.
          </p>
          <p className="mt-4 text-violet-400 font-semibold">
            This roadmap shows you the exact path from &quot;I have an idea&quot; to &quot;I just got paid.&quot;
          </p>
        </div>

        {/* Visual Roadmap */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-6 text-center">
            The Journey
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 mb-2">
                <Lightbulb className="h-6 w-6 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-white">Idea</span>
              <span className="text-xs text-zinc-500">Validate</span>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-600 hidden sm:block" />
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 mb-2">
                <Code className="h-6 w-6 text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-white">Building</span>
              <span className="text-xs text-zinc-500">MVP</span>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-600 hidden sm:block" />
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 mb-2">
                <Users className="h-6 w-6 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-white">Beta</span>
              <span className="text-xs text-zinc-500">Feedback</span>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-600 hidden sm:block" />
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 mb-2">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-white">Launched</span>
              <span className="text-xs text-zinc-500">First $</span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            In this guide
          </h2>
          <nav className="space-y-2">
            {[
              { href: "#stage-1", label: "Stage 1: Idea Validation" },
              { href: "#stage-2", label: "Stage 2: Building Your MVP" },
              { href: "#stage-3", label: "Stage 3: Beta Testing & Feedback" },
              { href: "#stage-4", label: "Stage 4: Getting Your First Customer" },
              { href: "#common-mistakes", label: "Common Mistakes to Avoid" },
              { href: "#tracking-progress", label: "Tracking Your Progress" },
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
          <div className="space-y-16 text-zinc-300">

            {/* Stage 1: Idea Validation */}
            <section id="stage-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                  <Lightbulb className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-sm text-amber-400 font-medium">Stage 1</span>
                  <h2 className="text-2xl font-semibold text-white">Idea Validation</h2>
                </div>
              </div>

              <p className="leading-relaxed mb-6">
                Before writing a single line of code, you need to know if anyone actually wants what
                you&apos;re building. This stage is about <span className="text-amber-400 font-medium">
                proving demand</span> with minimal effort.
              </p>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Goal of This Stage</h4>
                <p className="text-zinc-400 text-sm">
                  Find at least 10 people who say they would pay for your solution. Not &quot;cool idea&quot;—
                  but &quot;I would pay $X for this.&quot;
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 1: Identify the Problem</h3>

              <p className="mb-4">Start with a problem, not a solution. Ask yourself:</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <Search className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Who has this problem?</p>
                    <p className="text-sm text-zinc-400">Be specific. &quot;Small businesses&quot; is too broad. &quot;Solo consultants who struggle with invoicing&quot; is better.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">How painful is this problem?</p>
                    <p className="text-sm text-zinc-400">Mild annoyances don&apos;t get paid for. Look for hair-on-fire problems.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <DollarSign className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Are they paying for alternatives?</p>
                    <p className="text-sm text-zinc-400">If people already pay for solutions, the market is validated. You just need to be better.</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 2: Talk to Potential Customers</h3>

              <p className="mb-4">This is where most indie hackers fail. They skip talking to people because it&apos;s uncomfortable. Don&apos;t.</p>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">The Mom Test Questions</h4>
                <p className="text-sm text-zinc-400 mb-4">
                  Don&apos;t ask if your idea is good. Ask about their life and problems:
                </p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• &quot;Tell me about the last time you dealt with [problem].&quot;</li>
                  <li>• &quot;What solutions have you tried? What did you like/hate?&quot;</li>
                  <li>• &quot;How much time/money does this problem cost you?&quot;</li>
                  <li>• &quot;If you could wave a magic wand, what would the perfect solution look like?&quot;</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 3: Validate Willingness to Pay</h3>

              <p className="mb-4">Interest isn&apos;t validation. Money is. Here are ways to test:</p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2">Landing Page Test</h4>
                  <p className="text-sm text-zinc-400">
                    Create a simple page describing your solution with a &quot;Pre-order&quot; or &quot;Join Waitlist&quot;
                    button. Track conversions.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2">Pre-sell</h4>
                  <p className="text-sm text-zinc-400">
                    Offer lifetime deals or early-bird pricing before building. Real payment = real validation.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2">Fake Door Test</h4>
                  <p className="text-sm text-zinc-400">
                    Add a button for a feature that doesn&apos;t exist. See how many people click.
                    Then show &quot;Coming soon—leave your email.&quot;
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2">Concierge MVP</h4>
                  <p className="text-sm text-zinc-400">
                    Deliver the service manually before automating. If people pay for the manual version,
                    they&apos;ll pay for the automated one.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-amber-300 text-sm">
                  <strong>Exit criteria:</strong> You have at least 10 people who explicitly said they
                  would pay, or you have actual pre-orders/waitlist signups. Move to Stage 2.
                </p>
              </div>
            </section>

            {/* Stage 2: Building Your MVP */}
            <section id="stage-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                  <Code className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-sm text-cyan-400 font-medium">Stage 2</span>
                  <h2 className="text-2xl font-semibold text-white">Building Your MVP</h2>
                </div>
              </div>

              <p className="leading-relaxed mb-6">
                MVP doesn&apos;t mean &quot;crappy product.&quot; It means the <span className="text-cyan-400 font-medium">
                smallest thing that delivers value</span>. Your goal is to get something usable in front of
                people as fast as possible.
              </p>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Goal of This Stage</h4>
                <p className="text-zinc-400 text-sm">
                  Build a working product that solves the core problem. Ship in 2-4 weeks, not 2-4 months.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 1: Define Your Core Feature</h3>

              <p className="mb-4">
                List every feature you want. Now cut 80% of them. What&apos;s the ONE thing your product must do?
              </p>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">The Burger Test</h4>
                <p className="text-sm text-zinc-400">
                  A restaurant MVP isn&apos;t a food truck, it&apos;s a burger. One menu item, done well.
                  What&apos;s your burger? Everything else is toppings for later.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 2: Choose Your Stack Wisely</h3>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Use what you know</p>
                    <p className="text-sm text-zinc-400">Now is not the time to learn a new framework. Speed matters.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Embrace no-code/low-code</p>
                    <p className="text-sm text-zinc-400">Tools like Cursor, v0, or no-code platforms can 10x your speed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Buy, don&apos;t build</p>
                    <p className="text-sm text-zinc-400">Auth, payments, email—use existing services. Don&apos;t reinvent wheels.</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 3: Set a Ship Date</h3>

              <p className="mb-4">
                Pick a date 2-4 weeks out. Make it public. Tell your waitlist, post on Builders.to,
                tweet about it. Public commitment creates accountability.
              </p>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Daily Shipping Ritual</h4>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    Ship something every day—even if small
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    Post your progress publicly (build in public!)
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    End each day knowing what you&apos;ll ship tomorrow
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 4: Don&apos;t Forget Payments</h3>

              <p className="mb-4">
                Your MVP needs a way to accept money. Even if you plan to launch free, having payments
                ready means you can flip the switch instantly when you&apos;re ready to charge.
              </p>

              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4">
                <p className="text-cyan-300 text-sm">
                  <strong>Exit criteria:</strong> You have a working product that solves the core problem
                  and can accept payments. It&apos;s ugly but functional. Move to Stage 3.
                </p>
              </div>
            </section>

            {/* Stage 3: Beta Testing */}
            <section id="stage-3">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-sm text-violet-400 font-medium">Stage 3</span>
                  <h2 className="text-2xl font-semibold text-white">Beta Testing & Feedback</h2>
                </div>
              </div>

              <p className="leading-relaxed mb-6">
                Beta isn&apos;t about finding bugs (though you will). It&apos;s about learning if your product
                actually <span className="text-violet-400 font-medium">delivers value</span> in the real world.
              </p>

              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Goal of This Stage</h4>
                <p className="text-zinc-400 text-sm">
                  Get 10-50 users actively using your product. Collect feedback. Iterate until users
                  say &quot;I can&apos;t live without this.&quot;
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 1: Find Your Beta Users</h3>

              <p className="mb-4">
                Go back to the people you talked to in Stage 1. They already expressed interest. Also try:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-violet-400" />
                    Communities
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Reddit, Discord servers, Slack groups, Twitter/X communities where your
                    target audience hangs out.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-violet-400" />
                    Builder Communities
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Platforms like Builders.to where other indie hackers will happily test your
                    product and give honest feedback.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-violet-400" />
                    Lifetime Deals
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Offer discounted lifetime access in exchange for feedback. You get users and
                    revenue; they get a deal.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-violet-400" />
                    Product Hunt Ship
                  </h4>
                  <p className="text-sm text-zinc-400">
                    Use Product Hunt&apos;s &quot;Ship&quot; feature to build a following before
                    your official launch.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 2: Onboard Carefully</h3>

              <p className="mb-4">
                Your first users need hand-holding. This is a feature, not a bug.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-zinc-300">Do onboarding calls with every beta user</span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-zinc-300">Watch them use your product (screen share)</span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-zinc-300">Ask: &quot;What did you expect to happen?&quot; when they get confused</span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-zinc-300">Create a feedback channel (Discord, Slack, or email)</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 3: Measure What Matters</h3>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Key Beta Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-violet-400 font-medium">Activation Rate</p>
                    <p className="text-sm text-zinc-400">% who complete core action</p>
                  </div>
                  <div>
                    <p className="text-violet-400 font-medium">Retention</p>
                    <p className="text-sm text-zinc-400">% who come back day 7, 30</p>
                  </div>
                  <div>
                    <p className="text-violet-400 font-medium">NPS Score</p>
                    <p className="text-sm text-zinc-400">&quot;Would you recommend this?&quot;</p>
                  </div>
                  <div>
                    <p className="text-violet-400 font-medium">PMF Survey</p>
                    <p className="text-sm text-zinc-400">&quot;How disappointed if gone?&quot;</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                <p className="text-violet-300 text-sm">
                  <strong>Exit criteria:</strong> 40%+ of users say they&apos;d be &quot;very disappointed&quot;
                  if your product disappeared. You have a clear picture of what to improve. Move to Stage 4.
                </p>
              </div>
            </section>

            {/* Stage 4: First Customer */}
            <section id="stage-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-sm text-emerald-400 font-medium">Stage 4</span>
                  <h2 className="text-2xl font-semibold text-white">Getting Your First Customer</h2>
                </div>
              </div>

              <p className="leading-relaxed mb-6">
                Your first paying customer is a milestone that changes everything. It proves your business
                is real. Here&apos;s how to get there <span className="text-emerald-400 font-medium">without
                fancy marketing</span>.
              </p>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-6">
                <h4 className="font-semibold text-white mb-3">Goal of This Stage</h4>
                <p className="text-zinc-400 text-sm">
                  Convert one beta user (or new user) into a paying customer. Then repeat.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 1: Pick Your Pricing</h3>

              <p className="mb-4">
                Indie hackers often underprice. Start higher than you think—you can always discount.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                  <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">Value-Based</h4>
                  <p className="text-xs text-zinc-400 mt-1">Price based on value delivered, not cost to build</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                  <BarChart3 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">Competitor Research</h4>
                  <p className="text-xs text-zinc-400 mt-1">Check what alternatives charge, position accordingly</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                  <Target className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white">10x Rule</h4>
                  <p className="text-xs text-zinc-400 mt-1">Product should deliver 10x its price in value</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 2: Ask Your Beta Users</h3>

              <p className="mb-4">
                The easiest first customers are people already using your product. Send this email:
              </p>

              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 font-mono text-sm mb-6">
                <div className="text-zinc-400 mb-4">// Email Template</div>
                <div className="space-y-4 text-zinc-200">
                  <p>Hey <span className="text-emerald-400">[Name]</span>,</p>
                  <p>
                    Thanks for being a beta user of [Product]. Your feedback has been invaluable.
                  </p>
                  <p>
                    We&apos;re moving out of beta next week. I&apos;d love to offer you <span className="text-emerald-400">50% off
                    for life</span> as a thank you for being early.
                  </p>
                  <p>
                    Interested? Just reply and I&apos;ll set you up.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 3: Launch Somewhere</h3>

              <p className="mb-4">
                Your &quot;launch&quot; doesn&apos;t need to be big. Pick 2-3 channels and go:
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <Star className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Product Hunt</p>
                    <p className="text-sm text-zinc-400">Good for awareness, but don&apos;t expect paying customers directly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <Users className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Niche Communities</p>
                    <p className="text-sm text-zinc-400">Reddit, Hacker News, industry Slack groups—where your users actually are.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <Heart className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Your Existing Audience</p>
                    <p className="text-sm text-zinc-400">If you&apos;ve been building in public, your followers are warm leads.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <Megaphone className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-white font-medium">Direct Outreach</p>
                    <p className="text-sm text-zinc-400">Cold email/DM people who fit your ICP. Personalized, not spammy.</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Step 4: Celebrate and Document</h3>

              <p className="mb-4">
                When you get that first payment, screenshot it. Share it. This is a milestone worth
                celebrating. Log it on Builders.to and inspire others.
              </p>

              {/* Milestone Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <Trophy className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">First User</div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <DollarSign className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">First $</div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">$1k MRR</div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <Rocket className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">Launched</div>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-emerald-300 text-sm">
                  <strong>Exit criteria:</strong> You have at least one paying customer. Congratulations—
                  you&apos;re now officially in business. Time to scale.
                </p>
              </div>
            </section>

            {/* Common Mistakes */}
            <section id="common-mistakes">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Common Mistakes to Avoid</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">Building Too Long Before Launching</h4>
                  <p className="text-sm text-zinc-400">
                    If you&apos;ve been building for 6+ months without users, something is wrong.
                    Ship ugly and iterate.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">Skipping Validation</h4>
                  <p className="text-sm text-zinc-400">
                    &quot;I&apos;ll build it and they&apos;ll come&quot; is a fantasy. Talk to potential customers first.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">Building for Everyone</h4>
                  <p className="text-sm text-zinc-400">
                    A product for everyone is a product for no one. Pick a specific audience and serve them well.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">Waiting for Perfect</h4>
                  <p className="text-sm text-zinc-400">
                    Your first version will be embarrassing. That&apos;s okay. Ship it anyway.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                  <h4 className="font-semibold text-white mb-2">Underpricing</h4>
                  <p className="text-sm text-zinc-400">
                    Charging $5/month attracts cheap customers with high expectations. Price for value.
                  </p>
                </div>
              </div>
            </section>

            {/* Tracking Progress */}
            <section id="tracking-progress">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Tracking Your Progress</h2>
              </div>

              <p className="leading-relaxed mb-6">
                Builders.to lets you track your project through each stage with built-in milestone tracking:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2">Project Stages</h4>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>• Idea → Building → Beta → Launched</li>
                    <li>• Update status as you progress</li>
                    <li>• Visible on your public profile</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <h4 className="font-semibold text-white mb-2">Milestones</h4>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    <li>• v1 Shipped, First User, First Customer</li>
                    <li>• $1k MRR, $10k MRR, Profitable</li>
                    <li>• Celebrate achievements publicly</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
                <p className="text-orange-300 text-sm">
                  <strong>Pro tip:</strong> Use daily updates to document your journey. Future you will
                  thank present you for the build log.
                </p>
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h3>
              <p className="text-zinc-300 mb-6 max-w-lg mx-auto">
                Track your project from idea to first customer on Builders.to.
                Join a community of builders who are shipping every day.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-violet-600 hover:to-purple-700"
                >
                  <Rocket className="h-4 w-4" />
                  Start Your Project
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  <Users className="h-4 w-4" />
                  Browse Projects
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
