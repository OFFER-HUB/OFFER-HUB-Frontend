"use client";

import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewResponse, ReviewResponseForm } from "@/components/rating";
import type { OrderReview } from "@/types/review.types";

const SUBTITLES = {
  hasReview: "Feedback captured for this completed order.",
  canReview: "Share your experience after order completion.",
  waiting: "Reviews will appear here after the client submits one.",
} as const;

const PLACEHOLDERS = {
  canReview:
    "You can skip for now, but leaving a review helps future clients make informed decisions.",
  none: "No review has been submitted for this order yet.",
} as const;

function formatReviewDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function resolveSubtitle(review: OrderReview | null, canLeaveReview: boolean): string {
  if (review) return SUBTITLES.hasReview;
  return canLeaveReview ? SUBTITLES.canReview : SUBTITLES.waiting;
}

interface OrderReviewSectionProps {
  review: OrderReview | null;
  isLoading: boolean;
  /** Buyer may still rate this order. */
  canLeaveReview: boolean;
  /** Seller may still answer the review left on them. */
  canRespondToReview: boolean;
  onLeaveReview: () => void;
  onSubmitResponse: (content: string) => Promise<void>;
}

/**
 * Review attached to a finished order: the rating itself, the order context it
 * was left on, and the freelancer's reply.
 *
 * Renders three ways — loading, submitted, and nothing-yet — so the section
 * keeps its place in the layout instead of appearing late.
 */
export function OrderReviewSection({
  review,
  isLoading,
  canLeaveReview,
  canRespondToReview,
  onLeaveReview,
  onSubmitResponse,
}: OrderReviewSectionProps): React.JSX.Element {
  return (
    <section className={NEUMORPHIC_CARD}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Review</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {resolveSubtitle(review, canLeaveReview)}
          </p>
        </div>

        {canLeaveReview ? (
          <button
            type="button"
            onClick={onLeaveReview}
            className={cn(PRIMARY_BUTTON, "justify-center")}
          >
            <Icon path={ICON_PATHS.star} size="sm" />
            <span>Leave review</span>
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className={cn("mt-4 flex items-center gap-3 rounded-2xl p-4", NEUMORPHIC_INSET)}>
          <LoadingSpinner size="sm" />
          <p className="text-sm text-text-secondary">Loading review…</p>
        </div>
      ) : review ? (
        <div className={cn("mt-4 rounded-2xl p-5", NEUMORPHIC_INSET)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-text-primary">{review.reviewerName}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {formatReviewDate(review.createdAt)}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <StarRating value={review.rating} readonly size="md" />
              <span className="text-sm font-medium text-text-secondary">{review.rating}/5</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Order context
            </p>
            <p className="mt-2 font-medium text-text-primary">{review.orderTitle}</p>
            {review.serviceTitle ? (
              <p className="mt-1 text-sm text-text-secondary">Service: {review.serviceTitle}</p>
            ) : null}
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
            {review.comment}
          </p>

          {review.response ? (
            <ReviewResponse response={review.response} responderName={review.revieweeName} />
          ) : null}

          {canRespondToReview ? <ReviewResponseForm onSubmit={onSubmitResponse} /> : null}
        </div>
      ) : (
        <div className={cn("mt-4 rounded-2xl p-4", NEUMORPHIC_INSET)}>
          <p className="text-sm text-text-secondary">
            {canLeaveReview ? PLACEHOLDERS.canReview : PLACEHOLDERS.none}
          </p>
        </div>
      )}
    </section>
  );
}
