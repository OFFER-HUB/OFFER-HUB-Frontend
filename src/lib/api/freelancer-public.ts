import { API_URL } from "@/config/api";
import type { RatingStats } from "@/types/rating.types";
import type {
  PublicFreelancerReview,
  PublicFreelancerReviewsResult,
  PublicFreelancerSummary,
  PublicReviewSort,
} from "@/types/public-freelancer.types";

function unwrapData<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") return null;
  if ("data" in json && json.data !== null && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

/**
 * Public freelancer profile summary (no auth).
 * GET /marketplace/freelancers/:id
 */
export async function getPublicFreelancerSummary(freelancerId: string): Promise<PublicFreelancerSummary | null> {
  try {
    const response = await fetch(`${API_URL}/marketplace/freelancers/${freelancerId}`, {
      next: { revalidate: 60 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const data = unwrapData<any>(json);
    if (!data) return null;
    
    return {
      id: data.id,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      showcaseServiceId: data.showcaseServiceId,
      averageRating: data.averageRating,
      totalReviews: data.totalReviews,
      bio: data.bio,
      skills: data.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || [],
    } as PublicFreelancerSummary;
  } catch {
    return null;
  }
}

export interface GetPublicFreelancerReviewsParams {
  page?: number;
  pageSize?: number;
  sort?: PublicReviewSort;
  stars?: number;
}

/**
 * Paginated public reviews + aggregate stats.
 * GET /marketplace/freelancers/:id/reviews
 */
export async function getPublicFreelancerReviews(
  freelancerId: string,
  params: GetPublicFreelancerReviewsParams = {}
): Promise<PublicFreelancerReviewsResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, params.pageSize ?? 10));
  const sort = params.sort ?? "newest";
  const stars = params.stars;

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(pageSize));
  query.set("sort", sort);
  if (stars !== undefined && stars >= 1 && stars <= 5) {
    query.set("stars", String(stars));
  }

  const response = await fetch(
    `${API_URL}/marketplace/freelancers/${freelancerId}/reviews?${query.toString()}`,
    { next: { revalidate: 30 } }
  );

  if (response.status === 404) {
    return {
      stats: {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      reviews: [],
      page: 1,
      pageSize,
      totalItems: 0,
      totalPages: 0,
    };
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || "Failed to load reviews");
  }

  const json = await response.json();
  const raw = unwrapData<{
    stats?: {
      averageRating?: number;
      totalRatings?: number;
      ratingDistribution?: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
    };
    reviews?: Array<{
      id: string;
      rating: number;
      comment: string;
      createdAt: string;
      reviewerName?: string;
      reviewer?: { name?: string; avatarUrl?: string | null };
      reviewerAvatarUrl?: string | null;
      serviceTitle?: string | null;
      response?: { content: string; createdAt: string } | null;
    }>;
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
    meta?: { page?: number; perPage?: number; total?: number; totalPages?: number };
  }>(json);

  if (!raw) {
    throw new Error("Invalid reviews response");
  }

  const meta = raw.meta;
  const totalItems = raw.totalItems ?? meta?.total ?? 0;
  const totalPages = raw.totalPages ?? meta?.totalPages ?? 0;
  const resolvedPage = raw.page ?? meta?.page ?? page;
  const resolvedSize = raw.pageSize ?? meta?.perPage ?? pageSize;

  const dist = raw.stats?.ratingDistribution ?? {};
  const ratingDistribution: RatingStats["ratingDistribution"] = {
    1: Number(dist[1] ?? 0),
    2: Number(dist[2] ?? 0),
    3: Number(dist[3] ?? 0),
    4: Number(dist[4] ?? 0),
    5: Number(dist[5] ?? 0),
  };

  const stats: RatingStats = {
    averageRating: raw.stats?.averageRating ?? 0,
    totalRatings: raw.stats?.totalRatings ?? totalItems,
    ratingDistribution,
  };

  const reviews: PublicFreelancerReview[] = (raw.reviews ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? "",
    createdAt: r.createdAt,
    reviewerName: r.reviewerName ?? r.reviewer?.name ?? "Client",
    reviewerAvatarUrl: r.reviewerAvatarUrl ?? r.reviewer?.avatarUrl ?? null,
    serviceTitle: r.serviceTitle,
    response: r.response ?? null,
  }));

  return {
    stats,
    reviews,
    page: resolvedPage,
    pageSize: resolvedSize,
    totalItems,
    totalPages,
  };
}

// ─── Public Portfolio ─────────────────────────────────────────────────────────

export interface PublicPortfolioImage {
  id: string;
  url: string;
  order: number;
}

export interface PublicPortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  projectUrl?: string | null;
  repoUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  order: number;
  createdAt: string;
  images: PublicPortfolioImage[];
}

export interface PublicPortfolioFreelancer {
  id: string;
  professionalTitle: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
}

export interface PublicPortfolioResult {
  freelancer: PublicPortfolioFreelancer;
  projects: PublicPortfolioProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getPublicFreelancerPortfolio(
  freelancerId: string,
  page = 1,
): Promise<PublicPortfolioResult | null> {
  try {
    const response = await fetch(
      `${API_URL}/marketplace/freelancers/${freelancerId}/portfolio?page=${page}&limit=20`,
      { next: { revalidate: 300 } },
    );

    if (response.status === 404) return null;
    if (!response.ok) return null;

    const json = await response.json();
    return unwrapData<PublicPortfolioResult>(json);
  } catch {
    return null;
  }
}
