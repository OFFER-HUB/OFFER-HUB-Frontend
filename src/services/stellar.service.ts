/**
 * Stellar Horizon Client
 *
 * A minimal REST wrapper around the Horizon endpoints the frontend needs.
 * Deliberately does not use `@stellar/stellar-sdk`: the SDK is not a direct
 * dependency of this app (it only exists as transitive copies under the wallet
 * kit), reading balances is a single `GET /accounts/{id}`, and owning the
 * transport keeps the T3 Horizon -> Stellar RPC migration (D3.1) local to this
 * file.
 */

import { HORIZON_URL, STELLAR_EXPLORER_URL, USDC_ASSET_CODE, USDC_ISSUER } from "@/config/wallet";
import type { StellarAccountBalances, StellarAssetBalance } from "@/types/wallet.types";

export const XLM_ASSET_CODE = "XLM";

/**
 * Horizon has no record of the account. On Stellar this is the normal state of
 * a keypair that has never been funded, not a failure.
 */
export class StellarAccountNotFoundError extends Error {
  readonly accountId: string;

  constructor(accountId: string) {
    super(`Stellar account ${accountId} does not exist on this network.`);
    this.name = "StellarAccountNotFoundError";
    this.accountId = accountId;
  }
}

/** Horizon was reachable but answered with something unusable. */
export class HorizonRequestError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "HorizonRequestError";
    this.status = status;
  }
}

export interface FetchAccountBalancesOptions {
  /** Aborts the in-flight request, e.g. when the connected wallet changes. */
  signal?: AbortSignal;
}

/**
 * A single entry of Horizon's `balances[]` array, narrowed to the fields used
 * here. Liquidity pool shares carry `liquidity_pool_id` instead of an asset
 * code and are ignored by the matchers below.
 */
interface HorizonBalanceLine {
  asset_type: string;
  balance: string;
  asset_code?: string;
  asset_issuer?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isHorizonBalanceLine(value: unknown): value is HorizonBalanceLine {
  return (
    isRecord(value) && typeof value.asset_type === "string" && typeof value.balance === "string"
  );
}

/**
 * Pulls the usable balance lines out of an untrusted Horizon payload. Anything
 * that does not match the expected shape is dropped rather than crashing the
 * card — a malformed line must not hide the rest of the balances.
 */
function readBalanceLines(payload: unknown): HorizonBalanceLine[] {
  if (!isRecord(payload) || !Array.isArray(payload.balances)) {
    throw new HorizonRequestError("Horizon returned an account without a balances list.");
  }

  return payload.balances.filter(isHorizonBalanceLine).map((line) => ({
    asset_type: line.asset_type,
    balance: line.balance,
    asset_code: readOptionalString(line.asset_code),
    asset_issuer: readOptionalString(line.asset_issuer),
  }));
}

function missingAsset(code: string): StellarAssetBalance {
  return { code, balance: "0", hasTrustline: false };
}

/** Balances of a keypair Horizon has never seen: nothing held, nothing trusted. */
export function emptyAccountBalances(): StellarAccountBalances {
  return {
    xlm: missingAsset(XLM_ASSET_CODE),
    usdc: missingAsset(USDC_ASSET_CODE),
  };
}

function selectXlm(lines: HorizonBalanceLine[]): StellarAssetBalance {
  const native = lines.find((line) => line.asset_type === "native");
  if (native === undefined) {
    return missingAsset(XLM_ASSET_CODE);
  }
  return { code: XLM_ASSET_CODE, balance: native.balance, hasTrustline: true };
}

function selectUsdc(lines: HorizonBalanceLine[]): StellarAssetBalance {
  // Code alone is not an identity — any account can issue an asset named USDC.
  const usdc = lines.find(
    (line) => line.asset_code === USDC_ASSET_CODE && line.asset_issuer === USDC_ISSUER
  );
  if (usdc === undefined) {
    return missingAsset(USDC_ASSET_CODE);
  }
  return { code: USDC_ASSET_CODE, balance: usdc.balance, hasTrustline: true };
}

/**
 * Reads the XLM and USDC balances of a Stellar account from Horizon.
 *
 * @throws {StellarAccountNotFoundError} when the account is not funded on this network
 * @throws {HorizonRequestError} when Horizon is unreachable or answers unusably
 */
export async function fetchAccountBalances(
  accountId: string,
  options: FetchAccountBalancesOptions = {}
): Promise<StellarAccountBalances> {
  const url = `${HORIZON_URL}/accounts/${encodeURIComponent(accountId)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: options.signal,
      cache: "no-store",
    });
  } catch (cause) {
    // Rethrow aborts untouched so callers can tell "cancelled" from "failed".
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause;
    }
    throw new HorizonRequestError("Could not reach Horizon.");
  }

  if (response.status === 404) {
    throw new StellarAccountNotFoundError(accountId);
  }

  if (!response.ok) {
    throw new HorizonRequestError(`Horizon responded with ${response.status}.`, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new HorizonRequestError("Horizon returned a malformed response.", response.status);
  }

  const lines = readBalanceLines(payload);

  return {
    xlm: selectXlm(lines),
    usdc: selectUsdc(lines),
  };
}

/** Explorer page for an account on the active network, for manual verification. */
export function buildAccountExplorerUrl(accountId: string): string {
  return `${STELLAR_EXPLORER_URL}/account/${encodeURIComponent(accountId)}`;
}
