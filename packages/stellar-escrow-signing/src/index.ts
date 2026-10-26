/**
 * @offer-hub/stellar-escrow-signing
 *
 * A React hook for client-side Stellar/Soroban escrow signing operations.
 * Provides a reusable, MIT-licensed signing layer that can be integrated
 * into any React application using Stellar Wallets Kit.
 *
 * @example
 * ```tsx
 * import { useStellarEscrowSigning } from "@offer-hub/stellar-escrow-signing";
 *
 * function MyComponent() {
 *   const { state, sign, reset, transactionHash, error, currentStep } =
 *     useStellarEscrowSigning({
 *       token: userToken,
 *       wallet: { address, networkPassphrase },
 *       prepareCreate: myApiPrepareCreate,
 *       prepareFund: myApiPrepareFund,
 *       prepareRelease: myApiPrepareRelease,
 *       prepareRefund: myApiPrepareRefund,
 *       prepareDispute: myApiPrepareDispute,
 *       submit: myApiSubmit,
 *     });
 *
 *   // Use state to drive UI
 * }
 * ```
 */

export type {
  EscrowOperation,
  EscrowStepName,
  PrepareEscrowResult,
  PrepareEscrowStepResult,
  SubmitEscrowXdrResult,
  EscrowSigningState,
  EscrowSigningErrorCode,
  EscrowSigningError,
  PrepareFn,
  SubmitFn,
  WalletContext,
  UseStellarEscrowSigningConfig,
  UseStellarEscrowSigningResult,
} from "./types";

export { useStellarEscrowSigning } from "./use-stellar-escrow-signing";
export { isWalletCancellation, toWalletErrorMessage } from "./wallet-error-messages";
