import { API_URL } from "@/config/api";
import type { OrderReview, ReviewResponse, SubmitReviewPayload } from "@/types/review.types";

const STORAGE_KEY = "offer-hub-order-reviews";

type ReviewsStorage = Record<string, OrderReview>;
type ReviewApiError = Error & { status?: number };

function createReviewError(message: string, status?: number): ReviewApiError {
  const error = new Error(message) as ReviewApiError;
  error.status = status;
  return error;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredReviews(): ReviewsStorage {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReviewsStorage;
  } catch {
    return {};
  }
}

function writeStoredReviews(reviews: ReviewsStorage): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function upsertStoredReview(review: OrderReview): OrderReview {
  const reviews = readStoredReviews();
  reviews[review.orderId] = review;
  writeStoredReviews(reviews);
  return review;
}

function getStoredOrderReview(orderId: string): OrderReview | null {
  return readStoredReviews()[orderId] ?? null;
}

function shouldUseFallback(status?: number): boolean {
  return status === 404 || status === 405 || status === 501 || status === 503;
}

function unwrapReview(json: unknown): OrderReview | null {
  if (!json || typeof json !== "object") return null;

  if ("data" in json && json.data) {
    return json.data as OrderReview;
  }

  return json as OrderReview;
}

export async function getOrderReview(token: string, orderId: string): Promise<OrderReview | null> {
  try {
    const response = await fetch(`${API_URL}/reviews/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return getStoredOrderReview(orderId);
    }

    if (!response.ok) {
      let message = "Failed to load review";

      try {
        const error = await response.json();
        message = error.error?.message || error.message || message;
      } catch {
        // Ignore parse failures
      }

      if (shouldUseFallback(response.status)) {
        return getStoredOrderReview(orderId);
      }

      throw createReviewError(message, response.status);
    }

    const json = await response.json();
    const review = unwrapReview(json);
    return review ?? getStoredOrderReview(orderId);
  } catch (error) {
    if (error instanceof Error) {
      return getStoredOrderReview(orderId);
    }

    throw error;
  }
}

export async function submitOrderReview(
  token: string,
  payload: SubmitReviewPayload & { reviewerId: string; reviewerName: string }
): Promise<OrderReview> {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = "Failed to submit review";

      try {
        const error = await response.json();
        message = error.error?.message || error.message || message;
      } catch {
        // Ignore parse failures
      }

      if (!shouldUseFallback(response.status)) {
        throw createReviewError(message, response.status);
      }

      return upsertStoredReview({
        id: `review-${Date.now()}`,
        orderId: payload.orderId,
        rating: payload.rating,
        comment: payload.comment,
        createdAt: new Date().toISOString(),
        reviewerId: payload.reviewerId,
        reviewerName: payload.reviewerName,
        revieweeId: payload.revieweeId,
        revieweeName: payload.revieweeName,
        orderTitle: payload.orderTitle,
        serviceTitle: payload.serviceTitle,
        response: null,
      });
    }

    const json = await response.json();
    const review = unwrapReview(json);

    if (!review) {
      throw createReviewError("Review response was empty");
    }

    return upsertStoredReview(review);
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      throw error;
    }

    return upsertStoredReview({
      id: `review-${Date.now()}`,
      orderId: payload.orderId,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
      reviewerId: payload.reviewerId,
      reviewerName: payload.reviewerName,
      revieweeId: payload.revieweeId,
      revieweeName: payload.revieweeName,
      orderTitle: payload.orderTitle,
      serviceTitle: payload.serviceTitle,
      response: null,
    });
  }
}

export async function submitReviewResponse(
  token: string,
  reviewId: string,
  orderId: string,
  content: string
): Promise<ReviewResponse> {
  try {
    const response = await fetch(`${API_URL}/reviews/${reviewId}/response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      let message = "Failed to submit response";

      try {
        const error = await response.json();
        message = error.error?.message || error.message || message;
      } catch {
        // Ignore parse failures
      }

      if (!shouldUseFallback(response.status)) {
        throw createReviewError(message, response.status);
      }

      const fallbackResponse: ReviewResponse = {
        content,
        createdAt: new Date().toISOString(),
      };
      const review = getStoredOrderReview(orderId);

      if (review) {
        upsertStoredReview({ ...review, response: fallbackResponse });
      }

      return fallbackResponse;
    }

    const json = await response.json();
    const reviewResponse = ("data" in json ? json.data : json) as ReviewResponse;
    const review = getStoredOrderReview(orderId);

    if (review) {
      upsertStoredReview({ ...review, response: reviewResponse });
    }

    return reviewResponse;
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      throw error;
    }

    const fallbackResponse: ReviewResponse = {
      content,
      createdAt: new Date().toISOString(),
    };
    const review = getStoredOrderReview(orderId);

    if (review) {
      upsertStoredReview({ ...review, response: fallbackResponse });
    }

    return fallbackResponse;
  }
}
