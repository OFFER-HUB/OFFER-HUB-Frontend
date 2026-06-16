import { API_URL } from "@/config/api";
import type { OrderReview, ReviewResponse, SubmitReviewPayload } from "@/types/review.types";

type ReviewApiError = Error & { status?: number };

function createReviewError(message: string, status?: number): ReviewApiError {
  const error = new Error(message) as ReviewApiError;
  error.status = status;
  return error;
}

function unwrapReview(json: unknown): OrderReview | null {
  if (!json || typeof json !== "object") return null;

  if ("data" in json && json.data) {
    return json.data as OrderReview;
  }

  return json as OrderReview;
}

export async function getOrderReview(token: string, orderId: string): Promise<OrderReview | null> {
  const response = await fetch(`${API_URL}/reviews/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    let message = "Failed to load review";

    try {
      const error = await response.json();
      message = error.error?.message || error.message || message;
    } catch {
      // Ignore parse failures
    }

    throw createReviewError(message, response.status);
  }

  const json = await response.json();
  return unwrapReview(json);
}

export async function submitOrderReview(
  token: string,
  payload: SubmitReviewPayload & { reviewerId: string; reviewerName: string }
): Promise<OrderReview> {
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

    throw createReviewError(message, response.status);
  }

  const json = await response.json();
  const review = unwrapReview(json);

  if (!review) {
    throw createReviewError("Review response was empty");
  }

  return review;
}

export async function submitReviewResponse(
  token: string,
  reviewId: string,
  orderId: string,
  content: string
): Promise<ReviewResponse> {
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

    throw createReviewError(message, response.status);
  }

  const json = await response.json();
  return ("data" in json ? json.data : json) as ReviewResponse;
}
