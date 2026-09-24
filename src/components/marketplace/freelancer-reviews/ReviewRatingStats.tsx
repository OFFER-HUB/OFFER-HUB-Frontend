import Link from "next/link";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD } from "@/lib/styles";
import type { RatingStats as RatingStatsModel } from "@/types/rating.types";
import { buildFreelancerReviewsQuery } from "./reviews-url";
import type { PublicReviewSort } from "@/types/public-freelancer.types";

interface ReviewRatingStatsProps {
  freelancerId: string;
  stats: RatingStatsModel;
  selectedStars?: number;
  sort: PublicReviewSort;
  pageSize: number;
}

function StarAverage({ value }: { value: number }): React.JSX.Element {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "text-lg leading-none",
            i <= Math.round(value) ? "text-amber-500" : "text-text-secondary/30"
          )}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewRatingStats({
  freelancerId,
  stats,
  selectedStars,
  sort,
  pageSize,
}: ReviewRatingStatsProps): React.JSX.Element {
  const base = `/marketplace/freelancers/${freelancerId}/reviews`;
  const total = stats.totalRatings;

  const rowHref = (stars: number | undefined) => {
    const q = buildFreelancerReviewsQuery({
      sort,
      stars,
      page: 1,
      pageSize,
    });
    return `${base}${q}`;
  };

  return (
    <div className={cn(NEUMORPHIC_CARD, "space-y-6")}>
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">Average rating</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-4xl font-bold text-text-primary tabular-nums">
              {total > 0 ? stats.averageRating.toFixed(1) : "—"}
            </span>
            {total > 0 && <StarAverage value={stats.averageRating} />}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Based on {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">Rating distribution</p>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.ratingDistribution[star as 1 | 2 | 3 | 4 | 5];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isSelected = selectedStars === star;
          return (
            <Link
              key={star}
              href={rowHref(star)}
              scroll={false}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-1.5 -mx-2 transition-colors",
                isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-background"
              )}
            >
              <span className="text-sm text-text-secondary w-16 shrink-0">{star} star</span>
              <div className="flex-1 h-2.5 rounded-full bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/80 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-text-secondary w-10 text-right tabular-nums">{pct}%</span>
            </Link>
          );
        })}
        {selectedStars !== undefined && (
          <Link
            href={rowHref(undefined)}
            scroll={false}
            className="inline-block text-sm font-medium text-primary hover:underline mt-2"
          >
            Clear star filter
          </Link>
        )}
      </div>
    </div>
  );
}
