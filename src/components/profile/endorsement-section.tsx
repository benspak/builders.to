"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, User, Loader2, X, ThumbsUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Endorser {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  slug: string | null;
  headline: string | null;
}

interface Endorsement {
  id: string;
  message: string | null;
  skill: string | null;
  createdAt: Date;
  endorser: Endorser;
}

interface EndorsementSectionProps {
  userId: string;
  endorsements: Endorsement[];
  isOwnProfile: boolean;
  hasEndorsed: boolean;
  currentUserId?: string;
}

const SKILL_OPTIONS = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Design",
  "Product",
  "Marketing",
  "Leadership",
  "DevOps",
  "AI/ML",
  "Mobile",
];

export function EndorsementSection({
  userId,
  endorsements,
  isOwnProfile,
  hasEndorsed: initialHasEndorsed,
  currentUserId,
}: EndorsementSectionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasEndorsed, setHasEndorsed] = useState(initialHasEndorsed);
  const [message, setMessage] = useState("");
  const [skill, setSkill] = useState("");
  const [error, setError] = useState("");

  const canEndorse = currentUserId && !isOwnProfile && !hasEndorsed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/endorsements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endorseeId: userId,
          message: message.trim() || null,
          skill: skill || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create endorsement");
      }

      setHasEndorsed(true);
      setShowForm(false);
      setMessage("");
      setSkill("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayName = (endorser: Endorser) => {
    return endorser.firstName && endorser.lastName
      ? `${endorser.firstName} ${endorser.lastName}`
      : endorser.name || "Builder";
  };

  // Group endorsements by skill
  const skillCounts = endorsements.reduce((acc, e) => {
    if (e.skill) {
      acc[e.skill] = (acc[e.skill] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-cyan-500" />
          <h2 className="text-xl font-semibold text-white">Endorsements</h2>
          <span className="text-sm text-zinc-500">({endorsements.length})</span>
        </div>

        {canEndorse && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            <ThumbsUp className="h-4 w-4" />
            Endorse
          </button>
        )}

        {hasEndorsed && !isOwnProfile && (
          <span className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-4 py-2 text-sm text-zinc-400">
            <Award className="h-4 w-4" />
            You endorsed this builder
          </span>
        )}
      </div>

      {/* Endorsement Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-zinc-900/50 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Write an endorsement</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Skill selection */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                What skill are you endorsing? (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkill(skill === s ? "" : s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      skill === s
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400 border"
                        : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 border hover:border-zinc-600/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-2">
                Your message (optional)
              </label>
              <textarea
                id="message"
                rows={3}
                maxLength={500}
                placeholder="Share why you're endorsing this builder..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="textarea"
              />
              <p className="mt-1 text-xs text-zinc-500">{message.length}/500 characters</p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary bg-cyan-600 hover:bg-cyan-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4" />
                    Endorse
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skill badges summary */}
      {sortedSkills.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {sortedSkills.map(([skillName, count]) => (
            <span
              key={skillName}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 px-3 py-1.5 text-xs font-medium text-zinc-300"
            >
              {skillName}
              <span className="text-cyan-400">{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* Endorsements list */}
      {endorsements.length > 0 ? (
        <div className="space-y-3">
          {endorsements.map((endorsement) => (
            <div
              key={endorsement.id}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 hover:border-cyan-500/20 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Link
                  href={endorsement.endorser.slug ? `/profile/${endorsement.endorser.slug}` : "#"}
                  className="shrink-0"
                >
                  {endorsement.endorser.image ? (
                    <Image
                      src={endorsement.endorser.image}
                      alt={getDisplayName(endorsement.endorser)}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={endorsement.endorser.slug ? `/profile/${endorsement.endorser.slug}` : "#"}
                      className="font-medium text-white hover:text-cyan-400 transition-colors"
                    >
                      {getDisplayName(endorsement.endorser)}
                    </Link>
                    {endorsement.skill && (
                      <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-xs font-medium text-cyan-400">
                        {endorsement.skill}
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">
                      {formatRelativeTime(endorsement.createdAt)}
                    </span>
                  </div>
                  {endorsement.endorser.headline && (
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {endorsement.endorser.headline}
                    </p>
                  )}
                  {endorsement.message && (
                    <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                      &ldquo;{endorsement.message}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-zinc-900/30 p-8 text-center">
          <Award className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">
            {isOwnProfile
              ? "No endorsements yet. Build great things and they'll come!"
              : "Be the first to endorse this builder!"}
          </p>
        </div>
      )}
    </section>
  );
}
