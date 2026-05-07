"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import { ReviewResponse } from "@/components/rating/ReviewResponse";
import { ReviewResponseForm } from "./ReviewResponseForm";
import type { PublicFreelancerReview } from "@/types/public-freelancer.types";

interface ReviewCardProps {
  review: PublicFreelancerReview;
  freelancerDisplayName: string;
  isOwnProfile?: boolean;
  onResponseSubmit?: (reviewId: string, content: string) => Promise<void>;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase() || "?";
}

function Stars({ rating }: { rating: number }): React.JSX.Element {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn("text-sm leading-none", i <= rating ? "text-amber-500" : "text-text-secondary/25")}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewCard({ 
  review, 
  freelancerDisplayName, 
  isOwnProfile = false, 
  onResponseSubmit 
}: ReviewCardProps): React.JSX.Element {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateLabel = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleResponseSubmit(content: string): Promise<void> {
    if (!onResponseSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onResponseSubmit(review.id, content);
      setShowResponseForm(false);
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className={cn(NEUMORPHIC_CARD, "space-y-3")}>
      <div className="flex gap-4">
        <div
          className={cn(
            "relative shrink-0 w-12 h-12 rounded-2xl overflow-hidden",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          {review.reviewerAvatarUrl ? (
            <Image
              src={review.reviewerAvatarUrl}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-background text-primary font-bold text-sm">
              {initials(review.reviewerName)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
            <div>
              <p className="font-semibold text-text-primary">{review.reviewerName}</p>
              {review.serviceTitle && (
                <p className="text-xs text-text-secondary mt-0.5">Service: {review.serviceTitle}</p>
              )}
            </div>
            <time dateTime={review.createdAt} className="text-sm text-text-secondary shrink-0">
              {dateLabel}
            </time>
          </div>
          <div className="mt-2">
            <Stars rating={review.rating} />
          </div>
        </div>
      </div>
      {review.comment ? (
        <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">{review.comment}</p>
      ) : null}
      {review.response ? (
        <ReviewResponse response={review.response} responderName={freelancerDisplayName} />
      ) : isOwnProfile && onResponseSubmit ? (
        <ReviewResponseForm
          isOpen={showResponseForm}
          onClose={() => setShowResponseForm(!showResponseForm)}
          onSubmit={handleResponseSubmit}
          reviewId={review.id}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </article>
  );
}
