"use client";

import { useEffect, useState, useCallback } from "react";
import { RichCommentForm } from "./rich-comment-form";
import { CommentItem } from "./comment-item";
import { MessageSquare, Loader2 } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: {
    votes: number;
  };
}

interface Comment {
  id: string;
  content: string;
  gifUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  pollQuestion?: string | null;
  pollExpiresAt?: string | null;
  pollOptions?: PollOption[];
  votedOptionId?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    slug: string | null;
  };
}

interface CommentListProps {
  projectId: string;
  initialCommentCount?: number;
}

export function CommentList({ projectId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?projectId=${projectId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

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
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        ...data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to post comment");
    }

    fetchComments();
  }

  return (
    <div id="comments" className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-semibold text-white">
          Comments {comments.length > 0 && `(${comments.length})`}
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
            <CommentItem
              key={comment.id}
              comment={comment}
              onDeleted={fetchComments}
              onUpdated={fetchComments}
              pollVoteEndpoint="feed-event-comment"
            />
          ))}
        </div>
      )}
    </div>
  );
}
