"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import { formatDateTime } from "@/lib/date-formatters";
import { COMMENT_ROLE_COLORS, COMMENT_ROLE_LABELS } from "@/constants/dispute";
import type { DisputeComment } from "@/types/dispute.types";

const FILLED_PRIMARY_BUTTON = cn(
  "px-5 py-2.5 rounded-xl font-medium cursor-pointer flex items-center gap-2 text-sm",
  "bg-primary text-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:bg-primary-hover",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-200"
);

export interface DisputeCommentThreadProps {
  comments: DisputeComment[];
  onSubmit: (content: string) => Promise<void>;
}

export function DisputeCommentThread({
  comments,
  onSubmit,
}: DisputeCommentThreadProps): React.JSX.Element {
  const [adminComment, setAdminComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adminComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(adminComment.trim());
      setAdminComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={cn("p-4 rounded-xl border", COMMENT_ROLE_COLORS[comment.authorRole])}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary text-sm">{comment.author}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-background text-text-secondary">
                {COMMENT_ROLE_LABELS[comment.authorRole]}
              </span>
            </div>
            <span className="text-text-secondary text-xs">{formatDateTime(comment.timestamp)}</span>
          </div>
          <p className="text-text-primary text-sm">{comment.content}</p>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="mt-2">
        <p className="text-xs font-semibold text-text-secondary mb-2">Add Admin Comment</p>
        <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
          <textarea
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Write a message visible to both parties..."
            rows={3}
            className={cn(
              "w-full p-4 bg-transparent resize-none",
              "text-text-primary placeholder:text-text-secondary/60",
              "outline-none text-sm"
            )}
          />
        </div>
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting || !adminComment.trim()}
            className={FILLED_PRIMARY_BUTTON}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                Sending...
              </>
            ) : (
              <>
                <Icon path={ICON_PATHS.send} size="sm" />
                Send Comment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
