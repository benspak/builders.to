import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  Users,
  Building2,
  Sparkles,
  Store,
  MapPin,
  Trophy,
  Coins,
  Bell,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Heart,
  MessageSquare,
  Globe,
  Map,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { BuildersLogo } from "@/components/ui/builders-logo";

export const metadata = {
  title: "Builders.to — Launch pad & social network for builders, entrepreneurs, and founders",
  description:
    "Join the community where builders, entrepreneurs, makers, and founders share their projects, post daily updates, find collaborators, hire verified talent, and launch together.",
};

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [projectCount, userCount, companyCount, serviceCount, updateCount] = await Promise.all([
      prisma.project.count(),
      prisma.user.count(),
      prisma.company.count(),
      prisma.serviceListing.count({ where: { status: "ACTIVE" } }),
      prisma.dailyUpdate.count(),
    ]);
    return { projectCount, userCount, companyCount, serviceCount, updateCount };
  } catch {
    return { projectCount: 0, userCount: 0, companyCount: 0, serviceCount: 0, updateCount: 0 };
  }
}

export default async function HomePage() {
  const [session, stats] = await Promise.all([auth(), getStats()]);

  const features = [
    {
      icon: Rocket,
      title: "Project Showcase",
      description:
        "Share your work at any stage — from idea to launched. Track progress with status updates: Idea, Building, Beta, Launched, Paused, or Acquired.",
      href: "/projects",
      color: "orange",
      stats: `${stats.projectCount.toLocaleString()} projects`,
    },
    {
      icon: Sparkles,
      title: "Daily Updates Feed",
      description:
        "Post what you're building today. Share wins, challenges, and progress with text, images, GIFs, and videos. Build your streak.",
      href: "/feed",
      color: "amber",
      stats: `${stats.updateCount.toLocaleString()} updates`,
    },
    {
      icon: Building2,
      title: "Companies & Startups",
      description:
        "Create your company profile with traction badges, tech stack, and team members. Post jobs and company updates.",
      href: "/companies",
      color: "blue",
      stats: `${stats.companyCount.toLocaleString()} companies`,
    },
    {
      icon: Store,
      title: "Services Marketplace",
      description:
        "Hire verified builders with proven track records. MVP builds, design, marketing, AI integration, DevOps, and more.",
      href: "/services",
      color: "emerald",
      stats: `${stats.serviceCount.toLocaleString()} services`,
    },
    {
      icon: MapPin,
      title: "Builders Local",
      description:
        "Find builders, services, jobs, and opportunities in your city. Local classifieds for the builder community.",
      href: "/local",
      color: "cyan",
      stats: "By city",
    },
    {
      icon: Briefcase,
      title: "Opportunity Hub",
      description:
        "Post and find opportunities: full-time, part-time, contract, freelance, cofounder, advisor, and intern roles.",
      href: "/companies",
      color: "violet",
      stats: "Job board",
    },
    {
      icon: Map,
      title: "Builder World Map",
      description:
        "See where builders are located around the world. Discover entrepreneurs, makers, and founders in your region.",
      href: "/map",
      color: "cyan",
      stats: "Global",
    },
  ];

  const builderFeatures = [
    {
      icon: Trophy,
      title: "Top Builders Ranking",
      description: "Climb the leaderboard based on launched projects, engagement, and contribution.",
    },
    {
      icon: Target,
      title: "Milestone Tracking",
      description: "Celebrate achievements: v1 shipped, first user, first customer, MRR milestones, profitability.",
    },
    {
      icon: Heart,
      title: "Follow System",
      description: "Build your network by following builders and getting followed back.",
    },
    {
      icon: Coins,
      title: "Token System",
      description: "Earn tokens through engagement, referrals, streaks, and profile completion. Gift tokens to support fellow builders.",
    },
    {
      icon: Bell,
      title: "Notifications & Digest",
      description: "Real-time notifications, push alerts, daily and weekly digests of activity.",
    },
  ];

  const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    orange: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-400",
      hover: "hover:border-orange-500/50",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      hover: "hover:border-amber-500/50",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
      hover: "hover:border-blue-500/50",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      hover: "hover:border-emerald-500/50",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      hover: "hover:border-cyan-500/50",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text: "text-violet-400",
      hover: "hover:border-violet-500/50",
    },
  };

  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/4 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-2 text-sm text-orange-400 mb-8">
              <Zap className="h-4 w-4" />
              <span>Social network for builders who ship</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Launch together.{" "}
              <span className="gradient-text">Build in public.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto mb-8">
              The launch pad and social network where{" "}
              <span className="text-white font-medium">entrepreneurs</span>,{" "}
              <span className="text-white font-medium">builders</span>,{" "}
              <span className="text-white font-medium">makers</span>, and{" "}
              <span className="text-white font-medium">founders</span> share projects,
              post daily updates, find collaborators, and grow together.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {session ? (
                <>
                  <Link href="/feed" className="btn-primary w-full sm:w-auto">
                    <Sparkles className="h-5 w-5" />
                    Go to Feed
                  </Link>
                  <Link href="/projects/new" className="btn-secondary w-full sm:w-auto">
                    <Rocket className="h-5 w-5" />
                    Share Project
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signin" className="btn-primary w-full sm:w-auto">
                    <Rocket className="h-5 w-5" />
                    Join the Community
                  </Link>
                  <Link href="/feed" className="btn-secondary w-full sm:w-auto">
                    <Globe className="h-5 w-5" />
                    Explore Feed
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-400" />
                <span className="text-zinc-400">
                  <span className="text-white font-semibold">{stats.userCount.toLocaleString()}</span> builders
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-amber-400" />
                <span className="text-zinc-400">
                  <span className="text-white font-semibold">{stats.projectCount.toLocaleString()}</span> projects
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                <span className="text-zinc-400">
                  <span className="text-white font-semibold">{stats.companyCount.toLocaleString()}</span> companies
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                <span className="text-zinc-400">
                  <span className="text-white font-semibold">{stats.updateCount.toLocaleString()}</span> updates
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="relative py-12 border-y border-zinc-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-500 mb-8">
            Companies that trust builders.to
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
            <a
              href="https://blackbox.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/logos/blackbox-ai.png"
                alt="BLACKBOX AI"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold text-zinc-300">BLACKBOX AI</span>
            </a>
            <a
              href="https://useslate.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/logos/slate-ai.png"
                alt="Slate AI"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-lg font-semibold text-zinc-300">Slate AI</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to{" "}
              <span className="gradient-text">build and launch</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              A complete ecosystem for entrepreneurs, makers, and founders to share, connect,
              hire, and grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const colors = colorClasses[feature.color];
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className={`group relative rounded-2xl border ${colors.border} ${colors.hover} bg-zinc-900/50 backdrop-blur-sm p-6 transition-all hover:bg-zinc-900/70`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} border ${colors.border}`}
                    >
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                          {feature.title}
                        </h3>
                        <span className={`text-xs font-medium ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full`}>
                          {feature.stats}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`absolute bottom-6 right-6 h-5 w-5 text-zinc-600 group-hover:${colors.text} group-hover:translate-x-1 transition-all`}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Builder Operating System Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400 mb-6">
              <Trophy className="h-4 w-4" />
              <span>Builder Operating System</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Your builder profile,{" "}
              <span className="gradient-text">supercharged</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Signal your availability, track your streaks, get endorsed, and climb the leaderboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {builderFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <Icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for{" "}
              <span className="gradient-text">builders who ship</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Whether you're launching your first side project or scaling your startup,
              Builders.to is your community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Entrepreneurs",
                description: "Launch your startup, find cofounders, and share your journey from day one.",
                icon: Rocket,
              },
              {
                title: "Indie Hackers",
                description: "Build in public, track MRR milestones, and connect with fellow solopreneurs.",
                icon: Zap,
              },
              {
                title: "Developers",
                description: "Showcase your side projects, import from GitHub, and get feedback from peers.",
                icon: Building2,
              },
              {
                title: "Creators",
                description: "Share your tools, courses, and products with an audience that gets it.",
                icon: Sparkles,
              },
            ].map((persona) => {
              const Icon = persona.icon;
              return (
                <div
                  key={persona.title}
                  className="text-center p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg shadow-orange-500/25">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{persona.title}</h3>
                  <p className="text-sm text-zinc-400">{persona.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Why builders choose{" "}
                  <span className="gradient-text">Builders.to</span>
                </h2>
                <ul className="space-y-4">
                  {[
                    "Share your work at any stage — no need to wait until launch",
                    "Get feedback from entrepreneurs who understand the journey",
                    "Hire verified builders with proven track records",
                    "Find cofounders, advisors, and collaborators",
                    "Track milestones and celebrate wins publicly",
                    "Build your reputation through contributions and engagement",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-zinc-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-center text-center lg:text-left lg:items-start">
                <div className="flex items-center gap-4 mb-6">
                  <div className="shadow-lg shadow-orange-500/25 rounded-xl">
                    <BuildersLogo size={64} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Builders<span className="text-orange-500">.to</span>
                    </h3>
                    <p className="text-zinc-400">Launch together.</p>
                  </div>
                </div>
                <p className="text-zinc-400 mb-8 max-w-md">
                  Join a growing community of entrepreneurs, indie hackers, and developers
                  who believe in building in public and supporting each other.
                </p>
                {session ? (
                  <Link href="/feed" className="btn-primary">
                    <Sparkles className="h-5 w-5" />
                    Go to Feed
                  </Link>
                ) : (
                  <Link href="/signin" className="btn-primary">
                    <Rocket className="h-5 w-5" />
                    Join Free Today
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to share what you're building?
          </h2>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join thousands of entrepreneurs, builders, makers, and founders who are
            building in public and launching together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <>
                <Link href="/projects/new" className="btn-primary w-full sm:w-auto">
                  <Rocket className="h-5 w-5" />
                  Share Your Project
                </Link>
                <Link href="/updates/new" className="btn-secondary w-full sm:w-auto">
                  <Sparkles className="h-5 w-5" />
                  Post an Update
                </Link>
              </>
            ) : (
              <>
                <Link href="/signin" className="btn-primary w-full sm:w-auto">
                  <Rocket className="h-5 w-5" />
                  Get Started Free
                </Link>
                <Link href="/projects" className="btn-secondary w-full sm:w-auto">
                  <Globe className="h-5 w-5" />
                  Browse Projects
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
