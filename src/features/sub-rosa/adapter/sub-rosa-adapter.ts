import type { SealedRound } from "../sub-rosa.types";

/**
 * The seam between this demo's UI and whatever drives a sealed round.
 *
 * Today the only implementation is `mock-adapter.ts`, which keeps everything
 * in memory. The method names mirror the real `@sub-rosa/sdk` surface
 * (`createSealedProposalRound`, `sealProposal` + `submitV2`, `open_reveal_v2`,
 * `reveal_v2`) so that swapping in a live implementation later is a matter of
 * writing one more file against this interface — no UI changes.
 *
 * Deliberately NOT done here: installing `@sub-rosa/sdk`. As of 0.2.2 the
 * published package cannot be installed with npm at all (it ships
 * `workspace:^` dependency specifiers, which npm rejects with
 * EUNSUPPORTEDPROTOCOL), it pulls `@stellar/stellar-sdk@^15` against the v14
 * the API is on, and Sub Rosa's own docs/LIMITATIONS.md states Core v2 has no
 * independent funds-handling audit yet.
 */
export interface SubRosaAdapter {
  /** Opens a `ReceiptOnly` round for the sample job. */
  createRound(): Promise<SealedRound>;

  /**
   * Advances past the shared commit deadline. In a live round this is not an
   * action anyone takes — it happens when the drand round publishes.
   */
  reachDeadline(round: SealedRound): Promise<SealedRound>;

  /**
   * Reveals every sealed proposal at once. Live, this is a permissionless
   * lifecycle of `open_reveal_v2` / `reveal_v2` calls, decrypted in separate
   * bounded transactions rather than one atomic reveal-all.
   */
  revealProposals(round: SealedRound): Promise<SealedRound>;

  /**
   * Records the client's choice. Application-level state: `ReceiptOnly`
   * declares no protocol winner.
   */
  selectProvider(round: SealedRound, proposalId: string): Promise<SealedRound>;
}
