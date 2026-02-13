import Link from "next/link";
import type { Metadata } from "next";
import {
  DollarSign,
  Rocket,
  Users,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Code,
  Zap,
  BookOpen,
  Repeat,
  ShoppingCart,
  Megaphone,
  Building,
  Star,
  Gift,
  PiggyBank,
  Laptop,
  Globe,
  FileText,
  Video,
  Mic,
  Mail,
  Layers,
  BarChart3,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How Indie Hackers Actually Make Money: Revenue Streams Beyond SaaS - Builders.to",
  description: "Discover the diverse revenue streams successful indie hackers use beyond SaaS. From freelancing to digital products, consulting to acquisitions—learn how to diversify your income.",
  keywords: ["indie hacker income", "how indie hackers make money", "solopreneur revenue streams", "bootstrapped startup revenue", "indie hacker monetization"],
};

const revenueStreams = [
  {
    id: 1,
    name: "SaaS Subscriptions",
    icon: Repeat,
    color: "emerald",
    avgRevenue: "$1k-100k+/mo",
    timeToRevenue: "3-12 months",
    difficulty: "Hard",
    description: "The gold standard. Monthly recurring revenue from software subscriptions.",
    pros: ["Predictable recurring revenue", "High valuations", "Scales without you"],
    cons: ["Long time to market", "High competition", "Churn management"],
    examples: ["Plausible Analytics", "Carrd", "Bannerbear"],
    tips: "Start with a narrow niche and expand. Don't compete with big players on features—compete on simplicity and price.",
  },
  {
    id: 2,
    name: "Freelance & Contract Work",
    icon: Briefcase,
    color: "cyan",
    avgRevenue: "$5k-30k/mo",
    timeToRevenue: "Immediate",
    difficulty: "Medium",
    description: "Trading time for money, but with the freedom to choose clients and projects.",
    pros: ["Immediate income", "Build expertise", "Fund your projects"],
    cons: ["Not scalable", "Feast or famine", "Time-intensive"],
    examples: ["Web development", "Design", "Marketing consulting"],
    tips: "Productize your service. Instead of hourly rates, offer fixed-price packages. 'Website Audit - $500' beats '$50/hour'.",
  },
  {
    id: 3,
    name: "Digital Products",
    icon: ShoppingCart,
    color: "violet",
    avgRevenue: "$500-20k/mo",
    timeToRevenue: "1-3 months",
    difficulty: "Medium",
    description: "One-time purchases of templates, courses, ebooks, or tools.",
    pros: ["No ongoing support", "Sell while sleeping", "High margins"],
    cons: ["No recurring revenue", "Marketing dependent", "Piracy risk"],
    examples: ["Notion templates", "UI kits", "Online courses"],
    tips: "Start with a small product ($19-49) to validate demand. The best products solve a very specific problem.",
  },
  {
    id: 4,
    name: "Consulting & Advising",
    icon: Star,
    color: "amber",
    avgRevenue: "$2k-50k/mo",
    timeToRevenue: "1-3 months",
    difficulty: "Medium",
    description: "High-value strategic advice for companies, often at premium rates.",
    pros: ["High hourly rates", "Build relationships", "Learn industries"],
    cons: ["Limited scalability", "Client dependent", "Requires reputation"],
    examples: ["Growth consulting", "Technical architecture", "Startup advising"],
    tips: "Build in public to establish credibility. Share your insights freely—paid work follows expertise.",
  },
  {
    id: 5,
    name: "Affiliate Marketing",
    icon: Megaphone,
    color: "rose",
    avgRevenue: "$500-10k/mo",
    timeToRevenue: "3-6 months",
    difficulty: "Easy",
    description: "Earning commissions by recommending products you use and trust.",
    pros: ["Passive income", "No product needed", "Low barrier"],
    cons: ["Requires audience", "Variable commissions", "Trust concerns"],
    examples: ["Tool recommendations", "Course affiliates", "Hosting referrals"],
    tips: "Only recommend products you actually use. Your reputation is worth more than any commission.",
  },
  {
    id: 6,
    name: "Sponsorships & Ads",
    icon: Mail,
    color: "blue",
    avgRevenue: "$500-20k/mo",
    timeToRevenue: "6-12 months",
    difficulty: "Medium",
    description: "Monetizing your audience through newsletter, podcast, or content sponsorships.",
    pros: ["Leverages existing content", "Predictable deals", "Scales with audience"],
    cons: ["Requires large audience", "Can feel salesy", "Advertiser dependent"],
    examples: ["Newsletter sponsors", "Podcast ads", "YouTube sponsors"],
    tips: "1,000 engaged subscribers is worth more than 100,000 passive ones. Focus on engagement, not vanity metrics.",
  },
  {
    id: 7,
    name: "Building & Selling",
    icon: Building,
    color: "indigo",
    avgRevenue: "$10k-1M+ (one-time)",
    timeToRevenue: "1-5 years",
    difficulty: "Hard",
    description: "Building products with the explicit goal of selling them.",
    pros: ["Large payouts", "Clean exit", "Learn quickly"],
    cons: ["Uncertain outcomes", "Buyer dependent", "Emotional toll"],
    examples: ["Micro-acquisitions", "SaaS flipping", "Content site sales"],
    tips: "Build for sale from day one. Keep clean financials, documented processes, and low owner dependency.",
  },
  {
    id: 8,
    name: "Paid Communities",
    icon: Users,
    color: "orange",
    avgRevenue: "$1k-30k/mo",
    timeToRevenue: "3-6 months",
    difficulty: "Medium",
    description: "Membership communities with exclusive content, networking, or access.",
    pros: ["Recurring revenue", "Engaged audience", "Network effects"],
    cons: ["High touch", "Churn management", "Needs critical mass"],
    examples: ["Slack/Discord communities", "Masterminds", "Private forums"],
    tips: "Start free to build value and community. Convert to paid once you've proven the value proposition.",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string; gradient: string }> = {
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/20", gradient: "from-emerald-500 to-green-600" },
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400", iconBg: "bg-cyan-500/20", gradient: "from-cyan-500 to-blue-600" },
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/20", gradient: "from-violet-500 to-purple-600" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400", iconBg: "bg-amber-500/20", gradient: "from-amber-500 to-orange-600" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-400", iconBg: "bg-rose-500/20", gradient: "from-rose-500 to-pink-600" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/20", gradient: "from-blue-500 to-indigo-600" },
  indigo: { border: "border-indigo-500/30", bg: "bg-indigo-500/10", text: "text-indigo-400", iconBg: "bg-indigo-500/20", gradient: "from-indigo-500 to-purple-600" },
  orange: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-400", iconBg: "bg-orange-500/20", gradient: "from-orange-500 to-red-600" },
};

export default function IndieHackerRevenueStreamsPage() {
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
          <span className="text-zinc-400">Revenue Streams</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">How Indie Hackers Make Money</h1>
              <p className="text-zinc-400 mt-1">Revenue Streams Beyond SaaS</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              10 min read
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              8 Revenue Streams
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              Diversification Guide
            </span>
          </div>
        </div>

        {/* Hook Section */}
        <div className="mb-12 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-8">
          <p className="text-lg text-zinc-200 leading-relaxed">
            Not every indie hacker makes money from SaaS. The most resilient builders diversify—
            combining products, services, and passive income into a portfolio that survives market shifts.
          </p>
          <p className="mt-4 text-emerald-400 font-semibold">
            Here are the 8 most common revenue streams successful indie hackers use, with real numbers
            and actionable advice.
          </p>
        </div>

        {/* Quick Overview */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue Stream Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-2 text-zinc-400 font-medium">Stream</th>
                  <th className="text-left py-2 px-2 text-zinc-400 font-medium">Avg Revenue</th>
                  <th className="text-left py-2 px-2 text-zinc-400 font-medium">Time to $</th>
                  <th className="text-left py-2 px-2 text-zinc-400 font-medium">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {revenueStreams.map((stream) => {
                  const colors = colorMap[stream.color];
                  return (
                    <tr key={stream.id} className="border-b border-zinc-800/50">
                      <td className="py-2 px-2">
                        <a href={`#stream-${stream.id}`} className={`${colors.text} hover:underline`}>
                          {stream.name}
                        </a>
                      </td>
                      <td className="py-2 px-2 text-emerald-400">{stream.avgRevenue}</td>
                      <td className="py-2 px-2 text-zinc-400">{stream.timeToRevenue}</td>
                      <td className="py-2 px-2 text-zinc-400">{stream.difficulty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Streams Detail */}
        <div className="space-y-12">
          {revenueStreams.map((stream) => {
            const colors = colorMap[stream.color];
            const IconComponent = stream.icon;
            return (
              <section key={stream.id} id={`stream-${stream.id}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.gradient} shadow-lg`}>
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${colors.text}`}>#{stream.id}</span>
                    <h2 className="text-2xl font-semibold text-white">{stream.name}</h2>
                  </div>
                </div>

                <p className="text-zinc-300 leading-relaxed mb-6">
                  {stream.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className={`rounded-xl ${colors.border} ${colors.bg} p-4 text-center`}>
                    <DollarSign className={`h-5 w-5 ${colors.text} mx-auto mb-1`} />
                    <div className="text-sm font-bold text-white">{stream.avgRevenue}</div>
                    <div className="text-xs text-zinc-500">Avg Revenue</div>
                  </div>
                  <div className={`rounded-xl ${colors.border} ${colors.bg} p-4 text-center`}>
                    <Clock className={`h-5 w-5 ${colors.text} mx-auto mb-1`} />
                    <div className="text-sm font-bold text-white">{stream.timeToRevenue}</div>
                    <div className="text-xs text-zinc-500">Time to $</div>
                  </div>
                  <div className={`rounded-xl ${colors.border} ${colors.bg} p-4 text-center`}>
                    <Target className={`h-5 w-5 ${colors.text} mx-auto mb-1`} />
                    <div className="text-sm font-bold text-white">{stream.difficulty}</div>
                    <div className="text-xs text-zinc-500">Difficulty</div>
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                    <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Pros
                    </h4>
                    <ul className="space-y-1.5 text-sm text-zinc-400">
                      {stream.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
                    <h4 className="font-semibold text-rose-400 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Cons
                    </h4>
                    <ul className="space-y-1.5 text-sm text-zinc-400">
                      {stream.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Examples */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 mb-4">
                  <h4 className="font-semibold text-white mb-2">Real Examples</h4>
                  <div className="flex flex-wrap gap-2">
                    {stream.examples.map((example, i) => (
                      <span key={i} className={`text-xs px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pro Tip */}
                <div className={`rounded-xl ${colors.bg} ${colors.border} p-4`}>
                  <p className={`text-sm ${colors.text}`}>
                    <strong>Pro tip:</strong> {stream.tips}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        {/* The Portfolio Approach */}
        <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white">The Portfolio Approach</h2>
          </div>

          <p className="text-zinc-300 leading-relaxed mb-6">
            The smartest indie hackers don&apos;t rely on a single income stream. They build a portfolio:
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">1</span>
              <div>
                <h4 className="font-semibold text-white">Foundation: Service Income</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Freelancing or consulting provides immediate cash flow while you build products.
                  It also keeps you connected to real customer problems.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">2</span>
              <div>
                <h4 className="font-semibold text-white">Growth: Product Income</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  SaaS, digital products, or paid communities. These scale without your direct time
                  and can eventually replace service income.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">3</span>
              <div>
                <h4 className="font-semibold text-white">Leverage: Passive Income</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Affiliates, ads, and content monetization. Relatively small but requires minimal
                  ongoing effort once established.
                </p>
              </div>
            </div>
          </div>

          {/* Example Portfolio */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
            <h4 className="font-semibold text-amber-400 mb-4">Example: $15k/month Portfolio</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">SaaS Product</span>
                <span className="text-emerald-400 font-medium">$6,000/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Consulting (10 hrs/mo)</span>
                <span className="text-emerald-400 font-medium">$5,000/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Digital Products</span>
                <span className="text-emerald-400 font-medium">$2,000/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Newsletter Sponsorships</span>
                <span className="text-emerald-400 font-medium">$1,500/mo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Affiliates</span>
                <span className="text-emerald-400 font-medium">$500/mo</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-amber-500/30">
                <span className="text-white font-semibold">Total</span>
                <span className="text-emerald-400 font-bold">$15,000/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* How Builders.to Helps */}
        <div className="mt-8 rounded-xl border border-orange-500/30 bg-orange-500/5 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Diversify with Builders.to</h2>
          </div>

          <p className="text-zinc-300 leading-relaxed mb-6">
            Builders.to has features designed to help you monetize multiple ways:
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-400" />
                Services Marketplace
              </h4>
              <p className="text-sm text-zinc-400">
                List your freelance services and reach builders who need help with
                development, design, marketing, and more.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-400" />
                Builders Local
              </h4>
              <p className="text-sm text-zinc-400">
                Post local listings to find clients, collaborators, or sell
                equipment and digital assets in your area.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                Project Showcase
              </h4>
              <p className="text-sm text-zinc-400">
                Showcase your products to attract customers, investors, and acquirers.
                Track milestones and build social proof.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-400" />
                Builder Network
              </h4>
              <p className="text-sm text-zinc-400">
                Connect with potential clients, partners, and collaborators.
                Your network is your net worth.
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Getting Started Today</h2>
          </div>

          <p className="text-zinc-300 leading-relaxed mb-6">
            Don&apos;t try to do everything at once. Here&apos;s a sensible progression:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-medium">Week 1-2: Start with services</p>
                <p className="text-sm text-zinc-400">List a productized service based on your skills. Get your first client.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-medium">Month 1-3: Build your first product</p>
                <p className="text-sm text-zinc-400">Use insights from service work to identify a product opportunity.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-medium">Month 3-6: Add content monetization</p>
                <p className="text-sm text-zinc-400">Build an audience while building products. Monetize with affiliates and sponsors.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-medium">Month 6+: Scale and diversify</p>
                <p className="text-sm text-zinc-400">Double down on what works. Experiment with new streams. Build your portfolio.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Diversify Your Income?</h3>
          <p className="text-zinc-300 mb-6 max-w-lg mx-auto">
            Join Builders.to to showcase your products, list your services, and connect with
            a community of indie hackers building multiple income streams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white transition-all hover:from-emerald-600 hover:to-green-700"
            >
              <Rocket className="h-4 w-4" />
              Get Started Free
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
            >
              <Briefcase className="h-4 w-4" />
              Browse Projects
            </Link>
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
