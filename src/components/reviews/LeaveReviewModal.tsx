"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/Icon";

interface LeaveReviewModalProps {
  freelancerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          <span
            className={
              star <= (hovered || value)
                ? "text-yellow-400"
                : "text-text-secondary opacity-40"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function LeaveReviewModal({
  freelancerId,
  isOpen,
  onClose,
  onSuccess,
}: LeaveReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errors = {
    rating: rating === 0 ? "Please select a star rating." : null,
    text:
      text.trim().length < 10
        ? "Review must be at least 10 characters."
        : null,
  };
  const isValid = !errors.rating && !errors.text;

  async function handleSubmit() {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerId, rating, text }),
      });
      if (!res.ok) throw new Error("Failed to submit review.");
      onSuccess();
      onClose();
      setRating(0);
      setText("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      {/* Dimmed overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-secondary p-6
                   shadow-[6px_6px_12px_#0a0f1a,-6px_-6px_12px_#1e2a4a]"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="review-modal-title"
            className="text-xl font-semibold text-background"
          >
            Leave a Review
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1 text-text-secondary hover:text-background
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            ✕
          </button>
        </div>

        {/* Star rating */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="mt-1 text-xs text-text-secondary">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          )}
        </div>

        {/* Review text */}
        <div className="mb-6">
          <label
            htmlFor="review-text"
            className="mb-2 block text-sm font-medium text-text-secondary"
          >
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience working with this freelancer..."
            className="w-full rounded-lg bg-[#DEEFE7]/10 border border-border p-3
                       text-sm text-background placeholder:text-text-secondary
                       focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="mt-1 text-xs text-text-secondary">
            {text.trim().length} / 10 minimum characters
          </p>
        </div>

        {/* API error */}
        {error && (
          <div role="alert" className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary
                       hover:text-background transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2
                       text-sm font-semibold text-white
                       hover:bg-[#0d7377] disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            {isSubmitting ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
