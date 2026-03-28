import { API_URL } from "@/config/api";
import type { RatingStats } from "@/types/rating.types";
import type {
  PublicFreelancerReview,
  PublicFreelancerReviewsResult,
  PublicFreelancerSummary,
  PublicReviewSort,
} from "@/types/public-freelancer.types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_FREELANCER_PUBLIC === "true";

function unwrapData<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") return null;
  if ("data" in json && json.data !== null && json.data !== undefined) {
    return json.data as T;
  }
  return json as T;
}

const MOCK_SUMMARY: Record<string, PublicFreelancerSummary> = {
  mock: {
    id: "mock",
    displayName: "Alex Morgan",
    avatarUrl: null,
    showcaseServiceId: null,
    averageRating: 4.7,
    totalReviews: 24,
    bio: "Full-stack developer focused on clear communication and fast delivery.",
  },
};

const MOCK_DIST: RatingStats["ratingDistribution"] = {
  1: 0,
  2: 1,
  3: 2,
  4: 6,
  5: 15,
};

function buildMockStats(): RatingStats {
  const dist = { ...MOCK_DIST };
  const total = dist[1] + dist[2] + dist[3] + dist[4] + dist[5];
  const weighted =
    1 * dist[1] + 2 * dist[2] + 3 * dist[3] + 4 * dist[4] + 5 * dist[5];
  const avg = total > 0 ? Math.round((weighted / total) * 10) / 10 : 0;
  return {
    averageRating: avg,
    totalRatings: total,
    ratingDistribution: dist,
  };
}

const MOCK_REVIEWS_BASE: Omit<PublicFreelancerReview, "id">[] = [
  {
    rating: 5,
    comment:
      "Exceptional work — delivered ahead of schedule and communicated clearly throughout the project.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviewerName: "Jordan Lee",
    reviewerAvatarUrl: null,
    serviceTitle: "API integration",
    response: {
      content: "Thank you! Happy to collaborate again anytime.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  },
  {
    rating: 5,
    comment: "Would hire again without hesitation.",
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    reviewerName: "Sam Rivera",
    reviewerAvatarUrl: null,
    serviceTitle: "Landing page",
    response: null,
  },
  {
    rating: 4,
    comment: "Solid delivery. Minor revisions needed but overall very satisfied.",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    reviewerName: "Casey Kim",
    reviewerAvatarUrl: null,
    serviceTitle: "Brand assets",
    response: null,
  },
];

function mockSummaryForId(id: string): PublicFreelancerSummary {
  const base = MOCK_SUMMARY.mock;
  return {
    ...base,
    id,
    displayName: id === "mock" ? base.displayName : `Freelancer ${id.slice(0, 8)}`,
  };
}

function mockReviewsResult(
  freelancerId: string,
  params: {
    page: number;
    pageSize: number;
    sort: PublicReviewSort;
    stars?: number;
  }
): PublicFreelancerReviewsResult {
  let list = MOCK_REVIEWS_BASE.map((r, i) => ({
    ...r,
    id: `mock-review-${freelancerId}-${i}`,
  }));

  if (params.stars && params.stars >= 1 && params.stars <= 5) {
    list = list.filter((r) => r.rating === params.stars);
  }

  const sorted = [...list].sort((a, b) => {
    switch (params.sort) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const totalItems = sorted.length;
  const totalPages = totalItems === 0 ? 0 : Math.max(1, Math.ceil(totalItems / params.pageSize));
  const page = totalPages === 0 ? 1 : Math.min(params.page, totalPages);
  const start = (page - 1) * params.pageSize;
  const reviews = sorted.slice(start, start + params.pageSize);

  return {
    stats: buildMockStats(),
    reviews,
    page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
  };
}

/**
 * Public freelancer profile summary (no auth).
 * GET /marketplace/freelancers/:id
 */
export async function getPublicFreelancerSummary(freelancerId: string): Promise<PublicFreelancerSummary | null> {
  if (USE_MOCK) {
    return mockSummaryForId(freelancerId);
  }

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
    const data = unwrapData<PublicFreelancerSummary>(json);
    return data;
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

  if (USE_MOCK) {
    return mockReviewsResult(freelancerId, { page, pageSize, sort, stars });
  }

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
