/**
 * Every string the order detail flow can put in front of a user.
 *
 * Centralised so the wording of an action, its failure fallback and its
 * confirmation prompt sit next to each other and cannot drift apart as the
 * handlers move between hooks.
 */

/** Success banner plus the fallback used when the API error carries no message. */
export interface OrderActionMessages {
  success: string;
  failure: string;
}

export const ORDER_ACTION_MESSAGES = {
  reserveFunds: {
    success: "Order confirmed! Funds reserved successfully.",
    failure: "Failed to confirm order",
  },
  createEscrow: {
    success: "Secure payment started successfully!",
    failure: "Failed to start secure payment",
  },
  fundEscrow: {
    success: "Payment completed successfully!",
    failure: "Failed to complete payment",
  },
  cancelOrder: {
    success: "Order cancelled successfully.",
    failure: "Failed to cancel order",
  },
  releaseFunds: {
    success: "Funds released successfully! Payment has been sent to the freelancer.",
    failure: "Failed to release funds",
  },
  markCompleted: {
    success: "Work marked as completed! The client will be notified to review.",
    failure: "Failed to mark order as completed",
  },
  openDispute: {
    success: "Dispute opened successfully. Our team will review and contact you soon.",
    failure: "Failed to open dispute",
  },
  submitReview: {
    success: "Review submitted successfully.",
    failure: "Failed to submit review",
  },
  submitReviewResponse: {
    success: "Response posted successfully.",
    failure: "Failed to post response",
  },
} as const satisfies Record<string, OrderActionMessages>;

/** Native `confirm()` prompts guarding irreversible actions. */
export const ORDER_CONFIRM_PROMPTS = {
  cancelOrder: "Are you sure you want to cancel this order?",
} as const;

/** Fallbacks for the two fetches behind the page. */
export const ORDER_LOAD_ERRORS = {
  order: "Failed to load order",
  review: "Failed to load review",
} as const;

/**
 * Preconditions the review actions check before touching the network. They are
 * thrown rather than banner-ed: the review modals surface them inline.
 */
export const ORDER_REVIEW_GUARDS = {
  signedOut: "You must be signed in to leave a review",
  unknownReviewee: "Unable to identify the review recipient for this order",
  responseUnavailable: "Unable to submit a response right now",
} as const;

/** Clipboard feedback for the escrow contract address. */
export const ORDER_CLIPBOARD_MESSAGES = {
  copied: "Address copied to clipboard!",
  failed: "Could not copy the address. Copy it manually instead.",
} as const;

/** Name shown in the review modal when the seller has no name, username or email. */
export const DEFAULT_FREELANCER_LABEL = "the freelancer";

/** Name stored on the review payload when the seller has none of the above. */
export const REVIEWEE_NAME_FALLBACK = "Freelancer";
