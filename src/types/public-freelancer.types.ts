import type { RatingStats } from "@/types/rating.types";
import type { ReviewResponse } from "@/types/review.types";

/** Sort options for public freelancer reviews (URL + API). */
export type PublicReviewSort = "newest" | "oldest" | "highest" | "lowest";

/** Public-facing freelancer card (marketplace profile + SEO). */
export interface PublicFreelancerSummary {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  /** Primary service for deep links from search / profile CTA. */
  showcaseServiceId: string | null;
  /** Aggregate rating if known without loading reviews. */
  averageRating: number | null;
  totalReviews: number;
  bio?: string | null;
}

/** Single review on the public reviews page. */
export interface PublicFreelancerReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  serviceTitle?: string | null;
  response?: ReviewResponse | null;
}

/** API payload for paginated reviews + stats. */
export interface PublicFreelancerReviewsResult {
  stats: RatingStats;
  reviews: PublicFreelancerReview[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
