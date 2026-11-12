/**
 * Core types for Stellar escrow signing operations.
 */

/**
 * Escrow operations that can be signed client-side.
 */
export type EscrowOperation = "create" | "fund" | "release" | "refund" | "dispute";

/**
 * Individual on-chain steps for step-wise operations.
 */
export type EscrowStepName = "complete_milestone" | "approve_milestone" | "release" | "dispute";

/**
 * Result of the two single-shot prepare endpoints (create, fund).
 */
export interface PrepareEscrowResult {
  unsignedXdr: string;
  operation: "create" | "fund";
  /** Unix ms after which the XDR is no longer valid (4-minute Soroban window). */
  expiresAt: number;
  orderId: string;
}

/**
 * Result of the three step-wise prepare endpoints (release, refund, dispute).
 *
 * `step: null` means the sequence for this operation has already finished —
 * callers should stop asking and move on, not retry.
 */
export interface PrepareEscrowStepResult {
  orderId: string;
  operation: "release" | "refund" | "dispute";
  step: EscrowStepName | null;
  /** Whose wallet has to sign this step. Null when there is nothing left. */
  signer: "buyer" | "seller" | null;
  unsignedXdr: string | null;
  expiresAt: number | null;
}

/**
 * Result of submitting a signed XDR.
 */
export interface SubmitEscrowXdrResult {
  transactionHash: string;
  order: unknown; // App-specific order type, left generic for package reusability
}

/**
 * Where the signing flow currently is.
 */
export type EscrowSigningState =
  | "idle"
  | "building"
  | "awaiting_signature"
  | "submitting"
  | "confirmed"
  | "error";

/**
 * Error codes for signing failures.
 */
export type EscrowSigningErrorCode =
  | "USER_REJECTED"
  | "XDR_EXPIRED"
  | "NO_WALLET_CONNECTED"
  | "WRONG_SIGNER"
  | "STALE_TRANSACTION"
  | "API_ERROR";

/**
 * Error object with typed code.
 */
export interface EscrowSigningError {
  code: EscrowSigningErrorCode;
  message: string;
}

/**
 * Prepare function signature for fetching unsigned XDR.
 */
export type PrepareFn<T extends PrepareEscrowResult | PrepareEscrowStepResult> = (
  token: string,
  orderId: string
) => Promise<T>;

/**
 * Submit function signature for posting signed XDR.
 */
export type SubmitFn = (
  token: string,
  orderId: string,
  signedXdr: string,
  operation: EscrowOperation,
  idempotencyKey: string
) => Promise<SubmitEscrowXdrResult>;

/**
 * Wallet context provided by the consumer app.
 */
export interface WalletContext {
  /** Connected wallet address. */
  address: string | null;
  /** Stellar network passphrase (e.g., "Test SDF Network ; September 2015"). */
  networkPassphrase: string;
}

/**
 * Configuration for the signing hook.
 */
export interface UseStellarEscrowSigningConfig {
  /** Auth token for API calls. */
  token: string | null;
  /** Wallet context from Stellar Wallets Kit. */
  wallet: WalletContext;
  /** Prepare function for create operation. */
  prepareCreate: PrepareFn<PrepareEscrowResult>;
  /** Prepare function for fund operation. */
  prepareFund: PrepareFn<PrepareEscrowResult>;
  /** Prepare function for release operation. */
  prepareRelease: PrepareFn<PrepareEscrowStepResult>;
  /** Prepare function for refund operation. */
  prepareRefund: PrepareFn<PrepareEscrowStepResult>;
  /** Prepare function for dispute operation. */
  prepareDispute: PrepareFn<PrepareEscrowStepResult>;
  /** Submit function for signed XDR. */
  submit: SubmitFn;
}

/**
 * Result of the signing hook.
 */
export interface UseStellarEscrowSigningResult {
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
