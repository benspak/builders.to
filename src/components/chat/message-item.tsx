"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User, MessageSquareText, SmilePlus, Pin, Bookmark,
  MoreHorizontal, Pencil, Trash2, Copy,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { ReactionBar } from "./reaction-bar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface ChatMessageData {
  id: string;
  content: string;
  type: string;
  gifUrl: string | null;
  imageUrl: string | null;
  codeSnippet: string | null;
  codeLanguage: string | null;
  isPinned: boolean;
  isDeleted: boolean;
  editedAt: string | null;
  createdAt: string;
  senderId: string;
  channelId: string;
  threadParentId: string | null;
  sender: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    image: string | null;
    slug: string | null;
  };
  reactions: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: { id: string; name: string | null; firstName: string | null; lastName: string | null };
  }>;
  _count?: { threadReplies: number };
  poll?: {
    id: string;
    question: string;
    allowMultiple: boolean;
    expiresAt: string | null;
    options: Array<{ id: string; text: string; _count: { votes: number } }>;
  } | null;
}

interface MessageItemProps {
  message: ChatMessageData;
  currentUserId: string;
  onOpenThread?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onBookmark?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  isThreadReply?: boolean;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

export function MessageItem({
  message,
  currentUserId,
  onOpenThread,
  onReact,
  onPin,
  onBookmark,
  onDelete,
  onEdit,
  isThreadReply = false,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwn = message.senderId === currentUserId;
  const senderName = message.sender.firstName && message.sender.lastName
    ? `${message.sender.firstName} ${message.sender.lastName}`
    : message.sender.name || "User";

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent);
    }
    setIsEditing(false);
  };

  if (message.isDeleted) {
    return (
      <div className="flex items-start gap-3 px-4 py-1 opacity-50">
        <div className="h-8 w-8" />
        <p className="text-xs italic text-zinc-500">This message was deleted</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-1.5 hover:bg-white/[0.02] transition-colors relative",
        message.isPinned && "bg-yellow-500/5 border-l-2 border-yellow-500/50"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
        setShowMore(false);
      }}
    >
      {/* Avatar */}
      <Link href={message.sender.slug ? `/${message.sender.slug}` : "#"} className="flex-shrink-0 mt-0.5">
        {message.sender.image ? (
          <Image src={message.sender.image} alt={senderName} width={32} height={32} className="h-8 w-8 rounded-full" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
            <User className="h-4 w-4 text-zinc-400" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <Link href={message.sender.slug ? `/${message.sender.slug}` : "#"} className="text-sm font-medium text-white hover:underline">
            {senderName}
          </Link>
          <span className="text-[10px] text-zinc-500">{formatRelativeTime(message.createdAt)}</span>
          {message.editedAt && <span className="text-[10px] text-zinc-600">(edited)</span>}
          {message.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
        </div>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none resize-none"
              rows={2}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEdit(); } if (e.key === "Escape") setIsEditing(false); }}
            />
            <div className="flex gap-2 mt-1 text-xs">
              <button onClick={handleEdit} className="text-cyan-400 hover:text-cyan-300">Save</button>
              <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-300">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-zinc-300 break-words prose prose-invert prose-sm max-w-none prose-p:my-0 prose-a:text-cyan-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>

            {message.codeSnippet && (
              <pre className="mt-2 rounded-lg bg-zinc-800/80 border border-white/5 p-3 overflow-x-auto">
                <code className="text-xs text-zinc-300">{message.codeSnippet}</code>
              </pre>
            )}

            {message.gifUrl && (
              <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={message.gifUrl} alt="GIF" className="w-full h-auto max-h-48 object-contain" />
              </div>
            )}

            {message.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
                <Image src={message.imageUrl} alt="Image" width={400} height={300} className="w-full h-auto object-cover" />
              </div>
            )}

            {/* Poll */}
            {message.poll && (
              <div className="mt-2 rounded-lg border border-white/10 bg-zinc-800/30 p-3">
                <p className="text-sm font-medium text-white mb-2">{message.poll.question}</p>
                <div className="space-y-1">
                  {message.poll.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <div className="flex-1 rounded-md bg-zinc-700/50 px-3 py-1.5 text-xs text-zinc-300">
                        {opt.text}
                      </div>
                      <span className="text-xs text-zinc-500">{opt._count.votes}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Reactions */}
        <ReactionBar
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggle={(emoji) => onReact?.(message.id, emoji)}
        />

        {/* Thread indicator */}
        {!isThreadReply && message._count && message._count.threadReplies > 0 && (
          <button
            onClick={() => onOpenThread?.(message.id)}
            className="flex items-center gap-1.5 mt-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            {message._count.threadReplies} {message._count.threadReplies === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Hover actions */}
      {showActions && !isEditing && (
        <div className="absolute top-0 right-4 -translate-y-1/2 flex items-center gap-0.5 rounded-lg border border-white/10 bg-zinc-800 px-1 py-0.5 shadow-lg">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="React"
          >
            <SmilePlus className="h-3.5 w-3.5" />
          </button>
          {!isThreadReply && (
            <button
              onClick={() => onOpenThread?.(message.id)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reply in thread"
            >
              <MessageSquareText className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => onBookmark?.(message.id)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Bookmark"
          >
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Quick reactions picker */}
      {showReactionPicker && (
        <div className="absolute top-0 right-4 -translate-y-full mb-1 flex items-center gap-0.5 rounded-lg border border-white/10 bg-zinc-800 px-1 py-0.5 shadow-lg">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onReact?.(message.id, emoji); setShowReactionPicker(false); }}
              className="p-1 rounded hover:bg-white/10 transition-colors text-sm"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* More menu */}
      {showMore && (
        <div className="absolute top-6 right-4 z-10 rounded-lg border border-white/10 bg-zinc-800 py-1 shadow-lg min-w-[140px]">
          <button
            onClick={() => { onPin?.(message.id); setShowMore(false); }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
          >
            <Pin className="h-3.5 w-3.5" />
            {message.isPinned ? "Unpin" : "Pin message"}
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(message.content); setShowMore(false); }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy text
          </button>
          {isOwn && (
            <button
              onClick={() => { setIsEditing(true); setShowMore(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          <button
            onClick={() => { onDelete?.(message.id); setShowMore(false); }}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:bg-white/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
