/**
 * Stellar RPC balance reader
 *
 * Reads the connected wallet's XLM and USDC balances through Stellar RPC
 * (`getLedgerEntries` for the account entry and the USDC trustline entry, in
 * one call), the same way the API's StellarRpcClient does (D3.1).
 */

import { Asset, BASE_FEE, Keypair, Operation, TransactionBuilder, rpc, xdr } from "@stellar/stellar-sdk";
import {
  NETWORK_PASSPHRASE,
  STELLAR_EXPLORER_URL,
  STELLAR_RPC_URL,
  USDC_ASSET_CODE,
  USDC_ISSUER,
} from "@/config/wallet";
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

/** The RPC methods the trustline flow needs: load the account, submit, poll. */
export interface TransactionRpc {
  getAccount(address: string): Promise<{ accountId(): string; sequenceNumber(): string; incrementSequenceNumber(): void }>;
  sendTransaction(transaction: ReturnType<TransactionBuilder["build"]>): Promise<rpc.Api.SendTransactionResponse>;
  getTransaction(hash: string): Promise<rpc.Api.GetTransactionResponse>;
}

let defaultServer: rpc.Server | null = null;

function getDefaultServer(): rpc.Server {
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

/** A changeTrust the network rejected, or that never landed. */
export class StellarTransactionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StellarTransactionError";
  }
}

/** Ledgers close every ~5s; 30 polls a second apart covers a slow close. */
const CONFIRM_ATTEMPTS = 30;
const CONFIRM_INTERVAL_MS = 1_000;

/**
 * Unsigned `changeTrust` for the configured USDC asset, for the wallet to sign
 * (#522). A trustline is what lets an account hold USDC; it reserves 0.5 XLM.
 *
 * @throws {StellarAccountNotFoundError} when the account is not funded yet
 * @throws {StellarRpcRequestError} when the RPC is unreachable
 */
export async function buildUsdcTrustlineXdr(
  accountId: string,
  server: TransactionRpc = getDefaultServer()
): Promise<string> {
  let account: Awaited<ReturnType<TransactionRpc["getAccount"]>>;
  try {
    account = await server.getAccount(accountId);
  } catch (cause) {
    if (cause instanceof Error && /not found/i.test(cause.message)) {
      throw new StellarAccountNotFoundError(accountId);
    }
    throw new StellarRpcRequestError("Could not reach Stellar RPC.");
  }

  return new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(Operation.changeTrust({ asset: new Asset(USDC_ASSET_CODE, USDC_ISSUER) }))
    .setTimeout(180)
    .build()
    .toXDR();
}

/**
 * Submits a wallet-signed transaction and waits until it is in a closed ledger.
 * Returns the transaction hash.
 *
 * @throws {StellarTransactionError} when it is rejected, fails, or never lands
 * @throws {StellarRpcRequestError} when the RPC is unreachable
 */
export async function submitSignedTransaction(
  signedXdr: string,
  server: TransactionRpc = getDefaultServer(),
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
): Promise<string> {
  const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  let sent: rpc.Api.SendTransactionResponse;
  try {
    sent = await server.sendTransaction(transaction as ReturnType<TransactionBuilder["build"]>);
  } catch {
    throw new StellarRpcRequestError("Could not reach Stellar RPC.");
  }
  if (sent.status === "ERROR" || sent.status === "TRY_AGAIN_LATER") {
    throw new StellarTransactionError("The network rejected the transaction. Please try again.");
  }

  for (let attempt = 0; attempt < CONFIRM_ATTEMPTS; attempt++) {
    const result = await server.getTransaction(sent.hash).catch(() => null);
    if (result?.status === rpc.Api.GetTransactionStatus.SUCCESS) return sent.hash;
    if (result?.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new StellarTransactionError("The transaction failed on the network.");
    }
    await sleep(CONFIRM_INTERVAL_MS);
  }
  throw new StellarTransactionError("The transaction was not confirmed in time. Check the explorer and refresh.");
}

/** Explorer page for an account on the active network, for manual verification. */
export function buildAccountExplorerUrl(accountId: string): string {
  return `${STELLAR_EXPLORER_URL}/account/${encodeURIComponent(accountId)}`;
}
