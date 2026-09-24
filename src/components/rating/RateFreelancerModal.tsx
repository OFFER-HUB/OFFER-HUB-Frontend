"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { StarRating } from "@/components/ui/StarRating";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";

interface RateFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  freelancerName: string;
  offerTitle: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const MIN_COMMENT_LENGTH = 10;

function validateForm(rating: number, comment: string): string | null {
  if (rating === 0) return "Please select a rating";
  if (comment.trim().length < MIN_COMMENT_LENGTH) {
    return `Please provide a comment (at least ${MIN_COMMENT_LENGTH} characters)`;
  }
  return null;
}

export function RateFreelancerModal({
  isOpen,
  onClose,
  onSubmit,
  freelancerName,
  offerTitle,
}: RateFreelancerModalProps): React.JSX.Element | null {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  function resetForm(): void {
    setRating(0);
    setComment("");
    setError("");
    setIsSuccess(false);
  }

  function handleClose(): void {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    const validationError = validateForm(rating, comment);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      setIsSuccess(true);
    } catch {
      setError("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className={cn(
          NEUMORPHIC_CARD,
          "relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-success/10">
              <Icon path={ICON_PATHS.check} size="xl" className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Thank you for your feedback!
            </h2>
            <p className="text-text-secondary mb-6">
              Your rating has been submitted successfully.
            </p>
            <button type="button" onClick={handleClose} className={PRIMARY_BUTTON}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-text-primary mb-1">
                Rate Freelancer
              </h2>
              <p className="text-text-secondary text-sm">
                How was your experience with {freelancerName}?
              </p>
            </div>

            <div className={cn("p-4 rounded-xl mb-6", NEUMORPHIC_INSET)}>
              <p className="text-text-secondary text-sm">Project</p>
              <p className="text-text-primary font-medium">{offerTitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-text-primary font-medium mb-3">
                  Your Rating
                </label>
                <div className="flex items-center gap-4">
                  <StarRating value={rating} onChange={setRating} size="lg" />
                  {rating > 0 && (
                    <span className="text-text-secondary font-medium">
                      {RATING_LABELS[rating]}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-text-primary font-medium mb-3">
                  Your Review
                </label>
                <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience working with this freelancer..."
                    rows={4}
                    className="w-full p-4 bg-transparent resize-none text-text-primary placeholder:text-text-secondary/60 outline-none"
                  />
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  {comment.length} / 500 characters
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-error/10 text-error text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={PRIMARY_BUTTON}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Rating"
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
