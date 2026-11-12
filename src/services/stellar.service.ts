/**
 * Stellar RPC balance reader
 *
 * Reads the connected wallet's XLM and USDC balances through Stellar RPC
 * (`getLedgerEntries` for the account entry and the USDC trustline entry, in
 * one call), the same way the API's StellarRpcClient does (D3.1).
 */

import { Asset, Keypair, rpc, xdr } from "@stellar/stellar-sdk";
import { STELLAR_EXPLORER_URL, STELLAR_RPC_URL, USDC_ASSET_CODE, USDC_ISSUER } from "@/config/wallet";
import type { StellarAccountBalances, StellarAssetBalance } from "@/types/wallet.types";

export const XLM_ASSET_CODE = "XLM";

/** Classic balances are int64 stroops: 7 decimal places. */
const STROOPS_PER_UNIT = BigInt(10_000_000);

/**
 * The ledger has no entry for the account. On Stellar this is the normal state
 * of a keypair that has never been funded, not a failure.
 */
export class StellarAccountNotFoundError extends Error {
  readonly accountId: string;

  constructor(accountId: string) {
    super(`Stellar account ${accountId} does not exist on this network.`);
    this.name = "StellarAccountNotFoundError";
    this.accountId = accountId;
  }
}

/** Stellar RPC was unreachable or answered with something unusable. */
export class StellarRpcRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StellarRpcRequestError";
  }
}

export interface FetchAccountBalancesOptions {
  /** Drops the result if the connected wallet changed while the read was in flight. */
  signal?: AbortSignal;
}

/** Only the method this reader needs, so tests can stand in for the server. */
export interface LedgerEntriesReader {
  getLedgerEntries(...keys: xdr.LedgerKey[]): Promise<rpc.Api.GetLedgerEntriesResponse>;
}

let defaultServer: LedgerEntriesReader | null = null;

function getDefaultServer(): LedgerEntriesReader {
  defaultServer ??= new rpc.Server(STELLAR_RPC_URL, {
    allowHttp: STELLAR_RPC_URL.startsWith("http://"),
  });
  return defaultServer;
}

/** "9974.9999800" from 99749999800 stroops: the 7-decimal fixed point wallets show. */
export function formatStroops(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_UNIT;
  const fraction = (stroops % STROOPS_PER_UNIT).toString().padStart(7, "0");
  return `${whole}.${fraction}`;
}

function missingAsset(code: string): StellarAssetBalance {
  return { code, balance: "0", hasTrustline: false };
}

/** Balances of a keypair the ledger has never seen: nothing held, nothing trusted. */
export function emptyAccountBalances(): StellarAccountBalances {
  return {
    xlm: missingAsset(XLM_ASSET_CODE),
    usdc: missingAsset(USDC_ASSET_CODE),
  };
}

function ledgerKeysFor(accountId: string): [xdr.LedgerKey, xdr.LedgerKey] {
  const account = Keypair.fromPublicKey(accountId).xdrAccountId();
  // Code alone is not an identity: any account can issue an asset named USDC,
  // so the trustline key pins the issuer.
  const usdc = new Asset(USDC_ASSET_CODE, USDC_ISSUER);
  return [
    xdr.LedgerKey.account(new xdr.LedgerKeyAccount({ accountId: account })),
    xdr.LedgerKey.trustline(new xdr.LedgerKeyTrustLine({ accountId: account, asset: usdc.toTrustLineXDRObject() })),
  ];
}

/**
 * Reads the XLM and USDC balances of a Stellar account through Stellar RPC.
 *
 * @throws {StellarAccountNotFoundError} when the account is not funded on this network
 * @throws {StellarRpcRequestError} when the address is invalid or the RPC is unreachable
 */
export async function fetchAccountBalances(
  accountId: string,
  options: FetchAccountBalancesOptions = {},
  server: LedgerEntriesReader = getDefaultServer()
): Promise<StellarAccountBalances> {
  let keys: [xdr.LedgerKey, xdr.LedgerKey];
  try {
    keys = ledgerKeysFor(accountId);
  } catch {
    throw new StellarRpcRequestError(`${accountId} is not a valid Stellar address.`);
  }

  let response: rpc.Api.GetLedgerEntriesResponse;
  try {
    response = await server.getLedgerEntries(...keys);
  } catch {
    throw new StellarRpcRequestError("Could not reach Stellar RPC.");
  }

  // The SDK takes no AbortSignal; honour it so a stale read never overwrites
  // the balances of the wallet the user switched to.
  if (options.signal?.aborted) {
    throw new DOMException("The balance read was aborted.", "AbortError");
  }

  let xlm: StellarAssetBalance | null = null;
  let usdc = missingAsset(USDC_ASSET_CODE);
  for (const entry of response.entries) {
    const kind = entry.val.switch();
    if (kind === xdr.LedgerEntryType.account()) {
      xlm = { code: XLM_ASSET_CODE, balance: formatStroops(BigInt(entry.val.account().balance().toString())), hasTrustline: true };
    } else if (kind === xdr.LedgerEntryType.trustline()) {
      usdc = { code: USDC_ASSET_CODE, balance: formatStroops(BigInt(entry.val.trustLine().balance().toString())), hasTrustline: true };
    }
  }

  if (xlm === null) {
    throw new StellarAccountNotFoundError(accountId);
  }

  return { xlm, usdc };
}

/** Explorer page for an account on the active network, for manual verification. */
export function buildAccountExplorerUrl(accountId: string): string {
  return `${STELLAR_EXPLORER_URL}/account/${encodeURIComponent(accountId)}`;
}
