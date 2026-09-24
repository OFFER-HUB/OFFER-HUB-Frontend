import type { Order } from "@/types/order.types";
import { API_URL } from "@/config/api";

/**
 * Operations the D2.1 signed-XDR submit endpoint accepts. Matches
 * `ESCROW_SUBMIT_OPERATIONS` in OFFER-HUB-API (apps/api/src/modules/orders/dto/submit-escrow-xdr.dto.ts).
 * "fund" is required here even though it's a single-shot step like "create" —
 * a buyer with an external wallet still has to sign the fund-escrow XDR after
 * the create XDR lands, before the order can move to IN_PROGRESS.
 */
export type EscrowOperation = "create" | "fund" | "release" | "refund" | "dispute";

/**
 * Result of the two single-shot prepare endpoints (create, fund).
 * Mirrors `PrepareEscrowResult` in orders.service.ts.
 */
export interface PrepareEscrowResult {
  unsignedXdr: string;
  operation: "create" | "fund";
  /** Unix ms after which the XDR is no longer valid (4-minute Soroban window). */
  expiresAt: number;
  orderId: string;
}

/** One on-chain leg of a step-wise operation. */
export type EscrowStepName = "complete_milestone" | "approve_milestone" | "release" | "dispute";

/**
 * Result of the three step-wise prepare endpoints (release, refund, dispute).
 * Mirrors `PrepareEscrowStepResult` in release-refund.service.ts.
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

/** Result of POST /orders/:id/escrow/submit. Mirrors `SubmitEscrowXdrResult`. */
export interface SubmitEscrowXdrResult {
  transactionHash: string;
  order: Order;
}

export type EscrowApiError = Error & { code?: string; status?: number };

function createEscrowError(message: string, code?: string, status?: number): EscrowApiError {
  const error = new Error(message) as EscrowApiError;
  error.code = code;
  error.status = status;
  return error;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

interface ErrorEnvelope {
  error?: { code?: string; message?: string };
}

async function parseEscrowError(response: Response, fallback: string): Promise<EscrowApiError> {
  const json = (await response.json().catch(() => null)) as ErrorEnvelope | null;
  return createEscrowError(json?.error?.message ?? fallback, json?.error?.code, response.status);
}

/**
 * Prepare the create-escrow unsigned XDR. Buyer only, external wallet only,
 * order must be FUNDS_RESERVED with no escrow yet.
 * POST /orders/:id/escrow/prepare
 */
export async function prepareEscrowCreate(token: string, orderId: string): Promise<PrepareEscrowResult> {
  const response = await fetch(`${API_URL}/orders/${orderId}/escrow/prepare`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseEscrowError(response, "Failed to prepare escrow creation");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Prepare the fund-escrow unsigned XDR. Called after the signed create XDR
 * has been submitted and the contract deployed.
 * POST /orders/:id/escrow/fund/prepare
 */
export async function prepareEscrowFund(token: string, orderId: string): Promise<PrepareEscrowResult> {
  const response = await fetch(`${API_URL}/orders/${orderId}/escrow/fund/prepare`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseEscrowError(response, "Failed to prepare escrow funding");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Next unsigned step of a release. A release is three transactions
 * (complete_milestone -> approve_milestone -> release) signed alternately by
 * seller and buyer. Call this again after each submit to get the next step;
 * `step: null` means the release is done.
 * POST /orders/:orderId/resolution/release/prepare
 */
export async function prepareReleaseStep(token: string, orderId: string): Promise<PrepareEscrowStepResult> {
  const response = await fetch(`${API_URL}/orders/${orderId}/resolution/release/prepare`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseEscrowError(response, "Failed to prepare release step");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Next unsigned step of a refund. Only the buyer's dispute step is returned
 * from here — the platform signs the resolution server-side.
 * POST /orders/:orderId/resolution/refund/prepare
 */
export async function prepareRefundStep(token: string, orderId: string): Promise<PrepareEscrowStepResult> {
  const response = await fetch(`${API_URL}/orders/${orderId}/resolution/refund/prepare`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseEscrowError(response, "Failed to prepare refund step");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Unsigned transaction that puts the escrow into dispute.
 * POST /orders/:orderId/resolution/dispute/prepare
 */
export async function prepareDisputeStep(token: string, orderId: string): Promise<PrepareEscrowStepResult> {
  const response = await fetch(`${API_URL}/orders/${orderId}/resolution/dispute/prepare`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseEscrowError(response, "Failed to prepare dispute step");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Submit a client-signed XDR for any D2.1 operation. The caller only names
 * which operation this belongs to — which step of a step-wise operation it
 * is follows from the source account already signed into the transaction.
 * Requires an Idempotency-Key so a network retry can never resubmit the same
 * transaction twice.
 * POST /orders/:id/escrow/submit
 */
export async function submitEscrowXdr(
  token: string,
  orderId: string,
  signedXdr: string,
  operation: EscrowOperation,
  idempotencyKey: string
): Promise<SubmitEscrowXdrResult> {
  const response = await fetch(`${API_URL}/orders/${orderId}/escrow/submit`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ signedXdr, operation }),
  });

  if (!response.ok) {
    throw await parseEscrowError(response, "Failed to submit signed transaction");
  }

  const json = await response.json();
  return json.data;
}
