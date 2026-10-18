"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import {
  prepareEscrowCreate,
  prepareEscrowFund,
  prepareReleaseStep,
  prepareRefundStep,
  prepareDisputeStep,
  submitEscrowXdr,
} from "@/lib/api/escrow";
import type { EscrowOperation } from "@/lib/api/escrow";
import { useStellarEscrowSigning } from "@offer-hub/stellar-escrow-signing";
import type {
  EscrowSigningState,
  EscrowSigningError,
  EscrowStepName,
} from "@offer-hub/stellar-escrow-signing";

/**
 * Where the D2.1 signing flow currently is. Mirrors `useWalletAuth`'s `step`
 * pattern: each value is something specific the UI is waiting on, not a
 * generic spinner.
 */
export type { EscrowSigningState, EscrowSigningError };

export interface UseEscrowSigningResult {
  state: EscrowSigningState;
  /**
   * Runs prepare -> sign -> submit for one escrow operation on one order.
   * Safe to call again after an `error` state to retry the same operation
   * from scratch (a fresh XDR is fetched, so `XDR_EXPIRED` self-heals).
   *
   * `callerRole` is the current viewer's role on this order (buyer or
   * seller) — release/refund/dispute are step-wise and each step names
   * which side must sign it (`PrepareEscrowStepResult.signer`). Without
   * checking it here, a buyer clicking "Release Funds" before the seller
   * has completed their own on-chain step would have their wallet handed a
   * transaction that requires the seller's authorization, which Stellar
   * rejects (`tx_bad_auth`) — a confusing failure that looks like a wallet
   * problem when it's really just "not your turn yet".
   */
  sign: (
    orderId: string,
    operation: EscrowOperation,
    callerRole?: "buyer" | "seller"
  ) => Promise<void>;
  reset: () => void;
  transactionHash: string | null;
  /**
   * Which on-chain step this call is/was for — only set for the step-wise
   * operations (release/refund/dispute); stays `null` for create/fund. A
   * release the buyer drives is two of their own separate signatures
   * (`approve_milestone` then `release`), each ending in its own "confirmed"
   * screen — this is what lets the modal say *which* one just landed instead
   * of a bare "confirmed" that reads like the whole thing is done.
   */
  currentStep: EscrowStepName | null;
  error: EscrowSigningError | null;
}

/**
 * Orchestrates the full D2.1 client-side signing flow using the
 * @offer-hub/stellar-escrow-signing package. This hook provides the
 * app-specific API client functions and wallet context to the reusable
 * signing package.
 *
 * The only place `signTransaction` is called — every escrow action modal
 * (release, refund, dispute) shares this one hook instead of each wiring
 * the kit itself.
 */
export function useEscrowSigning(): UseEscrowSigningResult {
  const token = useAuthStore((s) => s.token);
  const { address, networkPassphrase } = useWalletKit();

  const {
    state,
    sign: packageSign,
    reset,
    transactionHash,
    error,
    currentStep,
  } = useStellarEscrowSigning({
    token,
    wallet: { address, networkPassphrase },
    prepareCreate: prepareEscrowCreate,
    prepareFund: prepareEscrowFund,
    prepareRelease: prepareReleaseStep,
    prepareRefund: prepareRefundStep,
    prepareDispute: prepareDisputeStep,
    submit: submitEscrowXdr,
  });

  return {
    state,
    sign: packageSign,
    reset,
    transactionHash,
    error,
    currentStep,
  };
}
