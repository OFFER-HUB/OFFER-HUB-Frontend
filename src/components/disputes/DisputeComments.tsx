"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import { formatDateTime } from "@/lib/date-formatters";
import type { DisputeComment, DisputeStatus } from "@/types/dispute.types";

const COMMENT_ROLE_COLORS: Record<DisputeComment["authorRole"], string> = {
  client: "bg-primary/10 border-primary/20",
  freelancer: "bg-secondary/10 border-secondary/20",
  admin: "bg-warning/10 border-warning/20",
};

const COMMENT_ROLE_LABELS: Record<DisputeComment["authorRole"], string> = {
  client: "Client",
  freelancer: "Freelancer",
  admin: "Support",
};

const FILLED_PRIMARY_BUTTON = cn(
  "px-5 py-2.5 rounded-xl font-medium cursor-pointer",
  "bg-primary text-white",
  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
  "hover:bg-primary-hover",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  "transition-all duration-200"
);

interface DisputeCommentsProps {
  comments: DisputeComment[];
  status: DisputeStatus;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  commentError?: string | null;
}

export function DisputeComments({
  comments,
  status,
  newComment,
  onNewCommentChange,
  onSubmit,
  isSubmitting,
  commentError,
}: DisputeCommentsProps): React.JSX.Element {
  const canComment = status === "open" || status === "under_review";

  return (
    <div className={NEUMORPHIC_CARD}>
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Comments ({comments.length})
      </h2>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              "p-4 rounded-xl border",
              COMMENT_ROLE_COLORS[comment.authorRole]
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text-primary">{comment.author}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-background text-text-secondary">
                  {COMMENT_ROLE_LABELS[comment.authorRole]}
                </span>
              </div>
              <span className="text-text-secondary text-sm">
                {formatDateTime(comment.timestamp)}
              </span>
            </div>
            <p className="text-text-primary">{comment.content}</p>
          </div>
        ))}

        {commentError && <p className="text-error text-sm text-center">{commentError}</p>}

        {canComment && (
          <form onSubmit={onSubmit} className="mt-4">
            <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
              <textarea
                value={newComment}
                onChange={(e) => onNewCommentChange(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className={cn(
                  "w-full p-4 bg-transparent resize-none",
                  "text-text-primary placeholder:text-text-secondary/60",
                  "outline-none"
                )}
              />
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className={FILLED_PRIMARY_BUTTON}
              >
                {isSubmitting ? "Sending..." : "Send Comment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}