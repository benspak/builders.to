import Link from "next/link";
import type { Metadata } from "next";
import {
  Award,
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  CheckCircle2,
  ArrowRight,
  Globe,
  Share2,
  Megaphone,
  Sparkles,
  Zap,
  Trophy,
  Star,
  Crown,
  Rocket,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Builder-Badge Method - Growth Hacks - Builders.to",
  description: "Learn how to build instant authority by creating a 'Top 50 Indie Builders' list and leveraging founder psychology to generate massive organic traffic.",
};

// 50 placeholder builders for the list
const topBuilders = [
  { rank: 1, name: "Alex Chen", handle: "@alexbuilds", followers: "125K", niche: "AI/ML Tools", highlight: "Built 3 profitable SaaS products" },
  { rank: 2, name: "Sarah Mitchell", handle: "@sarahcodes", followers: "98K", niche: "Developer Tools", highlight: "Open source contributor" },
  { rank: 3, name: "Marcus Johnson", handle: "@marcusj", followers: "87K", niche: "No-Code", highlight: "No-code empire builder" },
  { rank: 4, name: "Emily Wang", handle: "@emilywang", followers: "82K", niche: "E-commerce", highlight: "7-figure bootstrapper" },
  { rank: 5, name: "David Park", handle: "@davidpark", followers: "76K", niche: "Fintech", highlight: "Serial entrepreneur" },
  { rank: 6, name: "Lisa Thompson", handle: "@lisabuilds", followers: "71K", niche: "EdTech", highlight: "Building in public pioneer" },
  { rank: 7, name: "James Wilson", handle: "@jameswilson", followers: "68K", niche: "Productivity", highlight: "Productivity guru" },
  { rank: 8, name: "Nina Patel", handle: "@ninapatel", followers: "65K", niche: "Design Tools", highlight: "Designer turned founder" },
  { rank: 9, name: "Chris Rodriguez", handle: "@chrisrod", followers: "62K", niche: "Marketing Tech", highlight: "Growth hacker" },
  { rank: 10, name: "Amanda Foster", handle: "@amandaf", followers: "58K", niche: "Health Tech", highlight: "Healthcare innovator" },
  { rank: 11, name: "Ryan Kim", handle: "@ryankim", followers: "55K", niche: "DevOps", highlight: "Infrastructure wizard" },
  { rank: 12, name: "Jessica Lee", handle: "@jessicalee", followers: "52K", niche: "Social Media", highlight: "Community builder" },
  { rank: 13, name: "Michael Brown", handle: "@michaelb", followers: "49K", niche: "API Tools", highlight: "API architect" },
  { rank: 14, name: "Sophie Anderson", handle: "@sophiea", followers: "47K", niche: "Analytics", highlight: "Data-driven founder" },
  { rank: 15, name: "Kevin Zhang", handle: "@kevinz", followers: "45K", niche: "Mobile Apps", highlight: "App store success" },
  { rank: 16, name: "Rachel Green", handle: "@rachelg", followers: "43K", niche: "Content Tools", highlight: "Content creator toolsmith" },
  { rank: 17, name: "Tom Harris", handle: "@tomharris", followers: "41K", niche: "Security", highlight: "Cybersecurity expert" },
  { rank: 18, name: "Maria Garcia", handle: "@mariag", followers: "39K", niche: "HR Tech", highlight: "Future of work builder" },
  { rank: 19, name: "Daniel Smith", handle: "@daniels", followers: "37K", niche: "Real Estate Tech", highlight: "PropTech innovator" },
  { rank: 20, name: "Ashley Taylor", handle: "@ashleyt", followers: "35K", niche: "Legal Tech", highlight: "Legal automation pioneer" },
  { rank: 21, name: "Brandon Moore", handle: "@brandonm", followers: "34K", niche: "Gaming", highlight: "Indie game dev" },
  { rank: 22, name: "Olivia White", handle: "@oliviaw", followers: "33K", niche: "Fashion Tech", highlight: "Fashion-tech founder" },
  { rank: 23, name: "Justin Clark", handle: "@justinc", followers: "32K", niche: "Food Tech", highlight: "Food delivery innovator" },
  { rank: 24, name: "Hannah Lewis", handle: "@hannahl", followers: "31K", niche: "Travel Tech", highlight: "Travel startup builder" },
  { rank: 25, name: "Andrew Walker", handle: "@andreww", followers: "30K", niche: "Music Tech", highlight: "Audio tools creator" },
  { rank: 26, name: "Stephanie Hall", handle: "@stephanieh", followers: "29K", niche: "Fitness Tech", highlight: "Fitness app founder" },
  { rank: 27, name: "Patrick Allen", handle: "@patricka", followers: "28K", niche: "Video Tools", highlight: "Video editing pioneer" },
  { rank: 28, name: "Michelle Young", handle: "@michelley", followers: "27K", niche: "CRM", highlight: "Sales tools builder" },
  { rank: 29, name: "Gregory King", handle: "@gregoryk", followers: "26K", niche: "Automation", highlight: "Workflow automation expert" },
  { rank: 30, name: "Laura Wright", handle: "@lauraw", followers: "25K", niche: "Bookkeeping", highlight: "Finance automation" },
  { rank: 31, name: "Eric Scott", handle: "@erics", followers: "24K", niche: "Email Tools", highlight: "Email marketing guru" },
  { rank: 32, name: "Megan Adams", handle: "@megana", followers: "23K", niche: "SEO Tools", highlight: "SEO toolsmith" },
  { rank: 33, name: "Tyler Baker", handle: "@tylerb", followers: "22K", niche: "Podcast Tools", highlight: "Podcast tech creator" },
  { rank: 34, name: "Christina Nelson", handle: "@christinan", followers: "21K", niche: "Newsletter", highlight: "Newsletter platform builder" },
  { rank: 35, name: "Scott Hill", handle: "@scotth", followers: "20K", niche: "Survey Tools", highlight: "Research tools maker" },
  { rank: 36, name: "Jennifer Rivera", handle: "@jenniferr", followers: "19K", niche: "Scheduling", highlight: "Calendar app founder" },
  { rank: 37, name: "Brian Campbell", handle: "@brianc", followers: "18K", niche: "Project Management", highlight: "PM tool builder" },
  { rank: 38, name: "Samantha Mitchell", handle: "@samantham", followers: "17K", niche: "Collaboration", highlight: "Remote work tools" },
  { rank: 39, name: "Derek Roberts", handle: "@derekr", followers: "16K", niche: "Database", highlight: "Database wizard" },
  { rank: 40, name: "Katherine Turner", handle: "@katherinet", followers: "15K", niche: "Payments", highlight: "Payment integration expert" },
  { rank: 41, name: "Nathan Phillips", handle: "@nathanp", followers: "14K", niche: "Auth Tools", highlight: "Identity management" },
  { rank: 42, name: "Victoria Evans", handle: "@victoriae", followers: "13K", niche: "Forms", highlight: "Form builder creator" },
  { rank: 43, name: "Adam Collins", handle: "@adamc", followers: "12K", niche: "Chat Tools", highlight: "Chat app innovator" },
  { rank: 44, name: "Rebecca Stewart", handle: "@rebeccas", followers: "11K", niche: "Feedback Tools", highlight: "Customer feedback expert" },
  { rank: 45, name: "Jason Morris", handle: "@jasonm", followers: "10K", niche: "Analytics", highlight: "Metrics dashboard builder" },
  { rank: 46, name: "Lauren Rogers", handle: "@laurenr", followers: "10K", niche: "A/B Testing", highlight: "Experimentation tools" },
  { rank: 47, name: "Zachary Reed", handle: "@zacharyr", followers: "10K", niche: "Monitoring", highlight: "Uptime tools creator" },
  { rank: 48, name: "Amber Cook", handle: "@amberc", followers: "10K", niche: "Screenshots", highlight: "Visual tools builder" },
  { rank: 49, name: "Jordan Morgan", handle: "@jordanm", followers: "10K", niche: "Docs", highlight: "Documentation pioneer" },
  { rank: 50, name: "Brittany Bell", handle: "@brittanyb", followers: "10K", niche: "Onboarding", highlight: "User onboarding expert" },
];

export default function BuilderBadgeMethodPage() {
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
          <span className="text-zinc-400">The Builder-Badge Method</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/25">
              <Award className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">The Builder-Badge Method</h1>
              <p className="text-zinc-400 mt-1">Build instant authority by making others famous</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              8 min read
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              $12 cost
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              1.2M+ potential visitors
            </span>
          </div>
        </div>

        {/* Hook Section */}
        <div className="mb-12 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8">
          <p className="text-lg text-zinc-200 leading-relaxed">
            I watched a nobody become the most connected person in indie startups using one stupid trick.
            He never launched a product. Never raised a round. Just made everyone else look good and they
            showed him off for it.
          </p>
          <p className="mt-4 text-amber-400 font-semibold">
            Here&apos;s the &quot;Builder-Badge&quot; method that builds instant authority...
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
            In this guide
          </h2>
          <nav className="space-y-2">
            {[
              { href: "#the-story", label: "The Story" },
              { href: "#psychology", label: "The Psychology" },
              { href: "#how-to-replicate", label: "How to Replicate" },
              { href: "#top-50-template", label: "Top 50 Builders Template" },
              { href: "#badge-examples", label: "Badge Examples" },
              { href: "#outreach-script", label: "Outreach Script" },
              { href: "#real-examples", label: "Real Examples Working Now" },
              { href: "#cost-breakdown", label: "Cost Breakdown" },
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

            {/* The Story */}
            <section id="the-story">
              <h2 className="text-2xl font-semibold text-white mb-6">The Story</h2>

              <div className="space-y-4 leading-relaxed">
                <p>
                  This guy created a <span className="text-amber-400 font-semibold">&quot;Top 50 Indie Founders 2024&quot;</span> website
                  in 2 hours. Cost him $12 for the domain. Made it look like TechCrunch with a free template.
                </p>

                <p>Then he did something clever:</p>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 my-6">
                  <ul className="space-y-3 text-zinc-300">
                    <li className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <span>Picked 50 indie builders with <strong className="text-white">10K+ followers</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <span>Made a <strong className="text-white">&quot;badge of honor&quot;</strong> for each one</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MessageCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      <span>DMed them: <em className="text-amber-400">&quot;Congrats you made our exclusive list! Here&apos;s your builder badge&quot;</em></span>
                    </li>
                  </ul>
                </div>

                <p className="text-xl font-semibold text-white">
                  42 out of 50 posted it immediately.
                </p>
              </div>
            </section>

            {/* Results */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">Here&apos;s what happened next:</h3>

              <p className="mb-6">
                Every founder drove their audience to HIS site to see the list. He got{" "}
                <span className="text-amber-400 font-bold">1.2M visitors in 48 hours</span> from people who build the internet.
              </p>

              <p className="mb-4">But the site wasn&apos;t just a list...</p>

              <p className="mb-6">
                The entire thing was a <span className="text-amber-400">funnel for his new &quot;founder community&quot; platform</span>.
                Every page had subtle CTAs. <em>&quot;Want to join these builders? Apply for early access&quot;</em>
              </p>

              {/* Results Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <Eye className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">1.2M</div>
                  <div className="text-xs text-zinc-400">Organic visitors</div>
                </div>
                <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-center">
                  <Users className="h-6 w-6 text-violet-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">42</div>
                  <div className="text-xs text-zinc-400">Founders promoting</div>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                  <Crown className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Authority</div>
                  <div className="text-xs text-zinc-400">Status achieved</div>
                </div>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center">
                  <DollarSign className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">$250K</div>
                  <div className="text-xs text-zinc-400">In signups</div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-6">
                <h4 className="font-semibold text-white mb-2">Within 30 days:</h4>
                <ul className="space-y-2 text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    1.2M organic visitors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    42 indie founders promoting him
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Seen as the &quot;authority&quot; who spotlights builders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    $250K in platform signups and consulting
                  </li>
                </ul>
              </div>
            </section>

            {/* Psychology Section */}
            <section id="psychology">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">The Psychology</h2>
              </div>

              <p className="leading-relaxed mb-6">The psychology is perfect:</p>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Heart className="h-6 w-6 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Founders want respect and recognition</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        They&apos;ll promote anything that boosts their street cred.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Award className="h-6 w-6 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Give someone a badge and they become your evangelist</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        The badge is social proof they earned. They HAVE to share it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start gap-4">
                    <Share2 className="h-6 w-6 text-cyan-400 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">You&apos;re not asking for promotion</h4>
                      <p className="text-sm text-zinc-400 mt-1">
                        You&apos;re GIVING them social proof. They promote themselves and amplify you by accident.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-amber-300 font-medium">
                  <strong>The trap is beautiful:</strong> The winners think they&apos;re flexing. Their followers think it&apos;s legit.
                  You position yourself as the curator without any hype or credentials.
                </p>
              </div>
            </section>

            {/* How to Replicate */}
            <section id="how-to-replicate">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Rocket className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">How to Replicate This</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold text-white">Pick a founder-heavy niche</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      SaaS, indie hackers, no-code builders, AI founders, bootstrappers—all of them work.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold text-white">Create &quot;Top X Indie Builders&quot; site</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Use a free template. Make it look professional. Add branding that feels like an authority publication.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold text-white">Make clean, builder-style badges/graphics</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Badges should be shareable on social. Design them to look prestigious.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold text-white">Include people with audiences you want</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Target 10K+ followers minimum. They have reach but still appreciate recognition.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">5</span>
                  <div>
                    <h4 className="font-semibold text-white">Notify winners they&apos;ve been selected</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Personal DM with their badge attached. Make them feel special.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">6</span>
                  <div>
                    <h4 className="font-semibold text-white">Site becomes funnel for your service/community</h4>
                    <p className="text-sm text-zinc-400 mt-1">
                      Subtle CTAs everywhere. &quot;Want to join these builders?&quot; &quot;Apply for early access&quot;
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Top 50 Template */}
            <section id="top-50-template">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Top 50 Indie Builders 2026</h2>
              </div>

              <p className="mb-6 text-zinc-400">
                Here&apos;s a template with 50 placeholder entries. Replace with real builders from your target niche:
              </p>

              {/* Builder List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-800 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-zinc-500">
                {topBuilders.map((builder) => (
                  <div
                    key={builder.rank}
                    className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-amber-500/30 hover:bg-zinc-900 transition-all"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 font-bold text-sm ${
                      builder.rank <= 3
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                        : builder.rank <= 10
                          ? 'bg-zinc-700 text-amber-400'
                          : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      #{builder.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{builder.name}</span>
                        <span className="text-sm text-zinc-500">{builder.handle}</span>
                        {builder.rank <= 3 && <Star className="h-4 w-4 text-amber-400" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-500">{builder.followers} followers</span>
                        <span className="text-xs text-amber-500/70">{builder.niche}</span>
                        <span className="text-xs text-zinc-600 hidden sm:inline">• {builder.highlight}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Award className="h-4 w-4 text-amber-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-zinc-500 mb-4">
                  This list is a template. Build your own with real builders from your niche!
                </p>
                <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-orange-700">
                  <Zap className="h-4 w-4" />
                  Want to join these builders? Apply for early access
                </button>
              </div>
            </section>

            {/* Badge Examples */}
            <section id="badge-examples">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20">
                  <Award className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Badge Examples</h2>
              </div>

              <p className="mb-6 text-zinc-400">
                Create badges that founders will be proud to display. Here are some design concepts:
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Badge 1 */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-white">TOP 50</h4>
                  <p className="text-xs text-amber-400 uppercase tracking-wider">Indie Builder 2026</p>
                  <div className="mt-3 text-[10px] text-zinc-500">Verified by IndieRank.co</div>
                </div>

                {/* Badge 2 */}
                <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-600">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-white">ELITE</h4>
                  <p className="text-xs text-violet-400 uppercase tracking-wider">Startup Builder</p>
                  <div className="mt-3 text-[10px] text-zinc-500">BuilderElite.com</div>
                </div>

                {/* Badge 3 */}
                <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-white">RECOGNIZED</h4>
                  <p className="text-xs text-emerald-400 uppercase tracking-wider">SaaS Maker</p>
                  <div className="mt-3 text-[10px] text-zinc-500">SaaSMakers.io</div>
                </div>
              </div>
            </section>

            {/* Outreach Script */}
            <section id="outreach-script">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20">
                  <Megaphone className="h-5 w-5 text-rose-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Outreach Script</h2>
              </div>

              <p className="mb-6 text-zinc-400">
                Here&apos;s the exact DM script template that gets 80%+ response rates:
              </p>

              <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 font-mono text-sm">
                <div className="text-zinc-400 mb-4">// DM Template</div>
                <div className="space-y-4 text-zinc-200">
                  <p>Hey <span className="text-amber-400">[Name]</span>! 👋</p>
                  <p>
                    Congrats—you&apos;ve been selected for our <span className="text-amber-400">Top 50 Indie Builders of 2026</span> list!
                  </p>
                  <p>
                    We reviewed hundreds of builders and you stood out for <span className="text-amber-400">[specific reason: your work on X / your growth with Y / your community building]</span>.
                  </p>
                  <p>
                    Here&apos;s your exclusive builder badge: <span className="text-cyan-400">[image]</span>
                  </p>
                  <p>
                    Your profile is live here: <span className="text-cyan-400">[link to their profile on your site]</span>
                  </p>
                  <p>
                    Feel free to share it—you earned it! 🏆
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4">
                <p className="text-rose-300 text-sm">
                  <strong>Pro tip:</strong> Personalize the &quot;specific reason&quot; for each person. Generic messages get ignored.
                  Mention something specific about their product or recent achievement.
                </p>
              </div>
            </section>

            {/* Real Examples */}
            <section id="real-examples">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                  <Globe className="h-5 w-5 text-orange-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Real Examples Working Now</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-white">&quot;Top Indie SaaS Makers 2025&quot;</h4>
                      <p className="text-sm text-zinc-400 mt-1">Funneling to a SaaS community platform</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-white">&quot;Most Active Bootstrappers&quot;</h4>
                      <p className="text-sm text-zinc-400 mt-1">Driving founder coaching service signups</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-white">&quot;Elite Startup Builders List&quot;</h4>
                      <p className="text-sm text-zinc-400 mt-1">Building a collaboration platform waitlist</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                  </div>
                </div>
              </div>
            </section>

            {/* Cost Breakdown */}
            <section id="cost-breakdown">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Cost Breakdown</h2>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                  <DollarSign className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">$12</div>
                  <div className="text-xs text-zinc-400">Domain cost</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                  <Clock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">1 Weekend</div>
                  <div className="text-xs text-zinc-400">Time investment</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-violet-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">Instant</div>
                  <div className="text-xs text-zinc-400">Authority status</div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">The Final Truth</h3>
                <p className="text-zinc-300">
                  Everyone promotes your site to see their name. You get thousands of visitors who now see you as the
                  <span className="text-amber-400 font-semibold"> go-to connector for builders</span>.
                </p>
                <p className="mt-4 text-lg font-semibold text-amber-400">
                  This is how unknown indie founders become kingmakers overnight.
                </p>
                <p className="mt-2 text-zinc-400">
                  Not by building the best product—but by deciding <span className="text-white font-semibold">WHO BUILDS</span>.
                </p>
              </div>
            </section>

            {/* CTA */}
            <section className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Become a Kingmaker?</h3>
              <p className="text-zinc-300 mb-6 max-w-lg mx-auto">
                Join Builders.to and connect with the indie founders you want to recognize.
                Build your authority by celebrating others.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-orange-600 hover:to-amber-700"
                >
                  <Rocket className="h-4 w-4" />
                  Get Started Free
                </Link>
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  <Users className="h-4 w-4" />
                  Browse Builders
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
