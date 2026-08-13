/**
 * Wallet Authentication Service
 *
 * Client half of the D1.2 challenge-response flow: ask the API for a nonce,
 * sign it in the user's wallet, hand the signature back for a JWT.
 *
 * Uses `fetch` directly rather than `./http-client`, which types every response
 * as `ApiResponse` (`ok`, `code`, `title`, …). This API answers with the
 * `{ data }` / `{ error }` envelope instead, so `ApiResponse.ok` would read as
 * `undefined` and a successful call would look like a failure. The `lib/api/*`
 * modules talk to the same backend the same way.
 */

import { API_URL } from "@/config/api";
import type { User } from "@/stores/auth-store";

/** A nonce to sign, and how long the API will keep accepting it. */
export interface WalletChallenge {
  challenge: string;
  expiresIn: number;
}

/** A verified wallet session: the same pair an email login produces. */
export interface WalletSession {
  user: User;
  token: string;
}

/**
 * A failed wallet-auth call, carrying the API's own error code so callers can
 * react to specific cases (an expired nonce is worth retrying; a mismatched
 * signature is not).
 */
export class WalletAuthError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "WalletAuthError";
    this.code = code;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Pull the API's `{ error: { code, message } }` out of a failed response.
 *
 * Falls back to the HTTP status when the body is missing or unparseable — a 502
 * from a proxy never reaches the application error envelope.
 */
async function toWalletAuthError(response: Response): Promise<WalletAuthError> {
  let code = "UNKNOWN_ERROR";
  let message = `Request failed with status ${response.status}.`;

  try {
    const payload: unknown = await response.json();
    if (isRecord(payload) && isRecord(payload.error)) {
      code = readString(payload.error.code) ?? code;
      message = readString(payload.error.message) ?? message;
    }
  } catch {
    // Body was not JSON; the status-based defaults above stand.
  }

  return new WalletAuthError(message, code, response.status);
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new WalletAuthError(
      "Could not reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    throw await toWalletAuthError(response);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || payload.data === undefined) {
    throw new WalletAuthError(
      "The server returned an unexpected response.",
      "MALFORMED_RESPONSE",
      response.status
    );
  }

  return payload.data;
}

/**
 * Ask the API for a nonce bound to `publicKey`.
 *
 * Public endpoint — ownership has not been proven yet, which is what the
 * signature in {@link verifySignature} is for.
 */
export async function requestChallenge(publicKey: string): Promise<WalletChallenge> {
  const data = await postJson("/auth/wallet/challenge", { publicKey });

  if (!isRecord(data) || typeof data.challenge !== "string") {
    throw new WalletAuthError(
      "The server did not return a challenge to sign.",
      "MALFORMED_RESPONSE",
      200
    );
  }

  return {
    challenge: data.challenge,
    expiresIn: typeof data.expiresIn === "number" ? data.expiresIn : 0,
  };
}

/**
 * Exchange a signed challenge for a session.
 *
 * `challenge` is a parameter rather than state held here because the API
 * verifies the signature against the exact nonce it issued, and the nonce is
 * consumed on success — a second attempt needs a fresh one from
 * {@link requestChallenge}.
 */
export async function verifySignature(
  publicKey: string,
  signature: string,
  challenge: string
): Promise<WalletSession> {
  const data = await postJson("/auth/wallet/verify", { publicKey, signature, challenge });

  if (!isRecord(data) || typeof data.token !== "string" || !isRecord(data.user)) {
    throw new WalletAuthError("The server did not return a session.", "MALFORMED_RESPONSE", 200);
  }

  return { user: toUser(data.user), token: data.token };
}

const USER_TYPES = ["BUYER", "SELLER", "BOTH", "ADMIN"] as const;
type UserType = (typeof USER_TYPES)[number];

function toUserType(value: unknown): UserType | undefined {
  return USER_TYPES.find((candidate) => candidate === value);
}

/**
 * Narrow the API's user payload onto the store's `User`.
 *
 * `email` is nullable server-side (a wallet-first account may never have one)
 * but required by the store, so it collapses to an empty string rather than
 * being dropped — the store's consumers render it, they do not authenticate
 * with it.
 */
function toUser(payload: Record<string, unknown>): User {
  const wallet = isRecord(payload.wallet) ? payload.wallet : null;

  return {
    id: String(payload.id),
    email: readString(payload.email) ?? "",
    username: readString(payload.username) ?? String(payload.id),
    firstName: readString(payload.firstName),
    lastName: readString(payload.lastName),
    type: toUserType(payload.type),
    wallet:
      wallet && typeof wallet.publicKey === "string"
        ? { publicKey: wallet.publicKey, type: readString(wallet.type) ?? "EXTERNAL" }
        : undefined,
  };
}
