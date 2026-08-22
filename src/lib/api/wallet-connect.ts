/**
 * Link a user-controlled Stellar wallet to an account that is already
 * signed in — the T1 "connect a wallet inside the platform" flow.
 *
 * `POST /wallet/connect` sits behind the JWT guard: the caller proves they
 * control `publicKey` with a signature over a nonce from
 * `POST /auth/wallet/challenge` (see `wallet-auth.service.ts`), the same
 * proof used for wallet-based sign-in. No session changes — the wallet is
 * just added to the account's existing one.
 */

import { API_URL } from "@/config/api";

/** A wallet on the account after the call — the full list, newest last. */
export interface ConnectedWallet {
  id: string;
  publicKey: string;
  type: string;
  provider: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
}

/**
 * A failed connect call, carrying the API's error code so the UI can react to
 * each reason differently — a key already linked to another account is not
 * the same problem as an invalid signature.
 */
export class ConnectWalletError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ConnectWalletError";
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

async function toConnectError(response: Response): Promise<ConnectWalletError> {
  let code = "UNKNOWN_ERROR";
  let message = `Request failed with status ${response.status}.`;

  try {
    const payload: unknown = await response.json();
    if (isRecord(payload) && isRecord(payload.error)) {
      code = readString(payload.error.code) ?? code;
      message = readString(payload.error.message) ?? message;
    }
  } catch {
    // Not JSON; the status-based defaults stand.
  }

  return new ConnectWalletError(message, code, response.status);
}

function toConnectedWallets(data: unknown): ConnectedWallet[] {
  if (!Array.isArray(data)) return [];

  return data.flatMap((entry): ConnectedWallet[] => {
    if (!isRecord(entry)) return [];

    const id = readString(entry.id);
    const publicKey = readString(entry.publicKey);
    const type = readString(entry.type);
    const provider = readString(entry.provider);
    const createdAt = readString(entry.createdAt);

    return id && publicKey && type && provider && createdAt
      ? [
          {
            id,
            publicKey,
            type,
            provider,
            isPrimary: entry.isPrimary === true,
            isActive: entry.isActive === true,
            createdAt,
          },
        ]
      : [];
  });
}

/**
 * Link `publicKey` to the signed-in account.
 *
 * Re-linking a key the caller already owns is a no-op that returns the
 * current list, which makes retries safe.
 *
 * @throws {ConnectWalletError} for every refusal, with the API's code attached.
 */
export async function connectWallet(
  token: string,
  input: { publicKey: string; signature: string; challenge: string }
): Promise<ConnectedWallet[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/wallet/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ConnectWalletError(
      "Could not reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    throw await toConnectError(response);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new ConnectWalletError(
      "The server returned an unexpected response.",
      "MALFORMED_RESPONSE",
      response.status
    );
  }

  return toConnectedWallets(payload.data);
}

/**
 * Deactivate `walletId` on the signed-in account (`POST /wallet/disconnect`).
 *
 * The row is kept, never deleted, as audit history — this just flips
 * `isActive`/`isPrimary` off. Disconnecting the account's current primary
 * wallet does not auto-promote another one.
 *
 * @throws {ConnectWalletError} for every refusal, with the API's code attached.
 */
export async function disconnectWallet(token: string, walletId: string): Promise<ConnectedWallet[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/wallet/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ walletId }),
    });
  } catch {
    throw new ConnectWalletError(
      "Could not reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    throw await toConnectError(response);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new ConnectWalletError(
      "The server returned an unexpected response.",
      "MALFORMED_RESPONSE",
      response.status
    );
  }

  return toConnectedWallets(payload.data);
}

/**
 * The account's full wallet history (`GET /wallet/wallets`): active and
 * inactive, primary or not. A plain read, unlike connect/disconnect/set-primary
 * which all return the list only as a side effect of a mutation.
 *
 * @throws {ConnectWalletError} for every refusal, with the API's code attached.
 */
export async function listWallets(token: string): Promise<ConnectedWallet[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/wallet/wallets`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ConnectWalletError(
      "Could not reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    throw await toConnectError(response);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new ConnectWalletError(
      "The server returned an unexpected response.",
      "MALFORMED_RESPONSE",
      response.status
    );
  }

  return toConnectedWallets(payload.data);
}

/**
 * Promote `walletId` to primary (`POST /wallet/set-primary`). Demotes
 * whichever wallet held that role before, in the same backend transaction.
 *
 * @throws {ConnectWalletError} for every refusal, with the API's code attached.
 */
export async function setPrimaryWalletApi(token: string, walletId: string): Promise<ConnectedWallet[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/wallet/set-primary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ walletId }),
    });
  } catch {
    throw new ConnectWalletError(
      "Could not reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  if (!response.ok) {
    throw await toConnectError(response);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new ConnectWalletError(
      "The server returned an unexpected response.",
      "MALFORMED_RESPONSE",
      response.status
    );
  }

  return toConnectedWallets(payload.data);
}
