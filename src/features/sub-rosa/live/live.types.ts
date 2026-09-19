/**
 * Types for the REAL Sub Rosa integration (Core v2, ReceiptOnly, time-based
 * reveal). These are distinct from `../sub-rosa.types.ts`, which belongs to the
 * in-memory `/labs/sub-rosa` walkthrough. Nothing here ever holds proposal
 * plaintext before the reveal deadline — see `SealedRoundRecord`.
 */

import type { SubRosaNetwork } from "@sub-rosa/sdk";

export type { SubRosaNetwork };

/**
 * The persisted, shareable mapping from an OFFER HUB offer to its on-chain
 * sealed round. Written by the client who opens the round; read by every
 * freelancer who submits to it and by anyone rendering the offer.
 *
 * Deliberately carries no plaintext: only the round coordinates a freelancer
 * needs to seal a proposal to the right Drand round + auditor, and the
 * evidence a viewer needs to verify the round exists on-chain.
 */
export interface SealedRoundRecord {
  /** OFFER HUB offer id this round backs. Primary key in the registry. */
  offerId: string;
  /** On-chain round id (u64) serialised as a decimal string. */
  roundId: string;
  /** Drand round R whose published signature unseals every proposal. */
  revealRound: number;
  /** Unix seconds. Submissions accepted strictly before this. Immutable. */
  commitDeadline: number;
  /** Unix seconds. Reveal transactions accepted until this. */
  revealDeadline: number;
  /** Auditor public key proposals seal their identity blob to (hex). */
  auditorPubkeyHex: string;
  /** Deployed Round contract id (C…). */
  contractId: string;
  /** Stellar network the round lives on. */
  network: SubRosaNetwork;
  /** Hash of the create_round_v2 transaction, when known. Never fabricated. */
  createTxHash: string | null;
  /** ISO timestamp the record was written. */
  createdAt: string;
}

/** Lifecycle of a live round, derived from on-chain state + wall-clock time. */
export type LiveRoundPhase =
  | "collecting" // now < commitDeadline — proposals can be sealed & submitted
  | "sealed" // commitDeadline passed, reveal round not yet published
  | "revealable" // reveal round published — proposals can be revealed
  | "revealed" // every submission has been revealed on-chain
  | "closed"; // past reveal deadline

/** A revealed proposal, decoded from its on-chain envelope after reveal. */
export interface RevealedProposal {
  /** The Stellar address that submitted the sealed proposal. */
  bidder: string;
  timelineDays: number;
  approach: string;
  totalAmount?: number;
  currency?: string;
  deliverables?: string[];
  /** Whether this submission's envelope has been revealed on-chain yet. */
  isRevealed: boolean;
}

/** A read-only snapshot of a live round for rendering. */
export interface LiveRoundView {
  record: SealedRoundRecord;
  phase: LiveRoundPhase;
  /** Addresses that have committed a sealed proposal. */
  bidders: string[];
  /** Raw on-chain status tag (e.g. "Open", "RevealOpen"), for the evidence panel. */
  statusTag: string;
  /** Populated only for submissions already revealed on-chain. */
  revealed: RevealedProposal[];
}
