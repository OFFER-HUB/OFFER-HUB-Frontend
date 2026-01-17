"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { StarRating } from "@/components/ui/StarRating";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { addClientRating } from "@/data/rating.data";
import type { ServiceOrder } from "@/types/service.types";

interface RateClientModalProps {
  order: ServiceOrder;
  serviceTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MIN_COMMENT_LENGTH = 20;
const MAX_COMMENT_LENGTH = 500;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function RateClientModal({
  order,
  serviceTitle,
  onClose,
  onSuccess,
}: RateClientModalProps): React.JSX.Element {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  function validate(): boolean {
    const newErrors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    if (!comment.trim()) {
      newErrors.comment = "Please add a comment";
    } else if (comment.trim().length < MIN_COMMENT_LENGTH) {
      newErrors.comment = `Comment must be at least ${MIN_COMMENT_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add rating to mock data
    addClientRating({
      id: `client-rating-${Date.now()}`,
      orderId: order.id,
      clientId: order.clientId,
      clientName: order.clientName,
      serviceId: order.serviceId,
      serviceTitle,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          NEUMORPHIC_CARD,
          "relative w-full max-w-lg animate-scale-in"
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-lg",
            "text-text-secondary hover:text-text-primary hover:bg-background",
            "transition-colors cursor-pointer"
          )}
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary">Rate Client</h2>
          <p className="text-text-secondary mt-1">
            Share your experience working with {order.clientName}
          </p>
        </div>

        {/* Client info */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-background mb-6">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              "bg-primary text-white font-semibold"
            )}
          >
            {order.clientAvatar}
          </div>
          <div>
            <p className="font-medium text-text-primary">{order.clientName}</p>
            <p className="text-sm text-text-secondary">{serviceTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-3">
              How was your experience?
            </label>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-text-secondary mt-2">
                {RATING_LABELS[rating]}
              </p>
            )}
            {errors.rating && (
              <p className="text-error text-sm text-center mt-2">{errors.rating}</p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Your review
            </label>
            <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                placeholder="Describe your experience working with this client..."
                rows={4}
                className={cn(
                  "w-full p-4 bg-transparent resize-none",
                  "text-text-primary placeholder:text-text-secondary/60",
                  "outline-none"
                )}
              />
            </div>
            <div className="flex justify-between mt-2">
              {errors.comment ? (
                <p className="text-error text-sm">{errors.comment}</p>
              ) : (
                <p className="text-text-secondary text-sm">
                  Min {MIN_COMMENT_LENGTH} characters
                </p>
              )}
              <p className="text-text-secondary text-sm">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium",
                "text-text-secondary hover:text-text-primary",
                "bg-background hover:bg-gray-100",
                "transition-colors cursor-pointer"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(PRIMARY_BUTTON, "flex-1")}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Rating"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
