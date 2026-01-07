"use client";

import { NotificationList } from "@/components/notifications/notification-list";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
          <Bell className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-zinc-400">Stay updated with your projects and community</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm">
        <NotificationList showMarkAllRead={true} />
      </div>
    </div>
  );
}

