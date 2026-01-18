import Link from "next/link";
import type { Metadata } from "next";
import { Zap, Award, Clock, TrendingUp, Eye, Lightbulb, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Growth Hacks - Builders.to",
  description: "Proven growth strategies and tactics used by successful indie founders to build authority and attract audiences.",
};

// Define all growth hack articles
const articles = [
  {
    slug: "builder-badge-method",
    title: "The Builder-Badge Method",
    description: "Learn how a nobody became the most connected person in indie startups by creating a 'Top 50 Builders' list. Cost: $12. Result: 1.2M visitors.",
    readTime: "8 min read",
    icon: Award,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    stats: "1.2M+ visitors",
  },
  {
    slug: "build-in-public",
    title: "How to Build in Public",
    description: "The complete 2026 guide for indie hackers. Learn daily update strategies, what to share vs. keep private, and grow your audience while building.",
    readTime: "12 min read",
    icon: Eye,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    stats: "3x engagement",
  },
  {
    slug: "micro-saas-ideas",
    title: "50 Micro-SaaS Ideas",
    description: "A curated list of 50 micro-SaaS ideas you can build and launch in 30 days. Each idea is validated, achievable, and has real revenue potential.",
    readTime: "10 min read",
    icon: Lightbulb,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    stats: "50 ideas",
  },
  {
    slug: "indie-hacker-revenue-streams",
    title: "How Indie Hackers Make Money",
    description: "Discover the 8 revenue streams successful indie hackers use beyond SaaS. From freelancing to acquisitions, learn to diversify your income.",
    readTime: "10 min read",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    stats: "8 streams",
  },
];

export default function GrowthHacksPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/articles"
            className="text-orange-500 hover:text-orange-400 transition-colors text-sm"
          >
            ← Back to Articles
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/25">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Growth Hacks</h1>
              <p className="text-zinc-400 mt-1">
                Proven tactics to build authority and attract audiences fast
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="space-y-4">
          {articles.map((article) => {
            const IconComponent = article.icon;
            return (
              <Link
                key={article.slug}
                href={`/growth-hacks/${article.slug}`}
                className="group relative block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-amber-500/50 hover:bg-zinc-900"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${article.iconBg} shrink-0`}>
                    <IconComponent className={`h-7 w-7 ${article.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-zinc-400 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {article.readTime}
                      </span>
                      {article.stats && (
                        <span className="flex items-center gap-1.5 text-emerald-500">
                          <TrendingUp className="h-4 w-4" />
                          {article.stats}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-amber-500/20 transition-all" />
              </Link>
            );
          })}
        </div>

        {/* Contribute Section */}
        <div className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Have a growth hack to share?
          </h3>
          <p className="text-zinc-400 mb-4">
            We&apos;re always looking for proven tactics from the builder community. Share your success story.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://x.com/i/communities/1943895831322439993"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Share on X Community
            </a>
            <a
              href="https://discord.com/invite/G7nmswWkbn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Discord Server
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
