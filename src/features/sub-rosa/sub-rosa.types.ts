/**
 * Domain types for the Sub Rosa sealed-proposal demo.
 *
 * These mirror the vocabulary of the `ReceiptOnly` template documented in
 * https://github.com/karagozemin/Sub-Rosa/blob/main/docs/pilots/OFFER_HUB_PILOT.md
 * so that a future real integration can reuse the same shapes. Nothing here
 * touches OFFER HUB's own offer/application types on purpose — the demo must
 * stay severable from the product domain.
 */

/**
 * Lifecycle of a sealed round. In the real protocol the move from
 * `collecting` to `deadline_reached` is gated by a drand round publishing,
 * and `revealed` is reached by permissionless reveal transactions. Here both
 * are driven by the operator buttons in `RoundControls`.
 */
export type RoundPhase =
  | "collecting"
  | "deadline_reached"
  | "revealed"
  | "provider_selected";

/** The job a round is opened for. Owned by OFFER HUB, not by Sub Rosa. */
export interface SealedJob {
  title: string;
  description: string;
  budget: string;
  deadlineLabel: string;
}

/** Everything a provider writes into a proposal before it is sealed. */
export interface ProposalContent {
  providerName: string;
  price: string;
  timelineDays: number;
  approach: string;
  experience: string;
  milestones: string;
}

/**
 * A proposal as everyone else sees it before the shared deadline: a label, a
 * sealed status, and nothing else. The demo deliberately exposes no
 * commitment hash — a fabricated one would read as cryptographic evidence.
 */
export interface SealedProposal {
  id: string;
  label: string;
  isRevealed: boolean;
  /** Populated only once the round reaches `revealed`. */
  content: ProposalContent | null;
}

export interface SealedRound {
  /** Always a sample identifier. A real round would carry a numeric on-chain id. */
  id: string;
  template: "ReceiptOnly";
  phase: RoundPhase;
  job: SealedJob;
  proposals: SealedProposal[];
  /**
   * Application-level state. In `ReceiptOnly` the protocol declares no winner,
   * so this never maps onto a receipt's `winner` field.
   */
  selectedProposalId: string | null;
}

/** One row of the evidence panel. */
export interface EvidenceRow {
  label: string;
  value: string;
  /** Marks a field that would only carry a real value in a live round. */
  isUnavailableInSample?: boolean;
}
