"use client";

import { useEffect, useState, useCallback } from "react";
import { RichCommentForm } from "./rich-comment-form";
import { ThreadedCommentItem } from "./threaded-comment-item";
import { MessageSquare, Loader2 } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: {
    votes: number;
  };
}

export interface ThreadedComment {
  id: string;
  content: string;
  gifUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  pollQuestion?: string | null;
  pollExpiresAt?: string | null;
  pollOptions?: PollOption[];
  votedOptionId?: string | null;
  parentId?: string | null;
  replyCount?: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string | null;
  };
  replies?: ThreadedComment[];
}

interface ThreadedCommentListProps {
  /** The endpoint type for fetching and posting comments */
  endpointType: "project" | "update" | "feed-event";
  /** The ID of the parent entity (projectId, updateId, or feedEventId) */
  entityId: string;
  /** Initial comment count (for display optimization) */
  initialCommentCount?: number;
  /** Poll vote endpoint type */
  pollVoteEndpoint?: "feed-event-comment" | "update-comment";
}

export function ThreadedCommentList({
  endpointType,
  entityId,
  pollVoteEndpoint = "feed-event-comment",
}: ThreadedCommentListProps) {
  const [comments, setComments] = useState<ThreadedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalComments, setTotalComments] = useState(0);

  // Count total comments including nested replies
  const countComments = useCallback((commentList: ThreadedComment[]): number => {
    let count = 0;
    for (const comment of commentList) {
      count += 1;
      if (comment.replies && comment.replies.length > 0) {
        count += countComments(comment.replies);
      }
    }
    return count;
  }, []);

  const getEndpointUrl = useCallback(() => {
    switch (endpointType) {
      case "project":
        return `/api/comments?projectId=${entityId}`;
      case "update":
        return `/api/updates/${entityId}/comments`;
      case "feed-event":
        return `/api/feed-events/${entityId}/comments`;
      default:
        return `/api/comments?projectId=${entityId}`;
    }
  }, [endpointType, entityId]);

  const getPostEndpoint = useCallback(() => {
    switch (endpointType) {
      case "project":
        return "/api/comments";
      case "update":
        return `/api/updates/${entityId}/comments`;
      case "feed-event":
        return `/api/feed-events/${entityId}/comments`;
      default:
        return "/api/comments";
    }
  }, [endpointType, entityId]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(getEndpointUrl());
      const data = await response.json();

      // Handle different response formats
      const commentData = data.comments || data;
      setComments(commentData);
      setTotalComments(countComments(commentData));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [getEndpointUrl, countComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmitComment(data: {
    content: string;
    imageUrl?: string | null;
    gifUrl?: string | null;
    videoUrl?: string | null;
    pollOptions?: string[];
  }) {
    const body: Record<string, unknown> = { ...data };

    // Add entity ID for project endpoint
    if (endpointType === "project") {
      body.projectId = entityId;
    }

    const response = await fetch(getPostEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to post comment");
    }

    fetchComments();
  }

  async function handleSubmitReply(
    parentId: string,
    data: {
      content: string;
      imageUrl?: string | null;
      gifUrl?: string | null;
      videoUrl?: string | null;
      pollOptions?: string[];
    }
  ) {
    const body: Record<string, unknown> = { ...data, parentId };

    // Add entity ID for project endpoint
    if (endpointType === "project") {
      body.projectId = entityId;
    }

    const response = await fetch(getPostEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to post reply");
    }

    fetchComments();
  }

  return (
    <div id="comments" className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-semibold text-white">
          Comments {totalComments > 0 && `(${totalComments})`}
        </h2>
      </div>

      {/* Comment Form */}
      <RichCommentForm
        onSubmit={handleSubmitComment}
        placeholder="Share your thoughts... Use @ to mention someone"
      />

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <ThreadedCommentItem
              key={comment.id}
              comment={comment}
              onDeleted={fetchComments}
              onUpdated={fetchComments}
              onReply={handleSubmitReply}
              pollVoteEndpoint={pollVoteEndpoint}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
