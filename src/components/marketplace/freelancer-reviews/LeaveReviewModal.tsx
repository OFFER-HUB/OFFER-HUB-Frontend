"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { FormField } from "@/components/ui/FormField";
import type { SubmitReviewPayload } from "@/types/review.types";

export interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<SubmitReviewPayload, "orderId">) => Promise<void>;
  freelancerId: string;
  freelancerName: string;
  orderTitle: string;
  serviceTitle?: string;
}

function StarRating({ 
  rating, 
  onRatingChange, 
  disabled = false 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void; 
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          className={cn(
            "text-2xl transition-all duration-200 hover:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded",
            star <= rating 
              ? "text-amber-500" 
              : "text-text-secondary/25 hover:text-text-secondary/50",
            disabled && "cursor-not-allowed"
          )}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          aria-checked={star <= rating}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function LeaveReviewModal({
  isOpen,
  onClose,
  onSubmit,
  freelancerId,
  freelancerName,
  orderTitle,
  serviceTitle,
}: LeaveReviewModalProps): React.JSX.Element | null {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Review comment is required';
    } else if (comment.length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    } else if (comment.length > 1000) {
      newErrors.comment = 'Review must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        revieweeId: freelancerId,
        revieweeName: freelancerName,
        orderTitle,
        serviceTitle,
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      // Error handling would be shown via toast/notifications in real implementation
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setRating(0);
    setComment('');
    setErrors({});
    onClose();
  }

  const ratingLabels = [
    '',
    'Poor - Very unsatisfied',
    'Fair - Somewhat unsatisfied', 
    'Good - Satisfied',
    'Very Good - Very satisfied',
    'Excellent - Completely satisfied'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div
        className={cn(
          "relative w-full max-w-2xl animate-scale-in p-6 max-h-[90vh] overflow-y-auto",
          "rounded-3xl bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Leave a Review</h2>
            <p className="text-sm text-text-secondary mt-1">{freelancerName}</p>
            <p className="text-xs text-text-secondary mt-1">Order: {orderTitle}</p>
            {serviceTitle && (
              <p className="text-xs text-text-secondary mt-1">Service: {serviceTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            aria-label="Close"
          >
            <Icon path={ICON_PATHS.close} size="md" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <FormField
            label="Rating"
            error={errors.rating}
            hint="How would you rate your experience working with this freelancer?"
          >
            <div className="space-y-2">
              <StarRating 
                rating={rating} 
                onRatingChange={setRating} 
                disabled={isSubmitting}
              />
              {rating > 0 && (
                <p className="text-sm text-text-secondary italic">
                  {ratingLabels[rating]}
                </p>
              )}
            </div>
          </FormField>

          {/* Comment */}
          <FormField
            label="Review"
            error={errors.comment}
            hint="Share your experience working with this freelancer (minimum 10 characters)"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              disabled={isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-xl resize-none bg-background",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "text-text-primary placeholder-text-secondary/50 focus:outline-none",
                errors.comment && "border-2 border-error"
              )}
              placeholder="I worked with this freelancer on... The experience was..."
            />
            <p className="text-xs text-text-secondary mt-1">
              {comment.length}/1000 characters
            </p>
          </FormField>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium",
                "text-text-secondary hover:text-text-primary",
                "bg-background hover:bg-gray-100 transition-colors",
                "disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium text-white",
                "bg-primary hover:bg-primary-hover transition-colors",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Submitting...</span>
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
