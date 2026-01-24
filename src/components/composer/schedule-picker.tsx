"use client";

import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulePickerProps {
  scheduledAt: Date | null;
  onScheduleChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function SchedulePicker({
  scheduledAt,
  onScheduleChange,
  disabled = false,
}: SchedulePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Format for datetime-local input
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get minimum date (now + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return formatDateTimeLocal(now);
  };

  // Format display date
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onScheduleChange(new Date(e.target.value));
    }
  };

  const clearSchedule = () => {
    onScheduleChange(null);
    setShowPicker(false);
  };

  if (scheduledAt) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          Scheduled for {formatDisplayDate(scheduledAt)}
        </span>
        <button
          type="button"
          onClick={clearSchedule}
          disabled={disabled}
          className="ml-auto p-1 hover:bg-primary/20 rounded transition-colors"
        >
          <X className="w-4 h-4 text-primary" />
        </button>
      </div>
    );
  }

  if (showPicker) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <input
          type="datetime-local"
          min={getMinDateTime()}
          onChange={handleDateChange}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm focus:outline-none"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShowPicker(false)}
          className="p-1 hover:bg-background rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowPicker(true)}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Clock className="w-4 h-4" />
      Schedule for later
    </button>
  );
}
