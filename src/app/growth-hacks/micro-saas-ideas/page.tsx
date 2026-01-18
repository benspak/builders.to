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
  Code,
  Zap,
  Bot,
  Mail,
  BarChart3,
  FileText,
  Globe,
  ShoppingCart,
  Video,
  Calendar,
  Shield,
  Database,
  Smartphone,
  Palette,
  MessageCircle,
  Search,
  Bell,
  Link as LinkIcon,
  Image,
  Headphones,
  BookOpen,
  Briefcase,
  Home,
  Heart,
  Star,
  Coffee,
} from "lucide-react";

export const metadata: Metadata = {
  title: "50 Micro-SaaS Ideas You Can Build and Launch in 30 Days - Builders.to",
  description: "A curated list of 50 micro-SaaS ideas for indie hackers. Each idea is validated, achievable in 30 days, and has real revenue potential. Find your next project.",
  keywords: ["micro saas ideas", "saas ideas 2026", "indie hacker project ideas", "side project ideas", "startup ideas", "small saas ideas"],
};

// Define the 50 ideas organized by category
const categories = [
  {
    name: "AI & Automation",
    icon: Bot,
    color: "violet",
    ideas: [
      {
        id: 1,
        name: "AI Meeting Notes",
        description: "Auto-transcribe and summarize meetings with action items extracted",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
      {
        id: 2,
        name: "AI Code Reviewer",
        description: "GitHub bot that reviews PRs and suggests improvements",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "Low",
      },
      {
        id: 3,
        name: "AI Writing Assistant for Niche",
        description: "Specialized AI writer for real estate listings, legal docs, or job posts",
        difficulty: "Easy",
        revenue: "$500-3k/mo",
        competition: "Medium",
      },
      {
        id: 4,
        name: "AI Customer Support Trainer",
        description: "Train AI chatbots on company docs without coding",
        difficulty: "Medium",
        revenue: "$2k-20k/mo",
        competition: "High",
      },
      {
        id: 5,
        name: "Workflow Automation for [Industry]",
        description: "Zapier-like tool focused on one industry (dental, legal, real estate)",
        difficulty: "Hard",
        revenue: "$5k-50k/mo",
        competition: "Low",
      },
    ],
  },
  {
    name: "Developer Tools",
    icon: Code,
    color: "cyan",
    ideas: [
      {
        id: 6,
        name: "API Monitoring & Alerts",
        description: "Simple uptime and response time monitoring for APIs",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "High",
      },
      {
        id: 7,
        name: "Database Backup Service",
        description: "Automated backups for Postgres/MySQL with one-click restore",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "Medium",
      },
      {
        id: 8,
        name: "Environment Variable Manager",
        description: "Sync .env files across team with encryption and versioning",
        difficulty: "Easy",
        revenue: "$500-3k/mo",
        competition: "Low",
      },
      {
        id: 9,
        name: "Feature Flag Service",
        description: "Simple feature flags for small teams (LaunchDarkly alternative)",
        difficulty: "Medium",
        revenue: "$1k-5k/mo",
        competition: "Medium",
      },
      {
        id: 10,
        name: "Code Screenshot Tool",
        description: "Beautiful code screenshots for social media and docs",
        difficulty: "Easy",
        revenue: "$300-2k/mo",
        competition: "Medium",
      },
    ],
  },
  {
    name: "Content & Marketing",
    icon: FileText,
    color: "orange",
    ideas: [
      {
        id: 11,
        name: "Social Media Scheduler for [Platform]",
        description: "Focused scheduler for one platform done really well",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "High",
      },
      {
        id: 12,
        name: "Testimonial Collector",
        description: "Collect, manage, and display customer testimonials/reviews",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
      {
        id: 13,
        name: "Changelog as a Service",
        description: "Beautiful public changelogs and release notes for SaaS",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Low",
      },
      {
        id: 14,
        name: "Content Repurposing Tool",
        description: "Turn blog posts into Twitter threads, LinkedIn posts, newsletters",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
      {
        id: 15,
        name: "SEO Rank Tracker",
        description: "Simple keyword tracking without enterprise pricing",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "High",
      },
    ],
  },
  {
    name: "E-commerce & Payments",
    icon: ShoppingCart,
    color: "emerald",
    ideas: [
      {
        id: 16,
        name: "Digital Product Delivery",
        description: "Sell digital downloads with payment and secure delivery",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "High",
      },
      {
        id: 17,
        name: "Subscription Analytics",
        description: "MRR, churn, LTV dashboards for Stripe users",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "Medium",
      },
      {
        id: 18,
        name: "Invoice Generator",
        description: "Simple recurring invoices for freelancers",
        difficulty: "Easy",
        revenue: "$500-3k/mo",
        competition: "High",
      },
      {
        id: 19,
        name: "Tip Jar / Buy Me a Coffee Clone",
        description: "Let creators accept one-time and recurring tips",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "High",
      },
      {
        id: 20,
        name: "Affiliate Link Manager",
        description: "Track and manage affiliate links with analytics",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Low",
      },
    ],
  },
  {
    name: "Productivity & Collaboration",
    icon: Calendar,
    color: "amber",
    ideas: [
      {
        id: 21,
        name: "Async Video Updates",
        description: "Record and share quick video updates with your team",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "Medium",
      },
      {
        id: 22,
        name: "Meeting Scheduler for Teams",
        description: "Calendly alternative with team features and round-robin",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "High",
      },
      {
        id: 23,
        name: "Daily Standup Bot",
        description: "Async standups via Slack/Discord with reports",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
      {
        id: 24,
        name: "OKR Tracking Tool",
        description: "Simple OKR and goal tracking for small teams",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
      {
        id: 25,
        name: "Personal CRM",
        description: "Keep track of relationships and follow-ups",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Medium",
      },
    ],
  },
  {
    name: "Analytics & Data",
    icon: BarChart3,
    color: "rose",
    ideas: [
      {
        id: 26,
        name: "Privacy-First Analytics",
        description: "Simple, GDPR-compliant website analytics (Plausible clone)",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "Medium",
      },
      {
        id: 27,
        name: "Social Media Analytics",
        description: "Track growth and engagement across platforms",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "High",
      },
      {
        id: 28,
        name: "Survey & Feedback Tool",
        description: "In-app surveys and NPS tracking",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "High",
      },
      {
        id: 29,
        name: "Spreadsheet to Dashboard",
        description: "Turn Google Sheets into beautiful dashboards",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Low",
      },
      {
        id: 30,
        name: "Error Tracking Lite",
        description: "Simple error tracking for small apps (Sentry alternative)",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
    ],
  },
  {
    name: "Communication",
    icon: MessageCircle,
    color: "blue",
    ideas: [
      {
        id: 31,
        name: "Email Signature Generator",
        description: "Professional email signatures with tracking",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Medium",
      },
      {
        id: 32,
        name: "Shared Inbox for Teams",
        description: "Manage team emails without forwarding chaos",
        difficulty: "Medium",
        revenue: "$1k-10k/mo",
        competition: "Medium",
      },
      {
        id: 33,
        name: "Contact Form Backend",
        description: "Simple backend for website contact forms with spam filtering",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Medium",
      },
      {
        id: 34,
        name: "Announcement Bar Service",
        description: "Add announcement bars to any website via script",
        difficulty: "Easy",
        revenue: "$200-2k/mo",
        competition: "Low",
      },
      {
        id: 35,
        name: "SMS Reminders for Appointments",
        description: "Automated SMS reminders for small businesses",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
    ],
  },
  {
    name: "Niche & Vertical",
    icon: Target,
    color: "indigo",
    ideas: [
      {
        id: 36,
        name: "Podcast Guest Finder",
        description: "Match podcast hosts with potential guests",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Low",
      },
      {
        id: 37,
        name: "Restaurant Menu Builder",
        description: "Digital menus with QR codes for restaurants",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
      {
        id: 38,
        name: "Gym Member Check-in",
        description: "Simple member management for small gyms",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Low",
      },
      {
        id: 39,
        name: "Property Showing Scheduler",
        description: "Let real estate agents book property viewings",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "Low",
      },
      {
        id: 40,
        name: "Freelancer Contract Templates",
        description: "Legal contract templates with e-signing",
        difficulty: "Easy",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
    ],
  },
  {
    name: "Design & Media",
    icon: Palette,
    color: "pink",
    ideas: [
      {
        id: 41,
        name: "Social Media Image Generator",
        description: "Templates for OG images, Twitter cards, etc.",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Medium",
      },
      {
        id: 42,
        name: "Background Remover API",
        description: "Simple API for removing image backgrounds",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "High",
      },
      {
        id: 43,
        name: "Brand Asset Manager",
        description: "Organize and share brand assets with team/clients",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Low",
      },
      {
        id: 44,
        name: "Video Thumbnail Generator",
        description: "AI-powered thumbnail suggestions for YouTube",
        difficulty: "Medium",
        revenue: "$300-3k/mo",
        competition: "Low",
      },
      {
        id: 45,
        name: "Mockup Generator",
        description: "Product mockups for t-shirts, devices, etc.",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Medium",
      },
    ],
  },
  {
    name: "Security & Privacy",
    icon: Shield,
    color: "slate",
    ideas: [
      {
        id: 46,
        name: "Password Breach Checker",
        description: "Check if company emails appear in data breaches",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Low",
      },
      {
        id: 47,
        name: "Privacy Policy Generator",
        description: "Generate compliant privacy policies and ToS",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Medium",
      },
      {
        id: 48,
        name: "Two-Factor Auth Service",
        description: "Easy 2FA implementation for small apps",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Low",
      },
      {
        id: 49,
        name: "GDPR Compliance Checker",
        description: "Scan websites for GDPR compliance issues",
        difficulty: "Medium",
        revenue: "$500-5k/mo",
        competition: "Low",
      },
      {
        id: 50,
        name: "Secure File Sharing",
        description: "Share files with password protection and expiry",
        difficulty: "Easy",
        revenue: "$300-3k/mo",
        competition: "Medium",
      },
    ],
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  violet: { border: "border-violet-500/30", bg: "bg-violet-500/10", text: "text-violet-400", iconBg: "bg-violet-500/20" },
  cyan: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400", iconBg: "bg-cyan-500/20" },
  orange: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-400", iconBg: "bg-orange-500/20" },
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", iconBg: "bg-emerald-500/20" },
  amber: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400", iconBg: "bg-amber-500/20" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-400", iconBg: "bg-rose-500/20" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", iconBg: "bg-blue-500/20" },
  indigo: { border: "border-indigo-500/30", bg: "bg-indigo-500/10", text: "text-indigo-400", iconBg: "bg-indigo-500/20" },
  pink: { border: "border-pink-500/30", bg: "bg-pink-500/10", text: "text-pink-400", iconBg: "bg-pink-500/20" },
  slate: { border: "border-slate-500/30", bg: "bg-slate-500/10", text: "text-slate-400", iconBg: "bg-slate-500/20" },
};

export default function MicroSaaSIdeasPage() {
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
          <span className="text-zinc-400">Micro-SaaS Ideas</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">50 Micro-SaaS Ideas</h1>
              <p className="text-zinc-400 mt-1">Build and Launch in 30 Days</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              10 min read
            </span>
            <span className="flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" />
              50 Ideas
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              10 Categories
            </span>
          </div>
        </div>

        {/* Hook Section */}
        <div className="mb-12 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8">
          <p className="text-lg text-zinc-200 leading-relaxed">
            The best micro-SaaS ideas aren&apos;t revolutionary—they solve specific problems better than
            bloated alternatives. Each idea here is achievable by one person in 30 days.
          </p>
          <p className="mt-4 text-amber-400 font-semibold">
            Pick one. Validate it. Build it. Ship it.
          </p>
        </div>

        {/* How to Use This List */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">How to Use This List</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 shrink-0">
                <span className="text-orange-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Browse & Bookmark</p>
                <p className="text-xs text-zinc-400">Find ideas that match your skills</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 shrink-0">
                <span className="text-orange-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Validate First</p>
                <p className="text-xs text-zinc-400">Talk to 10 potential customers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 shrink-0">
                <span className="text-orange-400 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Build & Ship</p>
                <p className="text-xs text-zinc-400">MVP in 2-4 weeks max</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
            <Lightbulb className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">50</div>
            <div className="text-xs text-zinc-400">Ideas</div>
          </div>
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-center">
            <Target className="h-6 w-6 text-violet-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">10</div>
            <div className="text-xs text-zinc-400">Categories</div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
            <Clock className="h-6 w-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">30</div>
            <div className="text-xs text-zinc-400">Days to Ship</div>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center">
            <DollarSign className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">$500+</div>
            <div className="text-xs text-zinc-400">Revenue Potential</div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            Jump to Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const colors = colorMap[category.color];
              return (
                <a
                  key={category.name}
                  href={`#${category.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
                >
                  <category.icon className="h-3.5 w-3.5" />
                  {category.name}
                </a>
              );
            })}
          </div>
        </div>

        {/* Ideas by Category */}
        <div className="space-y-16">
          {categories.map((category) => {
            const colors = colorMap[category.color];
            return (
              <section
                key={category.name}
                id={category.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg}`}>
                    <category.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
                    <p className="text-sm text-zinc-500">{category.ideas.length} ideas</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className={`rounded-xl border ${colors.border} bg-zinc-900/50 p-5 hover:bg-zinc-900 transition-colors`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} shrink-0`}>
                          <span className={`text-sm font-bold ${colors.text}`}>#{idea.id}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white">{idea.name}</h3>
                          <p className="text-sm text-zinc-400 mt-1">{idea.description}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                              <Zap className="h-3 w-3" />
                              {idea.difficulty}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                              <DollarSign className="h-3 w-3" />
                              {idea.revenue}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                              <Users className="h-3 w-3" />
                              Competition: {idea.competition}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* What Makes a Good Micro-SaaS */}
        <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">What Makes a Good Micro-SaaS?</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Solves a Specific Problem</h4>
                <p className="text-sm text-zinc-400">Not everything for everyone. One pain point, solved well.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Can Be Built by One Person</h4>
                <p className="text-sm text-zinc-400">No team needed. Manageable scope that one developer can maintain.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Recurring Revenue Model</h4>
                <p className="text-sm text-zinc-400">Monthly subscriptions beat one-time purchases for sustainability.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Existing Demand</h4>
                <p className="text-sm text-zinc-400">People already searching for solutions. Don&apos;t educate a market.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-semibold text-white">Low Customer Support</h4>
                <p className="text-sm text-zinc-400">Self-serve product that doesn&apos;t require constant hand-holding.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Checklist */}
        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Before You Build: Validation Checklist</h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-600 bg-zinc-800 group-hover:border-amber-500/50 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-zinc-300 text-sm">Found 10+ people who have this problem</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-600 bg-zinc-800 group-hover:border-amber-500/50 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-zinc-300 text-sm">Confirmed they&apos;re actively looking for solutions</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-600 bg-zinc-800 group-hover:border-amber-500/50 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-zinc-300 text-sm">They expressed willingness to pay (not just &quot;cool idea&quot;)</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-600 bg-zinc-800 group-hover:border-amber-500/50 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-zinc-300 text-sm">Researched existing solutions and found gaps</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-600 bg-zinc-800 group-hover:border-amber-500/50 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-zinc-300 text-sm">Can build MVP in 4 weeks or less</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex h-5 w-5 items-center justify-center rounded border border-zinc-600 bg-zinc-800 group-hover:border-amber-500/50 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400 opacity-0 group-hover:opacity-50" />
              </div>
              <span className="text-zinc-300 text-sm">Know exactly where to find customers</span>
            </label>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Found Your Idea?</h3>
          <p className="text-zinc-300 mb-6 max-w-lg mx-auto">
            Start building and share your progress on Builders.to. Track your journey from
            idea to launched product, and connect with other indie hackers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-700"
            >
              <Rocket className="h-4 w-4" />
              Start Your Project
            </Link>
            <Link
              href="/how-to/idea-to-first-customer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
            >
              <ArrowRight className="h-4 w-4" />
              Read the Launch Guide
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
