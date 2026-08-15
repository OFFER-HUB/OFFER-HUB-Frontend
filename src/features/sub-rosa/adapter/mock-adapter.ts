import { MOCK_LATENCY_MS } from "../sub-rosa.constants";
import { createMockSealedRound, MOCK_PROPOSAL_CONTENTS } from "../mocks/sealed-round.mock";
import type { SealedRound } from "../sub-rosa.types";
import type { SubRosaAdapter } from "./sub-rosa-adapter";

/**
 * In-memory implementation of `SubRosaAdapter`.
 *
 * No network, no localStorage, no crypto — every transition is a pure function
 * over the round plus a small artificial delay so loading states are visible.
 * Nothing survives a refresh, which is the point: this is a walkthrough, not a
 * persisted round.
 */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockSubRosaAdapter: SubRosaAdapter = {
  async createRound(): Promise<SealedRound> {
    await delay(MOCK_LATENCY_MS);
    return createMockSealedRound();
  },

  async reachDeadline(round: SealedRound): Promise<SealedRound> {
    await delay(MOCK_LATENCY_MS);
    return { ...round, phase: "deadline_reached" };
  },

  async revealProposals(round: SealedRound): Promise<SealedRound> {
    await delay(MOCK_LATENCY_MS);
    return {
      ...round,
      phase: "revealed",
      proposals: round.proposals.map((proposal, index) => ({
        ...proposal,
        isRevealed: true,
        content: MOCK_PROPOSAL_CONTENTS[index] ?? null,
      })),
    };
  },

  async selectProvider(round: SealedRound, proposalId: string): Promise<SealedRound> {
    await delay(MOCK_LATENCY_MS);
    return { ...round, phase: "provider_selected", selectedProposalId: proposalId };
  },
};
