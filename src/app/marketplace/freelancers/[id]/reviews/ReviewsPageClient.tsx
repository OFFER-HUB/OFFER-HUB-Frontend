"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FreelancerReviewsControls,
  ReviewHighlights,
  ReviewList,
  ReviewRatingStats,
  LeaveReviewModal,
} from "@/components/marketplace/freelancer-reviews";
import type { PublicFreelancerSummary, PublicFreelancerReviewsResult } from "@/types/public-freelancer.types";
import type { SubmitReviewPayload } from "@/types/review.types";

interface ReviewsPageClientProps {
  summary: PublicFreelancerSummary;
  reviewsResult: PublicFreelancerReviewsResult;
  loadError: string | null;
  sort: string;
  stars: string | undefined;
  page: number;
  pageSize: number;
  profileHref: string;
}

export function ReviewsPageClient({
  summary,
  reviewsResult,
  loadError,
  sort,
  stars,
  page,
  pageSize,
  profileHref,
}: ReviewsPageClientProps): React.JSX.Element {
  const router = useRouter();
  const [showLeaveReviewModal, setShowLeaveReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Mock user data - in real implementation, this would come from auth context
  const [currentUser] = useState({
    id: "user_current",
    name: "Current User",
    role: "client", // or "freelancer"
    hasCompletedOrder: true, // Mock: check if user has completed order with this freelancer
    isOwnProfile: false, // Mock: check if this is the freelancer's own profile
  });

  async function handleReviewSubmit(review: Omit<SubmitReviewPayload, "orderId">): Promise<void> {
    setIsSubmittingReview(true);
    try {
      // Mock API call - in real implementation, this would call the reviews API
      console.log("Submitting review:", review);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh the page to show the new review
      router.refresh();
    } catch (error) {
      console.error("Failed to submit review:", error);
      throw error;
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleResponseSubmit(reviewId: string, content: string): Promise<void> {
    try {
      // Mock API call - in real implementation, this would call the response API
      console.log("Submitting response:", { reviewId, content });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh the page to show the new response
      router.refresh();
    } catch (error) {
      console.error("Failed to submit response:", error);
      throw error;
    }
  }

  const showHighlights = reviewsResult.reviews.length > 0 && !stars;

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <nav className="text-sm text-text-secondary mb-6 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            {/* Breadcrumb navigation would go here */}
          </nav>

          <button
            className="inline-flex items-center gap-2 mb-6 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
            onClick={() => router.push(profileHref)}
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            Back to profile
          </button>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              Reviews for {summary.displayName}
            </h1>
            <p className="text-text-secondary mt-2">
              Transparent feedback from clients who worked with this freelancer.
            </p>
            
            {/* Leave Review Button - Only show to clients who have completed orders */}
            {currentUser.role === "client" && currentUser.hasCompletedOrder && !currentUser.isOwnProfile && (
              <div className="mt-4">
                <button
                  onClick={() => setShowLeaveReviewModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                >
                  <Icon path={ICON_PATHS.plus} size="sm" />
                  Leave a Review
                </button>
              </div>
            )}
          </header>

          {loadError ? (
            <EmptyState
              variant="card"
              icon={ICON_PATHS.alertCircle}
              title="Something went wrong"
              message={loadError}
              linkHref={profileHref}
              linkText="Back to profile"
            />
          ) : (
            <>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                <div className="space-y-8 order-2 lg:order-1">
                  <FreelancerReviewsControls
                    freelancerId={summary.id}
                    currentSort={sort}
                    currentStars={stars}
                    page={reviewsResult.page}
                    pageSize={reviewsResult.pageSize}
                    totalItems={reviewsResult.totalItems}
                    totalPages={reviewsResult.totalPages}
                    placement="top"
                  />

                  {showHighlights ? (
                    <ReviewHighlights reviews={reviewsResult.reviews} />
                  ) : null}

                  {reviewsResult.reviews.length === 0 ? (
                    <EmptyState
                      variant="card"
                      icon={ICON_PATHS.chat}
                      title={stars ? "No reviews for this filter" : "No reviews yet"}
                      message={
                        stars
                          ? "Try clearing the star filter or check back later."
                          : "When clients leave feedback, it will show up here."
                      }
                      linkHref={stars ? `/marketplace/freelancers/${summary.id}/reviews` : "/marketplace/services"}
                      linkText={stars ? "Show all reviews" : "Browse services"}
                    />
                  ) : (
                    <ReviewList 
                      reviews={reviewsResult.reviews} 
                      freelancerDisplayName={summary.displayName}
                      isOwnProfile={currentUser.isOwnProfile}
                      onResponseSubmit={handleResponseSubmit}
                    />
                  )}

                  {reviewsResult.totalPages > 0 ? (
                    <FreelancerReviewsControls
                      freelancerId={summary.id}
                      currentSort={sort}
                      currentStars={stars}
                      page={reviewsResult.page}
                      pageSize={reviewsResult.pageSize}
                      totalItems={reviewsResult.totalItems}
                      totalPages={reviewsResult.totalPages}
                      placement="bottom"
                    />
                  ) : null}
                </div>

                <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
                  <ReviewRatingStats
                    freelancerId={summary.id}
                    stats={reviewsResult.stats}
                    selectedStars={stars}
                    sort={sort}
                    pageSize={pageSize}
                  />
                </aside>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Leave Review Modal */}
      <LeaveReviewModal
        isOpen={showLeaveReviewModal}
        onClose={() => setShowLeaveReviewModal(false)}
        onSubmit={handleReviewSubmit}
        freelancerId={summary.id}
        freelancerName={summary.displayName}
        orderTitle="Sample Order" // In real implementation, this would come from order data
        serviceTitle="Sample Service" // In real implementation, this would come from order data
      />
    </>
  );
}
