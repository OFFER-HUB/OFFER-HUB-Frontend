"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { StarRating } from "@/components/ui/StarRating";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 1000;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

interface LeaveReviewModalProps {
  isOpen: boolean;
  revieweeName: string;
  orderTitle: string;
  serviceTitle?: string;
  onClose: () => void;
  onSkip: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function LeaveReviewModal({
  isOpen,
  revieweeName,
  orderTitle,
  serviceTitle,
  onClose,
  onSkip,
  onSubmit,
}: LeaveReviewModalProps): React.JSX.Element | null {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reset = useCallback((): void => {
    setRating(0);
    setComment("");
    setError("");
    setIsSubmitting(false);
    setIsSuccess(false);
  }, []);

  const handleClose = useCallback((): void => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!isSuccess) return;

    const timeoutId = window.setTimeout(() => {
      handleClose();
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [handleClose, isSuccess]);

  if (!isOpen) {
    return null;
  }

  function handleSkip(): void {
    reset();
    onSkip();
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      setError("Please choose a star rating before submitting");
      return;
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      setError(`Please write at least ${MIN_COMMENT_LENGTH} characters about your experience`);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit(rating, comment.trim());
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className={cn(NEUMORPHIC_CARD, "relative z-10 w-full max-w-xl animate-scale-in")}>
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          aria-label="Close leave review modal"
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Icon path={ICON_PATHS.check} size="xl" className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Review submitted</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Thanks for sharing your experience with {revieweeName}.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Review completed order
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Leave a review</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Rate your experience with {revieweeName}. Reviews help build trust across OFFER HUB.
              </p>
            </div>

            <div className={cn("mb-6 rounded-2xl p-4", NEUMORPHIC_INSET)}>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Order context
              </p>
              <p className="mt-2 font-semibold text-text-primary">{orderTitle}</p>
              {serviceTitle ? (
                <p className="mt-1 text-sm text-text-secondary">Service: {serviceTitle}</p>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-text-primary">
                  Your rating
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <StarRating value={rating} onChange={setRating} size="xl" />
                  <p className="text-sm font-medium text-text-secondary">
                    {rating > 0 ? RATING_LABELS[rating] : "Tap a star to rate"}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Review comment
                </label>
                <div className={cn("rounded-2xl", NEUMORPHIC_INSET)}>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
                    rows={5}
                    placeholder="What went well? What should future clients know about this experience?"
                    className="w-full resize-none bg-transparent p-4 text-text-primary outline-none placeholder:text-text-secondary/60"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <p
                    className={cn(
                      comment.trim().length >= MIN_COMMENT_LENGTH ? "text-success" : "text-text-secondary"
                    )}
                  >
                    Minimum {MIN_COMMENT_LENGTH} characters
                  </p>
                  <p className="text-text-secondary">
                    {comment.length}/{MAX_COMMENT_LENGTH}
                  </p>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{error}</div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-xl px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(PRIMARY_BUTTON, "justify-center")}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Icon path={ICON_PATHS.star} size="sm" />
                      <span>Submit review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
