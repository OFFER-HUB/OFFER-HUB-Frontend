import { API_URL } from "@/config/api";

/**
 * Testnet-only: BlindPay's development instances settle every quote/payout
 * in USDB, their own test stablecoin, not the USDC a wallet otherwise holds.
 * This is the client-signed half of getting some — the seller's own wallet
 * signs a trustline transaction via SWK, same pattern as escrow and payout
 * signing. Only ever relevant on testnet; the backend rejects these calls
 * outside it.
 */
export interface PrepareUsdbTrustlineResult {
  unsignedXdr: string;
}

export type UsdbFundingApiError = Error & { code?: string; status?: number };

function createUsdbFundingError(message: string, code?: string, status?: number): UsdbFundingApiError {
  const error = new Error(message) as UsdbFundingApiError;
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

async function parseUsdbFundingError(response: Response, fallback: string): Promise<UsdbFundingApiError> {
  const json = (await response.json().catch(() => null)) as ErrorEnvelope | null;
  return createUsdbFundingError(json?.error?.message ?? fallback, json?.error?.code, response.status);
}

/**
 * Returns the unsigned trustline transaction for the caller's external
 * wallet to sign client-side via SWK.
 * POST /wallet/usdb/prepare
 */
export async function prepareUsdbTrustline(token: string): Promise<PrepareUsdbTrustlineResult> {
  const response = await fetch(`${API_URL}/wallet/usdb/prepare`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseUsdbFundingError(response, "Failed to prepare USDB trustline");
  }

  const json = await response.json();
  return json.data;
}

/**
 * Submits the seller-signed trustline transaction and mints testnet USDB
 * into it.
 * POST /wallet/usdb/submit
 */
export async function submitUsdbTrustline(token: string, signedXdr: string): Promise<void> {
  const response = await fetch(`${API_URL}/wallet/usdb/submit`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ signedXdr }),
  });

  if (!response.ok) {
    throw await parseUsdbFundingError(response, "Failed to submit signed trustline");
  }
}
