"use client";

interface TypingIndicatorProps {
  userNames: string[];
}

export function TypingIndicator({ userNames }: TypingIndicatorProps) {
  if (userNames.length === 0) return null;

  const text =
    userNames.length === 1
      ? `${userNames[0]} is typing`
      : userNames.length === 2
        ? `${userNames[0]} and ${userNames[1]} are typing`
        : `${userNames[0]} and ${userNames.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-zinc-400">
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
      </div>
      <span>{text}</span>
    </div>
  );
}
