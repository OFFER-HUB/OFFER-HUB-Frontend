"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import {
  getOrderById,
  reserveFunds,
  createEscrow,
  fundEscrow,
  cancelOrder,
  releaseFunds,
  openDispute,
  markOrderCompleted,
  type OpenDisputePayload,
} from "@/lib/api/orders";
import { getOrderReview, submitOrderReview, submitReviewResponse } from "@/lib/api/reviews";
import type { Order } from "@/types/order.types";
import { ORDER_STATUS_CONFIG } from "@/types/order.types";
import type { OrderReview } from "@/types/review.types";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON, DANGER_BUTTON } from "@/lib/styles";
import { StarRating } from "@/components/ui/StarRating";
import { LeaveReviewModal, ReviewResponse, ReviewResponseForm } from "@/components/rating";
import { OpenDisputeModal } from "@/components/orders/OpenDisputeModal";

// User-friendly step labels
const STEP_LABELS = {
  ORDER_CREATED: {
    step: 1,
    label: "Order Created",
    action: "Confirm Order",
    nextLabel: "Confirm & Reserve Funds",
  },
  FUNDS_RESERVED: {
    step: 2,
    label: "Payment Confirmed",
    action: "Start Payment",
    nextLabel: "Start Secure Payment",
  },
  ESCROW_CREATING: { step: 3, label: "Setting up...", action: "Processing", nextLabel: null },
  ESCROW_FUNDING: { step: 4, label: "Processing...", action: "Processing", nextLabel: null },
  IN_PROGRESS: { step: 5, label: "Work in Progress", action: null, nextLabel: null },
  RELEASED: { step: 6, label: "Payment Released", action: null, nextLabel: null },
  REFUNDED: { step: 6, label: "Refunded", action: null, nextLabel: null },
  CLOSED: { step: 7, label: "Completed", action: null, nextLabel: null },
} as const;

const _TOTAL_STEPS = 7;

export default function OrderDetailPage(): React.JSX.Element {
  const params = useParams();
  const _router = useRouter();
  const orderId = typeof params.id === "string" ? params.id : "";
  const { token, user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [review, setReview] = useState<OrderReview | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasDismissedReviewPrompt, setHasDismissedReviewPrompt] = useState(false);

  // Resolution modals
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const isBuyer = user?.id === order?.buyerId;
  const isSeller = user?.id === order?.sellerId;
  const isWorkCompleted = order?.metadata?.completedBySeller === true;
  const isOrderComplete = order?.status === "RELEASED" || order?.status === "CLOSED";

  // Fetch order
  useEffect(() => {
    if (!token || !orderId) return;

    async function fetch() {
      try {
        const data = await getOrderById(token!, orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    }

    fetch();
  }, [token, orderId]);

  useEffect(() => {
    if (!token || !orderId) {
      setIsReviewLoading(false);
      return;
    }

    const authToken = token;
    let isMounted = true;

    async function fetchReview() {
      setIsReviewLoading(true);

      try {
        const existingReview = await getOrderReview(authToken, orderId);
        if (!isMounted) return;
        setReview(existingReview);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch review:", err);
      } finally {
        if (isMounted) setIsReviewLoading(false);
      }
    }

    void fetchReview();

    return () => {
      isMounted = false;
    };
  }, [token, orderId]);

  useEffect(() => {
    if (!isBuyer || !isOrderComplete || review || hasDismissedReviewPrompt) {
      return;
    }

    setIsReviewModalOpen(true);
  }, [hasDismissedReviewPrompt, isBuyer, isOrderComplete, review]);

  async function handleReserveFunds() {
    if (!token) return;
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await reserveFunds(token, orderId);
      setOrder(updated);
      setSuccess("Order confirmed! Funds reserved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm order");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCreateEscrow() {
    if (!token) return;
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await createEscrow(token, orderId);
      setOrder(updated);
      setSuccess("Secure payment started successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start secure payment");
    } finally {
      setIsProcessing(false);
    }
  }

  async function _handleFundEscrow() {
    if (!token) return;
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await fundEscrow(token, orderId);
      setOrder(updated);
      setSuccess("Payment completed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete payment");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCancel() {
    if (!token) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setIsProcessing(true);
    setError(null);
    try {
      const updated = await cancelOrder(token, orderId);
      setOrder(updated);
      setSuccess("Order cancelled successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReleaseFunds() {
    if (!token) return;
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await releaseFunds(token, orderId);
      setOrder(updated);
      setSuccess("Funds released successfully! Payment has been sent to the freelancer.");
      setShowReleaseModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to release funds");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleMarkCompleted() {
    if (!token) return;
    setIsProcessing(true);
    setError(null);
    try {
      const updated = await markOrderCompleted(token, orderId);
      setOrder(updated);
      setSuccess("Work marked as completed! The client will be notified to review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark order as completed");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleOpenDispute(
    reason: "NOT_DELIVERED" | "QUALITY_ISSUE" | "OTHER",
    description: string
  ) {
    if (!token) return;
    setIsProcessing(true);
    setError(null);
    try {
      const payload: OpenDisputePayload = {
        orderId: orderId,
        openedBy: isBuyer ? "BUYER" : "SELLER",
        reason,
        description,
      };
      await openDispute(token, payload);
      setSuccess("Dispute opened successfully. Our team will review and contact you soon.");
      // Refresh order to get updated status
      const updated = await getOrderById(token, orderId);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open dispute");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSubmitReview(rating: number, comment: string): Promise<void> {
    if (!token || !order || !user) {
      throw new Error("You must be signed in to leave a review");
    }

    const reviewee = order.seller;

    if (!reviewee?.id) {
      throw new Error("Unable to identify the review recipient for this order");
    }

    const createdReview = await submitOrderReview(token, {
      orderId: order.id,
      rating,
      comment,
      revieweeId: reviewee.id,
      revieweeName: reviewee.name || reviewee.email || "Freelancer",
      reviewerId: user.id,
      reviewerName: user.username || user.email,
      orderTitle: order.title,
      serviceTitle: order.service?.title,
    });

    setReview(createdReview);
    setHasDismissedReviewPrompt(true);
    setSuccess("Review submitted successfully.");
  }

  async function handleSubmitReviewResponse(content: string): Promise<void> {
    if (!token || !review || !order) {
      throw new Error("Unable to submit a response right now");
    }

    const response = await submitReviewResponse(token, review.id, order.id, content);
    setReview({ ...review, response });
    setSuccess("Response posted successfully.");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-3 text-text-secondary">Loading order...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={cn(NEUMORPHIC_CARD, "text-center py-12")}>
          <Icon path={ICON_PATHS.alertCircle} size="lg" className="text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Order Not Found</h2>
          <p className="text-text-secondary mb-6">
            The order you're looking for doesn't exist or you don't have access.
          </p>
          <Link href="/app/orders" className={PRIMARY_BUTTON}>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "text-text-secondary",
    bg: "bg-text-secondary/10",
  };
  const stepInfo = STEP_LABELS[order.status as keyof typeof STEP_LABELS] || {
    step: 1,
    label: order.status,
  };
  const amount = parseFloat(order.amount);
  const otherUser = isBuyer ? order.seller : order.buyer;
  const canLeaveReview = isBuyer && isOrderComplete && !review;
  const canRespondToReview = Boolean(
    review && isSeller && user?.id === review.revieweeId && !review.response
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <Link
        href="/app/orders"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
      >
        <Icon path={ICON_PATHS.chevronLeft} size="sm" />
        <span>Back to Orders</span>
      </Link>

      {/* Header */}
      <div className={NEUMORPHIC_CARD}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{order.title}</h1>
            <p className="text-text-secondary text-sm">Order #{order.id?.slice(-8) || "N/A"}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-text-secondary">Amount</p>
              <p className="text-2xl font-bold text-primary">${amount.toFixed(2)}</p>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap",
                statusConfig.bg,
                statusConfig.color
              )}
            >
              {stepInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className={NEUMORPHIC_CARD}>
        <h2 className="text-lg font-semibold text-text-primary mb-8">Order Progress</h2>
        <div className="relative px-4">
          {/* Steps */}
          <div className="relative grid grid-cols-4 gap-2">
            {[
              { num: 1, label: "Created" },
              { num: 2, label: "Confirmed" },
              { num: 5, label: "In Progress" },
              { num: 7, label: "Complete" },
            ].map((step, index) => (
              <div key={step.num} className="flex flex-col items-center relative">
                {/* Circle */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm mb-3 transition-all relative z-10 bg-background",
                    stepInfo.step >= step.num
                      ? "text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                      : "text-text-secondary shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                  )}
                >
                  {stepInfo.step > step.num ? (
                    <Icon path={ICON_PATHS.check} size="sm" className="text-primary" />
                  ) : stepInfo.step === step.num ? (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  ) : (
                    step.num
                  )}
                </div>

                {/* Connecting Line */}
                {index < 3 && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 -z-0">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        stepInfo.step > step.num
                          ? "bg-primary"
                          : "bg-border-light shadow-[inset_1px_1px_2px_#d1d5db]"
                      )}
                    />
                  </div>
                )}

                {/* Label */}
                <span className="text-xs font-medium text-text-secondary text-center">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div
          className={cn(
            "p-4 rounded-xl flex items-start gap-3",
            NEUMORPHIC_INSET,
            "border-l-4 border-error"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
            <Icon path={ICON_PATHS.alertCircle} size="sm" className="text-error" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-error mb-1">Error</p>
            <p className="text-sm text-text-secondary">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
              "text-error hover:bg-error/5"
            )}
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        </div>
      )}

      {success && (
        <div
          className={cn(
            "p-4 rounded-xl flex items-start gap-3",
            NEUMORPHIC_INSET,
            "border-l-4 border-success"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <Icon path={ICON_PATHS.check} size="sm" className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-success mb-1">Success</p>
            <p className="text-sm text-text-secondary">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
              "text-success hover:bg-success/5"
            )}
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Participants */}
        <div className={NEUMORPHIC_CARD}>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {isBuyer ? "Freelancer" : "Client"}
          </h2>
          <div className="flex items-center gap-3">
            {otherUser?.avatar ? (
              <img
                src={otherUser.avatar}
                alt={otherUser.name || "User"}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {otherUser?.name?.charAt(0) || otherUser?.email?.charAt(0) || "?"}
              </div>
            )}
            <div>
              <p className="font-medium text-text-primary">{otherUser?.name || "Unknown"}</p>
              <p className="text-sm text-text-secondary">{otherUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={NEUMORPHIC_CARD}>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Description</h2>
          <p className="text-text-secondary">{order.description || "No description provided"}</p>
        </div>
      </div>

      {(isReviewLoading || review || canLeaveReview || (isSeller && isOrderComplete)) && (
        <section className={NEUMORPHIC_CARD}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Review</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {review
                  ? "Feedback captured for this completed order."
                  : canLeaveReview
                    ? "Share your experience after order completion."
                    : "Reviews will appear here after the client submits one."}
              </p>
            </div>

            {canLeaveReview ? (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className={cn(PRIMARY_BUTTON, "justify-center")}
              >
                <Icon path={ICON_PATHS.star} size="sm" />
                <span>Leave review</span>
              </button>
            ) : null}
          </div>

          {isReviewLoading ? (
            <div className={cn("mt-4 flex items-center gap-3 rounded-2xl p-4", NEUMORPHIC_INSET)}>
              <LoadingSpinner size="sm" />
              <p className="text-sm text-text-secondary">Loading review…</p>
            </div>
          ) : review ? (
            <div className={cn("mt-4 rounded-2xl p-5", NEUMORPHIC_INSET)}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-text-primary">{review.reviewerName}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {new Date(review.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <StarRating value={review.rating} readonly size="md" />
                  <span className="text-sm font-medium text-text-secondary">{review.rating}/5</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Order context
                </p>
                <p className="mt-2 font-medium text-text-primary">{review.orderTitle}</p>
                {review.serviceTitle ? (
                  <p className="mt-1 text-sm text-text-secondary">Service: {review.serviceTitle}</p>
                ) : null}
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                {review.comment}
              </p>

              {review.response ? (
                <ReviewResponse response={review.response} responderName={review.revieweeName} />
              ) : null}

              {canRespondToReview ? (
                <ReviewResponseForm onSubmit={handleSubmitReviewResponse} />
              ) : null}
            </div>
          ) : (
            <div className={cn("mt-4 rounded-2xl p-4", NEUMORPHIC_INSET)}>
              <p className="text-sm text-text-secondary">
                {canLeaveReview
                  ? "You can skip for now, but leaving a review helps future clients make informed decisions."
                  : "No review has been submitted for this order yet."}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Action Panel - Buyer Only */}
      {isBuyer && (
        <div className={NEUMORPHIC_CARD}>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Next Steps</h2>

          {order.status === "ORDER_CREATED" && (
            <div className="space-y-4">
              <div className={cn("p-5 rounded-xl", NEUMORPHIC_INSET)}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon path={ICON_PATHS.infoCircle} size="sm" className="text-primary" />
                  </div>
                  <p className="text-sm text-text-secondary pt-2">
                    Confirm this order to reserve funds from your balance. The freelancer will be
                    notified to start work.
                  </p>
                </div>
                <button
                  onClick={handleReserveFunds}
                  disabled={isProcessing}
                  className={cn(PRIMARY_BUTTON, "w-full justify-center")}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Icon path={ICON_PATHS.check} size="sm" />
                      <span>Confirm Order</span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className={cn(DANGER_BUTTON, "w-full justify-center")}
              >
                <Icon path={ICON_PATHS.close} size="sm" />
                <span>Cancel Order</span>
              </button>
            </div>
          )}

          {order.status === "FUNDS_RESERVED" && (
            <div className="space-y-4">
              <div className={cn("p-5 rounded-xl", NEUMORPHIC_INSET)}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon path={ICON_PATHS.lock} size="sm" className="text-primary" />
                  </div>
                  <p className="text-sm text-text-secondary pt-2">
                    Start secure payment to lock funds in escrow. This protects both you and the
                    freelancer.
                  </p>
                </div>
                <button
                  onClick={handleCreateEscrow}
                  disabled={isProcessing}
                  className={cn(PRIMARY_BUTTON, "w-full justify-center")}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Icon path={ICON_PATHS.lock} size="sm" />
                      <span>Start Secure Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {(order.status === "ESCROW_CREATING" || order.status === "ESCROW_FUNDING") && (
            <div
              className={cn(
                "p-5 rounded-xl flex items-center gap-4",
                "bg-background shadow-[inset_3px_3px_6px_rgba(245,158,11,0.1),inset_-3px_-3px_6px_#ffffff]",
                "border-l-4 border-warning"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <LoadingSpinner size="sm" />
              </div>
              <div>
                <p className="font-semibold text-text-primary mb-1">Processing Payment...</p>
                <p className="text-sm text-text-secondary">
                  This may take a few moments. Please wait.
                </p>
              </div>
            </div>
          )}

          {order.status === "IN_PROGRESS" && (
            <div className="space-y-4">
              <div
                className={cn(
                  "p-4 rounded-xl",
                  NEUMORPHIC_INSET,
                  isWorkCompleted ? "border-l-4 border-warning" : "border-l-4 border-success"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isWorkCompleted ? "bg-warning/10" : "bg-success/10"
                    )}
                  >
                    <Icon
                      path={isWorkCompleted ? ICON_PATHS.alertCircle : ICON_PATHS.check}
                      size="sm"
                      className={isWorkCompleted ? "text-warning" : "text-success"}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">
                      {isWorkCompleted ? "Work Completed - Please Review" : "Payment Secured"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {isWorkCompleted
                        ? "The freelancer has marked the work as completed. Please review and release funds or open a dispute if needed."
                        : "Funds are safely held in escrow. The freelancer is now working on your order."}
                    </p>
                  </div>
                </div>
              </div>

              {isWorkCompleted && (
                <div className={cn("p-3 rounded-lg", NEUMORPHIC_INSET)}>
                  <h3 className="text-xs font-medium text-text-secondary mb-2">Review</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowReleaseModal(true)}
                      className={cn(
                        "px-3 py-2 rounded-lg font-medium transition-all text-xs",
                        "bg-background text-success",
                        "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                        "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                        "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                        "flex flex-col items-center gap-1"
                      )}
                    >
                      <Icon path={ICON_PATHS.check} size="sm" />
                      <span>Release Funds</span>
                    </button>
                    <button
                      onClick={() => setShowDisputeModal(true)}
                      className={cn(
                        "px-3 py-2 rounded-lg font-medium transition-all text-xs",
                        "bg-background text-error",
                        "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                        "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                        "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                        "flex flex-col items-center gap-1"
                      )}
                    >
                      <Icon path={ICON_PATHS.flag} size="sm" />
                      <span>Open Dispute</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Seller View */}
      {isSeller && (
        <div className={NEUMORPHIC_CARD}>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Order Status</h2>

          {order.status === "ORDER_CREATED" && (
            <div className={cn("p-5 rounded-xl", NEUMORPHIC_INSET, "border-l-4 border-warning")}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Icon path={ICON_PATHS.clock} size="sm" className="text-warning" />
                </div>
                <p className="text-sm text-text-secondary pt-2">
                  Waiting for client to confirm the order and reserve funds.
                </p>
              </div>
            </div>
          )}

          {order.status === "FUNDS_RESERVED" && (
            <div className={cn("p-5 rounded-xl", NEUMORPHIC_INSET, "border-l-4 border-primary")}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon path={ICON_PATHS.lock} size="sm" className="text-primary" />
                </div>
                <p className="text-sm text-text-secondary pt-2">
                  Client has confirmed the order. Waiting for secure payment setup.
                </p>
              </div>
            </div>
          )}

          {order.status === "IN_PROGRESS" && (
            <div className="space-y-4">
              <div
                className={cn(
                  "p-4 rounded-xl",
                  NEUMORPHIC_INSET,
                  isWorkCompleted ? "border-l-4 border-success" : "border-l-4 border-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isWorkCompleted ? "bg-success/10" : "bg-primary/10"
                    )}
                  >
                    <Icon
                      path={isWorkCompleted ? ICON_PATHS.check : ICON_PATHS.briefcase}
                      size="sm"
                      className={isWorkCompleted ? "text-success" : "text-primary"}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">
                      {isWorkCompleted ? "Waiting for Client Review" : "Ready to Start"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {isWorkCompleted
                        ? "You have marked the work as completed. Waiting for the client to review and release funds."
                        : "Payment is secured. You can now start working on this order! When finished, mark as completed."}
                    </p>
                  </div>
                </div>
              </div>

              {!isWorkCompleted && (
                <div className={cn("p-3 rounded-lg", NEUMORPHIC_INSET)}>
                  <h3 className="text-xs font-medium text-text-secondary mb-2">Actions</h3>
                  <button
                    onClick={handleMarkCompleted}
                    disabled={isProcessing}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg font-medium transition-all text-sm",
                      "bg-background text-success",
                      "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                      "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                      "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Marking...</span>
                      </>
                    ) : (
                      <>
                        <Icon path={ICON_PATHS.check} size="sm" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {isWorkCompleted && (
                <div className={cn("p-3 rounded-lg", NEUMORPHIC_INSET)}>
                  <h3 className="text-xs font-medium text-text-secondary mb-2">Need help?</h3>
                  <p className="text-xs text-text-secondary mb-2">
                    If the client doesn't respond, you can open a dispute.
                  </p>
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className={cn(
                      "w-full px-3 py-1.5 rounded-lg font-medium transition-all text-xs",
                      "bg-background text-error",
                      "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                      "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                      "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                      "flex items-center justify-center gap-1"
                    )}
                  >
                    <Icon path={ICON_PATHS.flag} size="sm" />
                    <span>Open Dispute</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Escrow Details */}
      {order.escrow && (
        <div className={NEUMORPHIC_CARD}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon path={ICON_PATHS.lock} size="sm" className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Secure Payment Contract</h2>
              <p className="text-sm text-text-secondary">
                Funds are protected by blockchain smart contract
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div
              className={cn("flex justify-between items-center p-3 rounded-lg", NEUMORPHIC_INSET)}
            >
              <span className="text-text-secondary">Status</span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  order.status === "CLOSED" || order.escrow.status === "FUNDED"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                )}
              >
                {order.status === "CLOSED" ? "COMPLETED" : order.escrow.status}
              </span>
            </div>

            {/* Escrow Address */}
            {order.escrow.trustlessContractId && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">
                    Smart Contract Address
                  </label>
                  <div className="flex gap-2">
                    <div className={cn("flex-1 p-3 rounded-lg", NEUMORPHIC_INSET)}>
                      <p className="font-mono text-xs text-text-primary break-all">
                        {order.escrow.trustlessContractId}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(order.escrow!.trustlessContractId!);
                        setSuccess("Address copied to clipboard!");
                      }}
                      className={cn(
                        "px-4 py-3 rounded-lg font-medium transition-all",
                        "bg-background text-text-secondary",
                        "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                        "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                        "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]"
                      )}
                      title="Copy address"
                    >
                      <Icon path={ICON_PATHS.copy} size="sm" />
                    </button>
                  </div>
                </div>

                {/* BOTÓN PROMINENTE para ver en Stellar Explorer */}
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${order.escrow.trustlessContractId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-full px-6 py-4 rounded-xl font-medium transition-all",
                    "bg-gradient-to-r from-primary to-primary/80 text-white",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
                    "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
                    "flex items-center justify-center gap-3"
                  )}
                >
                  <Icon path={ICON_PATHS.externalLink} size="md" className="text-white" />
                  <span className="text-base font-semibold">View Contract Status on Stellar</span>
                </a>

                <p className="text-xs text-text-secondary text-center">
                  This link will take you to Stellar's blockchain explorer where you can view the
                  real-time status of your escrow smart contract
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Release Funds Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={cn(NEUMORPHIC_CARD, "max-w-md w-full")}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Icon path={ICON_PATHS.check} size="md" className="text-success" />
              </div>
              <h3 className="text-xl font-bold text-text-primary">Release Funds</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Are you satisfied with the work? This will release{" "}
              <span className="font-semibold text-primary">${amount.toFixed(2)}</span> to the
              freelancer. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReleaseModal(false)}
                disabled={isProcessing}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm",
                  "bg-background text-text-secondary",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleReleaseFunds}
                disabled={isProcessing}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm",
                  "bg-background text-success",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.check} size="sm" />
                    <span>Confirm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Dispute Modal */}
      <OpenDisputeModal
        isOpen={showDisputeModal}
        orderTitle={order.title}
        onClose={() => setShowDisputeModal(false)}
        onSubmit={handleOpenDispute}
      />

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        revieweeName={order.seller?.name || order.seller?.email || "the freelancer"}
        orderTitle={order.title}
        serviceTitle={order.service?.title}
        onClose={() => {
          setIsReviewModalOpen(false);
          setHasDismissedReviewPrompt(true);
        }}
        onSkip={() => {
          setIsReviewModalOpen(false);
          setHasDismissedReviewPrompt(true);
        }}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}
