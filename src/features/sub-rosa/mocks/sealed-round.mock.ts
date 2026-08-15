import type { ProposalContent, SealedJob, SealedRound } from "../sub-rosa.types";

/**
 * Sample data for the sealed-proposal demo. Obviously fictional providers —
 * these are never presented as on-chain evidence.
 *
 * The job matches the one in the Sub Rosa pilot doc so the two demos line up
 * when shown side by side.
 */

export const MOCK_SEALED_JOB: SealedJob = {
  title: "Build a Stellar merchant analytics dashboard",
  description:
    "Create a dashboard for merchants to monitor Stellar payments, transaction volume and customer activity.",
  budget: "2,000 USDC",
  deadlineLabel: "5 minutes after the round opens",
};

/**
 * Deliberately not ordered by price. The whole argument for `ReceiptOnly` over
 * an auction is that the cheapest proposal is not automatically the best one —
 * the client still has to weigh timeline, approach and track record.
 */
export const MOCK_PROPOSAL_CONTENTS: ProposalContent[] = [
  {
    providerName: "Nova Labs",
    price: "1,850 USDC",
    timelineDays: 21,
    approach:
      "Next.js dashboard reading Horizon and Stellar RPC directly, with a thin aggregation layer cached in Redis. Ships with merchant-facing CSV export.",
    experience:
      "Four Soroban dashboards delivered, two of them live on mainnet. Previously built payment analytics for a LATAM PSP.",
    milestones: "Data layer → charts → merchant export → handover",
  },
  {
    providerName: "StellarCraft",
    price: "1,400 USDC",
    timelineDays: 30,
    approach:
      "Reuse an in-house charting kit on top of a nightly indexer. Lower cost, but the indexer batch means figures lag real time by up to a day.",
    experience:
      "Two Stellar integrations, both testnet only. Strong on frontend craft, first time shipping a merchant-facing product.",
    milestones: "Indexer → dashboard shell → charts",
  },
  {
    providerName: "Orbit Studio",
    price: "2,000 USDC",
    timelineDays: 14,
    approach:
      "Streaming Stellar RPC subscriptions into a live dashboard, with alerting on payment failures and a mobile-first layout from day one.",
    experience:
      "Seven Stellar projects including an SCF-funded wallet. Team of three available full time for the whole window.",
    milestones: "Streaming layer → live charts → alerts → mobile pass → QA",
  },
];

/** The round as it looks the moment the deadline starts running. */
export function createMockSealedRound(): SealedRound {
  return {
    id: "sample-round",
    template: "ReceiptOnly",
    phase: "collecting",
    job: MOCK_SEALED_JOB,
    proposals: MOCK_PROPOSAL_CONTENTS.map((_, index) => ({
      id: `sample-proposal-${index + 1}`,
      label: `Proposal ${String(index + 1).padStart(2, "0")}`,
      isRevealed: false,
      content: null,
    })),
    selectedProposalId: null,
  };
}
