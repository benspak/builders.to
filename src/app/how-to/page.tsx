import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, User, Clock, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "How To - Builders.to",
  description: "Learn how to use Builders.to with our step-by-step guides and tutorials.",
};

// Define all how-to articles
const articles = [
  {
    slug: "complete-your-profile",
    title: "Complete Your Profile",
    description: "Learn how to set up and optimize your Builders.to profile to connect with other builders and showcase your work.",
    readTime: "5 min read",
    icon: User,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    slug: "become-a-pro-member",
    title: "Become a Pro Member",
    description: "Discover the benefits of Builders Pro membership, including the verified badge, monthly tokens, and custom domain mapping.",
    readTime: "3 min read",
    icon: Crown,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  // Add more articles here as they are created
];

export default function HowToPage() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-400 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">How To</h1>
              <p className="text-zinc-400 mt-1">
                Step-by-step guides to help you get the most out of Builders.to
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => {
            const IconComponent = article.icon;
            return (
              <Link
                key={article.slug}
                href={`/how-to/${article.slug}`}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-orange-500/50 hover:bg-zinc-900"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${article.iconBg}`}>
                    <IconComponent className={`h-6 w-6 ${article.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      {article.readTime}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-orange-500/20 transition-all" />
              </Link>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Need more help?
          </h3>
          <p className="text-zinc-400 mb-4">
            Join our community to get answers to your questions and connect with other builders.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://x.com/i/communities/1943895831322439993"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              X Community
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
