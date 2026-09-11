import { API_URL } from "@/config/api";

/**
 * Result of POST /orders/:orderId/payout/prepare. Mirrors
 * `PreparePayoutTransferResult` in payout-flow.service.ts.
 *
 * Only reachable for a non-custodial (EXTERNAL wallet) seller — a custodial
 * seller's payout is signed and dispatched automatically server-side.
 */
export interface PreparePayoutTransferResult {
  orderId: string;
  payoutId: string;
  /** Echoed back on submit — a concurrency token, not just an identifier. */
  quoteId: string;
  unsignedXdr: string;
  /** Unix ms after which the quote is no longer usable. */
  expiresAt: number;
  senderWalletAddress: string;
  usdcAmount: string;
  fiatAmount: string | null;
  fiatCurrency: string;
  corridor: string;
}

export type PayoutApiError = Error & { code?: string; status?: number };

function createPayoutError(message: string, code?: string, status?: number): PayoutApiError {
  const error = new Error(message) as PayoutApiError;
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

async function parsePayoutError(response: Response, fallback: string): Promise<PayoutApiError> {
  const json = (await response.json().catch(() => null)) as ErrorEnvelope | null;
  return createPayoutError(json?.error?.message ?? fallback, json?.error?.code, response.status);
}

/**
 * Returns a fresh (or still-usable) unsigned transfer for the seller to sign
 * client-side via SWK — the USDC leaving their own wallet toward BlindPay's
 * deposit address. Safe to call repeatedly: an unexpired pending transaction
 * is returned as-is instead of minting a new BlindPay quote every time.
 * POST /orders/:orderId/payout/prepare
 */
export async function preparePayoutTransfer(
  token: string,
  orderId: string
): Promise<PreparePayoutTransferResult> {
  const response = await fetch(`${API_URL}/orders/${orderId}/payout/prepare`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parsePayoutError(response, "Failed to prepare payout transfer");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Dispatches the seller-signed transfer to BlindPay. `quoteId` must be the
 * one returned by the `preparePayoutTransfer` call this signature came
 * from — a stale quote (replaced by a later prepare call) is rejected rather
 * than dispatched. Requires an Idempotency-Key so a network retry can never
 * resubmit the same transfer twice.
 * POST /orders/:orderId/payout/submit
 */
export async function submitPayoutTransfer(
  token: string,
  orderId: string,
  quoteId: string,
  signedXdr: string,
  idempotencyKey: string
): Promise<void> {
  const response = await fetch(`${API_URL}/orders/${orderId}/payout/submit`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({ quoteId, signedXdr }),
  });

  if (!response.ok) {
    throw await parsePayoutError(response, "Failed to submit signed payout transfer");
  }
}
