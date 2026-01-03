"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  CheckCheck,
  PartyPopper,
  Trophy,
  Mail,
  Heart,
  Loader2
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  read: boolean;
  createdAt: string;
  actorName?: string | null;
  actorImage?: string | null;
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
  update?: {
    id: string;
    user?: {
      slug?: string | null;
    } | null;
  } | null;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10");
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

  // Fetch on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark notification as read
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

  // Mark all as read
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

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MILESTONE_LIKED":
        return <PartyPopper className="h-4 w-4 text-amber-400" />;
      case "MILESTONE_CELEBRATED":
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case "UPDATE_LIKED":
        return <Heart className="h-4 w-4 text-rose-400" />;
      case "WEEKLY_DIGEST":
        return <Mail className="h-4 w-4 text-blue-400" />;
      default:
        return <Bell className="h-4 w-4 text-zinc-400" />;
    }
  };

  // Get notification link
  const getNotificationLink = (notification: Notification): string | null => {
    // Link to project for milestone notifications
    if (notification.feedEvent?.milestone?.project?.slug) {
      return `/projects/${notification.feedEvent.milestone.project.slug}`;
    }
    // Link to feed page for update notifications (updates are shown in the feed)
    if (notification.update?.user?.slug) {
      return `/profile/${notification.update.user.slug}`;
    }
    if (notification.type === "UPDATE_LIKED") {
      return `/feed`;
    }
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
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
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-y-auto">
            {initialLoad ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const content = (
                    <div
                      className={cn(
                        "flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer",
                        !notification.read && "bg-orange-500/5"
                      )}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      {/* Actor avatar or icon */}
                      <div className="flex-shrink-0">
                        {notification.actorImage ? (
                          <Image
                            src={notification.actorImage}
                            alt=""
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Unread indicator */}
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
                      onClick={() => setIsOpen(false)}
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

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-white/5 px-4 py-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-zinc-500 hover:text-white transition-colors w-full text-center py-1"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
