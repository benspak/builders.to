"use client";

import Link from "next/link";
import { Check, User, Mail, MessageSquare, FolderPlus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingChecklistProps {
  profileComplete: boolean;
  emailVerified: boolean;
  hasPost: boolean;
  hasProject: boolean;
  className?: string;
}

const steps = [
  {
    key: "profile",
    label: "Complete your profile",
    description: "Add a username and profile photo so the community knows who you are.",
    href: "/settings",
    getDone: (p: OnboardingChecklistProps) => p.profileComplete,
  },
  {
    key: "email",
    label: "Confirm your email",
    description: "Verify your email to get notifications and secure your account.",
    href: "/settings",
    getDone: (p: OnboardingChecklistProps) => p.emailVerified,
  },
  {
    key: "post",
    label: "Make your first post",
    description: "Share an update with the community on the feed.",
    href: "/updates/new",
    getDone: (p: OnboardingChecklistProps) => p.hasPost,
  },
  {
    key: "project",
    label: "Share your first project",
    description: "Add a project so others can see what you're building.",
    href: "/projects/new",
    getDone: (p: OnboardingChecklistProps) => p.hasProject,
  },
] as const;

const stepIcons = {
  profile: User,
  email: Mail,
  post: MessageSquare,
  project: FolderPlus,
};

export function OnboardingChecklist({
  profileComplete,
  emailVerified,
  hasPost,
  hasProject,
  className,
}: OnboardingChecklistProps) {
  const props = { profileComplete, emailVerified, hasPost, hasProject };
  const allComplete = profileComplete && emailVerified && hasPost && hasProject;
  const completedCount = [profileComplete, emailVerified, hasPost, hasProject].filter(Boolean).length;

  if (allComplete) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-8 mb-8",
          className
        )}
        role="status"
        aria-label="Onboarding complete"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Check className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">You're all set</h2>
            <p className="text-sm text-zinc-400">
              You've completed the onboarding steps. Welcome to the community!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-8 mb-8",
        className
      )}
      role="list"
      aria-label={`Onboarding checklist: ${completedCount} of 4 steps complete`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Get started</h2>
        <span className="text-sm text-zinc-400" aria-live="polite">
          {completedCount}/4 complete
        </span>
      </div>

      <ul className="space-y-4" role="list">
        {steps.map((step) => {
          const done = step.getDone(props);
          const Icon = stepIcons[step.key];
          const content = (
            <>
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  done ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                )}
                aria-hidden
              >
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-medium",
                    done ? "text-zinc-400 line-through" : "text-white"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">{step.description}</p>
              </div>
              {!done && (
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
              )}
            </>
          );

          return (
            <li
              key={step.key}
              className={cn(
                "flex items-start gap-4 rounded-xl p-4 transition-colors",
                done ? "bg-white/5" : "bg-white/[0.02] hover:bg-white/5"
              )}
              role="listitem"
              aria-current={!done ? "step" : undefined}
            >
              {done ? (
                <div className="flex w-full items-start gap-4">{content}</div>
              ) : (
                <Link
                  href={step.href}
                  className="flex w-full items-start gap-4 text-left focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded-xl -m-1 p-1"
                  aria-label={`${step.label}. ${step.description}`}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
