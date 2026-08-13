/**
 * "Claim Your Wallet" — the custodial → non-custodial migration.
 *
 * `POST /wallet/claim` hands the signing authority of a server-held account to
 * a key the user controls, via a Stellar `set_options` transaction. No funds
 * move and the account ID does not change; only who may sign.
 */

import { API_URL } from "@/config/api";

/** An escrow that still holds, or may still move, the caller's funds. */
export interface BlockingEscrow {
  escrowId: string;
  orderId: string;
  status: string;
}

/** A wallet on the account after the migration. */
export interface ClaimedWallet {
  id: string;
  publicKey: string;
  type: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface ClaimWalletResult {
  /** The custodial key that has just been stripped of its authority. */
  custodialPublicKey: string;
  /** The key that now controls the account. */
  newSignerPublicKey: string;
  /** Null when the rotation was already on-chain and only the database caught up. */
  transactionHash: string | null;
  wallets: ClaimedWallet[];
}

/**
 * A refused claim, carrying the API's error code so the UI can respond to each
 * reason differently — an active escrow is a "come back later", a non-claimable
 * account is a "there is nothing to do here".
 */
export class ClaimWalletError extends Error {
  readonly code: string;
  readonly status: number;
  /** Present only for `WALLET_CLAIM_BLOCKED_BY_ESCROW`. */
  readonly activeEscrows: BlockingEscrow[];

  constructor(message: string, code: string, status: number, activeEscrows: BlockingEscrow[] = []) {
    super(message);
    this.name = "ClaimWalletError";
    this.code = code;
    this.status = status;
    this.activeEscrows = activeEscrows;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Narrow `error.details.activeEscrows`, dropping anything malformed. */
function readBlockingEscrows(details: unknown): BlockingEscrow[] {
  if (!isRecord(details) || !Array.isArray(details.activeEscrows)) {
    return [];
  }

  return details.activeEscrows.flatMap((entry): BlockingEscrow[] => {
    if (!isRecord(entry)) return [];

    const escrowId = readString(entry.escrowId);
    const orderId = readString(entry.orderId);
    const status = readString(entry.status);

    return escrowId && orderId && status ? [{ escrowId, orderId, status }] : [];
  });
}

async function toClaimError(response: Response): Promise<ClaimWalletError> {
  let code = "UNKNOWN_ERROR";
  let message = `Request failed with status ${response.status}.`;
  let escrows: BlockingEscrow[] = [];

  try {
    const payload: unknown = await response.json();
    if (isRecord(payload) && isRecord(payload.error)) {
      code = readString(payload.error.code) ?? code;
      message = readString(payload.error.message) ?? message;
      escrows = readBlockingEscrows(payload.error.details);
    }
  } catch {
    // Not JSON; the status-based defaults stand.
  }

  return new ClaimWalletError(message, code, response.status, escrows);
}

/**
 * Transfer signing authority of the caller's custodial wallet to
 * `newSignerPublicKey`.
 *
 * The signature proves the caller controls the destination key. It covers a
 * nonce from `POST /auth/wallet/challenge`, which the server consumes on
 * success — a retry needs a fresh one.
 *
 * @throws {ClaimWalletError} for every refusal, with the API's code attached.
 */
export async function claimWallet(
  token: string,
  input: { newSignerPublicKey: string; signature: string; challenge: string }
): Promise<ClaimWalletResult> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/wallet/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ClaimWalletError(
      "Could not reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    throw await toClaimError(response);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new ClaimWalletError(
      "The server returned an unexpected response.",
      "MALFORMED_RESPONSE",
      response.status
    );
  }

  const data = payload.data;

  return {
    custodialPublicKey: readString(data.custodialPublicKey) ?? "",
    newSignerPublicKey: readString(data.newSignerPublicKey) ?? "",
    transactionHash: readString(data.transactionHash),
    wallets: Array.isArray(data.wallets)
      ? data.wallets.flatMap((w): ClaimedWallet[] => {
          if (!isRecord(w)) return [];
          const id = readString(w.id);
          const publicKey = readString(w.publicKey);
          const type = readString(w.type);
          return id && publicKey && type
            ? [
                {
                  id,
                  publicKey,
                  type,
                  isPrimary: w.isPrimary === true,
                  isActive: w.isActive === true,
                },
              ]
            : [];
        })
      : [],
  };
}
