"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { NotificationList } from "./notification-list";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications?limit=1");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors active:scale-95"
        style={{ background: "var(--background-tertiary)" }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-zinc-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50 z-50 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <NotificationList onItemClick={() => setIsOpen(false)} />
          </div>
          
          <div className="border-t border-white/5 px-4 py-2">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-zinc-500 hover:text-white transition-colors w-full text-center py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
