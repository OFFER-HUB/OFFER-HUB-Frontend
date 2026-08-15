"use client";

import { useCallback, useState } from "react";

/**
 * How the review modal got into its current visibility.
 *
 * - `auto`   — nobody has touched it; the prompt rule decides.
 * - `open`   — opened on purpose (or pinned open while it shows its result).
 * - `closed` — dismissed; the prompt rule may not reopen it.
 */
type ReviewModalState = "auto" | "open" | "closed";

export interface UseOrderModalsParams {
  /**
   * True when the buyer is looking at a finished order they have not reviewed.
   * The review modal opens by itself while this holds and nothing has overridden it.
   */
  shouldPromptForReview: boolean;
}

export interface UseOrderModalsResult {
  isReleaseModalOpen: boolean;
  openReleaseModal: () => void;
  closeReleaseModal: () => void;
  isDisputeModalOpen: boolean;
  openDisputeModal: () => void;
  closeDisputeModal: () => void;
  isReviewModalOpen: boolean;
  /** Opens the review modal from the "Leave review" button. */
  openReviewModal: () => void;
  /** Closes the review modal and stops the prompt from reopening it. */
  dismissReviewModal: () => void;
  /**
   * Keeps the review modal on screen once a review has been submitted.
   *
   * Without it an auto-opened modal would vanish the moment the review lands,
   * cutting off the confirmation it shows before closing itself.
   */
  holdReviewModalOpen: () => void;
}

/**
 * Visibility of the three dialogs on the order detail page.
 *
 * Grouped into one hook because they share a rule: the review modal is the only
 * one that opens on its own, and it must stay closed once the buyer has
 * dismissed or answered it, even though the condition that opened it is still
 * true for the rest of the session.
 *
 * That rule is derived rather than pushed into state by an effect — the prompt
 * is a function of "should we ask" and "has anyone overridden it", so there is
 * nothing to synchronise.
 */
export function useOrderModals({
  shouldPromptForReview,
}: UseOrderModalsParams): UseOrderModalsResult {
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [reviewModalState, setReviewModalState] = useState<ReviewModalState>("auto");

  const openReleaseModal = useCallback(() => setIsReleaseModalOpen(true), []);
  const closeReleaseModal = useCallback(() => setIsReleaseModalOpen(false), []);
  const openDisputeModal = useCallback(() => setIsDisputeModalOpen(true), []);
  const closeDisputeModal = useCallback(() => setIsDisputeModalOpen(false), []);

  const openReviewModal = useCallback(() => setReviewModalState("open"), []);
  const holdReviewModalOpen = useCallback(() => setReviewModalState("open"), []);
  const dismissReviewModal = useCallback(() => setReviewModalState("closed"), []);

  return {
    isReleaseModalOpen,
    openReleaseModal,
    closeReleaseModal,
    isDisputeModalOpen,
    openDisputeModal,
    closeDisputeModal,
    isReviewModalOpen:
      reviewModalState === "open" || (reviewModalState === "auto" && shouldPromptForReview),
    openReviewModal,
    dismissReviewModal,
    holdReviewModalOpen,
  };
}
