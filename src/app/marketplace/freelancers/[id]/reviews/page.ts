"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ICON_PATHS } from "@/components/ui/Icon";
import { LeaveReviewModal } from "@/components/reviews/LeaveReviewModal";
import { ReviewResponseForm } from "@/components/reviews/ReviewResponseForm";

interface Review {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  createdAt: string;
  response?: string;
}

interface PageProps {
  params: { id: string };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= rating ? "text-yellow-400" : "text-text-secondary opacity-30"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function FreelancerReviewsPage({ params }: PageProps) {
  const { data: session } = useSession();
  const freelancerId = params.id;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedOrder, setHasCompletedOrder] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine roles
  const isClient = session?.user?.role === "client";
  const isFreelancer =
    session?.user?.role === "freelancer" &&
    session?.user?.id === freelancerId;

  async function fetchReviews() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/freelancers/${freelancerId}/reviews`);
      if (!res.ok) throw new Error("Failed to load reviews.");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      setError("Failed to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchOrderEligibility() {
    if (!isClient) return;
    try {
      const res = await fetch(
        `/api/orders/completed?freelancerId=${freelancerId}`
      );
      if (res.ok) {
        const data = await res.json();
        setHasCompletedOrder(data.hasCompletedOrder ?? false);
      }
    } catch {
      // silently fail — just won't show the button
    }
  }

  useEffect(() => {
    fetchReviews();
    fetchOrderEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freelancerId]);

  function handleReviewSuccess() {
    fetchReviews();
  }

  function handleResponseSuccess(reviewId: string, responseText: string) {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, response: responseText } : r))
    );
  }

  // ── States ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return <LoadingState message="Loading reviews…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchReviews} />;
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-secondary px-4 py-10 md:px-8">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-background">Reviews</h1>

        {/* Leave Review — only clients with a completed order */}
        {isClient && hasCompletedOrder && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold
                       text-white hover:bg-[#0d7377] transition-colors
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Leave a Review
          </button>
        )}
      </div>

      {/* Empty state */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={ICON_PATHS.chat}
          title="No reviews yet"
          message="This freelancer has not received any reviews yet."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl bg-secondary p-6
                         shadow-[6px_6px_12px_#0a0f1a,-6px_-6px_12px_#1e2a4a]"
            >
              {/* Review header */}
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {review.authorAvatar ? (
                    <img
                      src={review.authorAvatar}
                      alt={review.authorName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center
                                    rounded-full bg-primary/20 text-primary font-semibold">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-background">
                      {review.authorName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>

              {/* Review body */}
              <p className="text-sm leading-relaxed text-text-secondary">
                {review.text}
              </p>

              {/* Freelancer response — existing */}
              {review.response && (
                <div className="mt-4 rounded-xl border border-border/50 bg-secondary/60 p-4
                                shadow-[inset_4px_4px_8px_#0a0f1a,inset_-4px_-4px_8px_#1e2a4a]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    Freelancer Response
                  </p>
                  <p className="text-sm text-text-secondary">{review.response}</p>
                </div>
              )}

              {/* Reply button — freelancer only, no existing response */}
              {isFreelancer && !review.response && (
                <ReviewResponseForm
                  reviewId={review.id}
                  onSuccess={(responseText) =>
                    handleResponseSuccess(review.id, responseText)
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Leave Review Modal */}
      <LeaveReviewModal
        freelancerId={freelancerId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
