"use client";

import { UpdateItem } from "@/components/updates/update-item";
import { MilestoneEventCard } from "./milestone-event-card";
import { StatusUpdateCard } from "./status-update-card";
import { ProjectStatusChangeCard } from "./project-status-change-card";
import { ProjectCreatedCard } from "./project-created-card";
import { JobPostedCard } from "./job-posted-card";

interface DailyUpdate {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date | string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
    headline?: string | null;
  };
}

interface FeedEvent {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: Date | string;
  likesCount: number;
  hasLiked: boolean;
  projectId?: string | null;
  // For milestone events
  milestone?: {
    id: string;
    type: string;
    title?: string | null;
    achievedAt: Date | string;
    project: {
      id: string;
      slug?: string | null;
      title: string;
      imageUrl?: string | null;
      status: string;
      user: {
        id: string;
        name?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        image?: string | null;
        slug?: string | null;
      };
    };
  } | null;
  // For status update events
  user?: {
    id: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    image?: string | null;
    slug?: string | null;
    headline?: string | null;
  } | null;
  // For project status change events and project created events
  project?: {
    id: string;
    slug?: string | null;
    title: string;
    tagline?: string | null;
    imageUrl?: string | null;
    status: string;
    user: {
      id: string;
      name?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      image?: string | null;
      slug?: string | null;
    };
  } | null;
  // For job posted events
  companyRole?: {
    id: string;
    title: string;
    type: string;
    category: string;
    location?: string | null;
    isRemote: boolean;
    salaryMin?: number | null;
    salaryMax?: number | null;
    currency?: string | null;
    company: {
      id: string;
      slug?: string | null;
      name: string;
      logo?: string | null;
    };
  } | null;
}

type FeedItem =
  | { type: "update"; data: DailyUpdate }
  | { type: "milestone"; data: FeedEvent }
  | { type: "status"; data: FeedEvent }
  | { type: "projectStatusChange"; data: FeedEvent }
  | { type: "projectCreated"; data: FeedEvent }
  | { type: "jobPosted"; data: FeedEvent };

interface CombinedFeedProps {
  updates: DailyUpdate[];
  feedEvents: FeedEvent[];
  currentUserId?: string;
  showAuthor?: boolean;
}

export function CombinedFeed({
  updates,
  feedEvents,
  currentUserId,
  showAuthor = true,
}: CombinedFeedProps) {
  // Separate different event types
  const milestoneEvents = feedEvents.filter(
    (e) => e.type !== "STATUS_UPDATE" && e.type !== "PROJECT_STATUS_CHANGE" && e.type !== "PROJECT_CREATED" && e.type !== "JOB_POSTED"
  );
  const statusEvents = feedEvents.filter((e) => e.type === "STATUS_UPDATE");
  const projectStatusChangeEvents = feedEvents.filter((e) => e.type === "PROJECT_STATUS_CHANGE");
  const projectCreatedEvents = feedEvents.filter((e) => e.type === "PROJECT_CREATED");
  const jobPostedEvents = feedEvents.filter((e) => e.type === "JOB_POSTED");

  // Combine and sort by date
  const feedItems: FeedItem[] = [
    ...updates.map((u) => ({ type: "update" as const, data: u })),
    ...milestoneEvents.map((e) => ({ type: "milestone" as const, data: e })),
    ...statusEvents.map((e) => ({ type: "status" as const, data: e })),
    ...projectStatusChangeEvents.map((e) => ({ type: "projectStatusChange" as const, data: e })),
    ...projectCreatedEvents.map((e) => ({ type: "projectCreated" as const, data: e })),
    ...jobPostedEvents.map((e) => ({ type: "jobPosted" as const, data: e })),
  ].sort((a, b) => {
    const dateA = new Date(a.data.createdAt).getTime();
    const dateB = new Date(b.data.createdAt).getTime();
    return dateB - dateA;
  });

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No activity yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => {
        if (item.type === "update") {
          return (
            <UpdateItem
              key={`update-${item.data.id}`}
              update={item.data}
              currentUserId={currentUserId}
              showAuthor={showAuthor}
            />
          );
        }

        if (item.type === "status" && item.data.user) {
          return (
            <StatusUpdateCard
              key={`status-${item.data.id}`}
              event={{
                ...item.data,
                user: item.data.user,
              }}
              currentUserId={currentUserId}
            />
          );
        }

        if (item.type === "projectStatusChange" && item.data.project) {
          return (
            <ProjectStatusChangeCard
              key={`project-status-${item.data.id}`}
              event={{
                ...item.data,
                project: item.data.project,
              }}
              currentUserId={currentUserId}
            />
          );
        }

        if (item.type === "projectCreated" && item.data.project) {
          return (
            <ProjectCreatedCard
              key={`project-created-${item.data.id}`}
              event={{
                ...item.data,
                project: item.data.project,
              }}
              currentUserId={currentUserId}
            />
          );
        }

        if (item.type === "jobPosted" && item.data.companyRole) {
          return (
            <JobPostedCard
              key={`job-posted-${item.data.id}`}
              event={{
                ...item.data,
                companyRole: item.data.companyRole,
              }}
              currentUserId={currentUserId}
            />
          );
        }

        // Milestone events
        return (
          <MilestoneEventCard
            key={`milestone-${item.data.id}`}
            event={item.data}
            currentUserId={currentUserId}
          />
        );
      })}
    </div>
  );
}
