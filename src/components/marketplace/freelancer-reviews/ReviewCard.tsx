import Image from "next/image";

import { ReviewResponse } from "@/components/rating/ReviewResponse";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { PublicFreelancerReview } from "@/types/public-freelancer.types";

import { FreelancerReviewsActions } from "./FreelancerReviewsActions";

interface ReviewCardProps {
  review: PublicFreelancerReview;
  freelancerDisplayName: string;
  freelancerId: string;
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
          className={cn(
            "text-sm leading-none",
            i <= rating ? "text-amber-500" : "text-text-secondary/25"
          )}
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
  freelancerId,
}: ReviewCardProps): React.JSX.Element {
  const dateLabel = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className={cn(NEUMORPHIC_CARD, "space-y-3")}>
      <div className="flex gap-4">
        <div
          className={cn(
            "relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          {review.reviewerAvatarUrl ? (
            <Image
              src={review.reviewerAvatarUrl}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background text-sm font-bold text-primary">
              {initials(review.reviewerName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-text-primary">{review.reviewerName}</p>
              {review.serviceTitle ? (
                <p className="mt-0.5 text-xs text-text-secondary">Service: {review.serviceTitle}</p>
              ) : null}
            </div>

            <time dateTime={review.createdAt} className="shrink-0 text-sm text-text-secondary">
              {dateLabel}
            </time>
          </div>

          <div className="mt-2">
            <Stars rating={review.rating} />
          </div>
        </div>
      </div>

      {review.comment ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          {review.comment}
        </p>
      ) : null}

      {review.response ? (
        <ReviewResponse response={review.response} responderName={freelancerDisplayName} />
      ) : null}

      <FreelancerReviewsActions review={review} freelancerId={freelancerId} />
    </article>
  );
}