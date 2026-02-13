"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  CheckCheck,
  PartyPopper,
  Trophy,
  Mail,
  Heart,
  AtSign,
  Loader2,
  ArrowUp,
  MessageCircle,
  Gift,
  UserPlus,
  Handshake
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  read: boolean;
  createdAt: string;
  actorName?: string | null;
  actorImage?: string | null;
  actorSlug?: string | null;
  feedEvent?: {
    id: string;
    type: string;
    projectId?: string | null;
    milestone?: {
      project?: {
        slug?: string | null;
      } | null;
    } | null;
  } | null;
  feedEventComment?: {
    id: string;
    feedEventId: string;
  } | null;
  updateComment?: {
    id: string;
    updateId: string;
  } | null;
  update?: {
    id: string;
    user?: {
      slug?: string | null;
    } | null;
  } | null;
  project?: {
    id: string;
    slug?: string | null;
    title?: string | null;
  } | null;
}

interface NotificationListProps {
  onItemClick?: () => void;
  showMarkAllRead?: boolean;
}

export function NotificationList({ onItemClick, showMarkAllRead = true }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=20");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MILESTONE_LIKED":
        return <PartyPopper className="h-4 w-4 text-amber-400" />;
      case "MILESTONE_CELEBRATED":
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case "UPDATE_LIKED":
        return <Heart className="h-4 w-4 text-rose-400" />;
      case "UPDATE_COMMENTED":
        return <MessageCircle className="h-4 w-4 text-sky-400" />;
      case "USER_MENTIONED":
        return <AtSign className="h-4 w-4 text-orange-400" />;
      case "WEEKLY_DIGEST":
        return <Mail className="h-4 w-4 text-blue-400" />;
      case "PROJECT_UPVOTED":
        return <ArrowUp className="h-4 w-4 text-emerald-400" />;
      case "PROJECT_COMMENTED":
        return <MessageCircle className="h-4 w-4 text-sky-400" />;
      case "COMMENT_LIKED":
        return <Heart className="h-4 w-4 text-rose-400" />;
      case "FEED_EVENT_COMMENTED":
        return <MessageCircle className="h-4 w-4 text-sky-400" />;
      case "TOKEN_GIFTED":
        return <Gift className="h-4 w-4 text-emerald-400" />;
      case "USER_FOLLOWED":
        return <UserPlus className="h-4 w-4 text-violet-400" />;
      case "ACCOUNTABILITY_REQUEST":
      case "ACCOUNTABILITY_ACCEPTED":
      case "ACCOUNTABILITY_CHECK_IN":
      case "ACCOUNTABILITY_REMINDER":
        return <Handshake className="h-4 w-4 text-teal-400" />;
      default:
        return <Bell className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getNotificationLink = (notification: Notification): string | null => {
    // Accountability notifications always link to the accountability page
    if (
      notification.type === "ACCOUNTABILITY_REQUEST" ||
      notification.type === "ACCOUNTABILITY_ACCEPTED" ||
      notification.type === "ACCOUNTABILITY_CHECK_IN" ||
      notification.type === "ACCOUNTABILITY_REMINDER"
    ) {
      return "/accountability";
    }
    if (notification.type === "PROJECT_UPVOTED" && notification.project?.slug) {
      return `/projects/${notification.project.slug}`;
    }
    // Project comments link to project with anchor to the specific comment
    if ((notification.type === "PROJECT_COMMENTED" || notification.type === "COMMENT_LIKED") && notification.project?.slug) {
      if (notification.feedEventComment?.id) {
        return `/projects/${notification.project.slug}#comment-${notification.feedEventComment.id}`;
      }
      return `/projects/${notification.project.slug}`;
    }
    // Feed event comments link to feed with anchor to the specific comment
    if (notification.type === "FEED_EVENT_COMMENTED" && notification.feedEventComment?.feedEventId) {
      if (notification.feedEventComment?.id) {
        return `/feed#comment-${notification.feedEventComment.id}`;
      }
      return `/feed#event-${notification.feedEventComment.feedEventId}`;
    }
    if (notification.feedEvent?.milestone?.project?.slug) {
      return `/projects/${notification.feedEvent.milestone.project.slug}`;
    }
    if (notification.type === "UPDATE_LIKED" && notification.update?.user?.slug && notification.update?.id) {
      return `/${notification.update.user.slug}/updates/${notification.update.id}`;
    }
    // Update comments link to update with anchor to the specific comment
    if (notification.type === "UPDATE_COMMENTED" && notification.update?.user?.slug && notification.update?.id) {
      if (notification.updateComment?.id) {
        return `/${notification.update.user.slug}/updates/${notification.update.id}#comment-${notification.updateComment.id}`;
      }
      return `/${notification.update.user.slug}/updates/${notification.update.id}`;
    }
    if (notification.update?.user?.slug) {
      return `/${notification.update.user.slug}`;
    }
    if (notification.type === "USER_FOLLOWED" && notification.actorSlug) {
      return `/${notification.actorSlug}`;
    }
    if (notification.type === "USER_MENTIONED") {
      // If mentioned on a feed event comment, link to feed with comment anchor
      if (notification.feedEventComment?.id) {
        return `/feed#comment-${notification.feedEventComment.id}`;
      }
      // If mentioned on an update comment, link to the update with comment anchor
      if (notification.updateComment?.id && notification.update?.user?.slug && notification.update?.id) {
        return `/${notification.update.user.slug}/updates/${notification.update.id}#comment-${notification.updateComment.id}`;
      }
      // If mentioned on a project comment, link to the project with comment anchor
      if (notification.feedEventComment?.id && notification.project?.slug) {
        return `/projects/${notification.project.slug}#comment-${notification.feedEventComment.id}`;
      }
      if (notification.project?.slug) {
        return `/projects/${notification.project.slug}`;
      }
      return `/feed`;
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {showMarkAllRead && unreadCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="font-semibold text-white">Notifications</h3>
          <button
            onClick={markAllAsRead}
            disabled={loading}
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCheck className="h-3 w-3" />
            )}
            Mark all read
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {initialLoad ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => {
              const link = getNotificationLink(notification);
              const content = (
                <div
                  className={cn(
                    "flex gap-4 px-4 py-4 transition-colors cursor-pointer",
                    !notification.read ? "bg-orange-500/5 hover:bg-orange-500/10" : "hover:bg-white/5"
                  )}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                    onItemClick?.();
                  }}
                >
                  <div className="flex-shrink-0">
                    {notification.actorImage ? (
                      <div className="relative">
                        <Image
                          src={notification.actorImage}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full ring-1 ring-white/10"
                        />
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-white/10">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-100">
                      {notification.type === "UPDATE_LIKED" && notification.actorName ? (
                        <>
                          <span className="font-semibold text-white">{notification.actorName}</span>
                          {" liked your update! ❤️"}
                        </>
                      ) : (
                        <span className="font-medium text-white">{notification.title}</span>
                      )}
                    </p>
                    {notification.message && (
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                        {notification.type === "UPDATE_LIKED" && notification.message.includes(": \"")
                          ? notification.message.split(": \"")[1]?.replace(/"$/, "") || notification.message
                          : notification.message}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 mt-2">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0 self-center">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                    </div>
                  )}
                </div>
              );

              return link ? (
                <Link
                  key={notification.id}
                  href={link}
                  className="block"
                >
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
