"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Github,
  Star,
  GitFork,
  Lock,
  Globe,
  Search,
  Loader2,
  ArrowRight,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  isPrivate: boolean;
  updatedAt: string;
  owner: string;
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Vue: "#41b883",
  CSS: "#563d7c",
  HTML: "#e34c26",
};

export function GitHubReposList() {
  const router = useRouter();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loadingReadme, setLoadingReadme] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const response = await fetch("/api/github/repos");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch repos");
      }
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch repos");
    } finally {
      setLoading(false);
    }
  };

  const fetchReadme = async (owner: string, repo: string) => {
    setLoadingReadme(true);
    try {
      const response = await fetch(`/api/github/repos/${owner}/${repo}`);
      if (response.ok) {
        const data = await response.json();
        setReadme(data.readme);
      }
    } catch {
      setReadme(null);
    } finally {
      setLoadingReadme(false);
    }
  };

  const handlePreview = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setReadme(null);
    await fetchReadme(repo.owner, repo.name);
  };

  const handleImport = (repo: GitHubRepo) => {
    const params = new URLSearchParams({
      title: repo.name,
      tagline: repo.description || "",
      githubUrl: repo.url,
      url: repo.homepage || "",
    });
    router.push(`/projects/new?${params.toString()}`);
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchRepos}
          className="mt-4 text-sm text-zinc-400 hover:text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Stats */}
      <p className="text-sm text-zinc-500">
        {filteredRepos.length} repositories found
      </p>

      {/* Repos Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredRepos.map((repo) => (
          <div
            key={repo.id}
            className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900"
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Github className="h-5 w-5 flex-shrink-0 text-zinc-400" />
                <h3 className="truncate font-semibold text-white">
                  {repo.name}
                </h3>
                {repo.isPrivate ? (
                  <Lock className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                ) : (
                  <Globe className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                )}
              </div>
            </div>

            {/* Description */}
            <p className="mb-4 line-clamp-2 text-sm text-zinc-400">
              {repo.description || "No description"}
            </p>

            {/* Meta */}
            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        languageColors[repo.language] || "#6e7681",
                    }}
                  />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {repo.stars}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {repo.forks}
              </span>
            </div>

            {/* Topics */}
            {repo.topics.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {repo.topics.slice(0, 3).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"
                  >
                    {topic}
                  </span>
                ))}
                {repo.topics.length > 3 && (
                  <span className="text-xs text-zinc-500">
                    +{repo.topics.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handlePreview(repo)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                <FileText className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={() => handleImport(repo)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                Import
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="py-12 text-center text-zinc-500">
          No repositories match your search
        </div>
      )}

      {/* Preview Modal */}
      {selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <Github className="h-6 w-6 text-zinc-400" />
                <div>
                  <h3 className="font-semibold text-white">
                    {selectedRepo.name}
                  </h3>
                  <p className="text-sm text-zinc-500">{selectedRepo.owner}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRepo(null)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="mb-6 space-y-4">
                <div>
                  <span className="text-sm text-zinc-500">Description</span>
                  <p className="text-white">
                    {selectedRepo.description || "No description"}
                  </p>
                </div>

                <div className="flex gap-6">
                  <div>
                    <span className="text-sm text-zinc-500">Stars</span>
                    <p className="flex items-center gap-1 text-white">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {selectedRepo.stars}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-zinc-500">Language</span>
                    <p className="text-white">
                      {selectedRepo.language || "—"}
                    </p>
                  </div>
                  {selectedRepo.homepage && (
                    <div>
                      <span className="text-sm text-zinc-500">Homepage</span>
                      <a
                        href={selectedRepo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-emerald-400 hover:underline"
                      >
                        {new URL(selectedRepo.homepage).hostname}
                      </a>
                    </div>
                  )}
                </div>

                {selectedRepo.topics.length > 0 && (
                  <div>
                    <span className="text-sm text-zinc-500">Topics</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedRepo.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* README */}
              <div className="border-t border-zinc-800 pt-6">
                <h4 className="mb-4 font-medium text-white">README</h4>
                {loadingReadme ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  </div>
                ) : readme ? (
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-800/50 p-4 text-sm text-zinc-300">
                    {readme}
                  </pre>
                ) : (
                  <p className="text-zinc-500">No README found</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-zinc-800 p-4">
              <button
                onClick={() => handleImport(selectedRepo)}
                className={cn(
                  "w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white",
                  "transition-colors hover:bg-emerald-500"
                )}
              >
                Import as Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


