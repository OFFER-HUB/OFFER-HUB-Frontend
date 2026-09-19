/**
 * Bridges the app's existing Stellar Wallets Kit connection into a
 * `SubRosaClient`. No new wallet flow, no secret keys in the frontend: the
 * client signs every AssembledTransaction through the same
 * `StellarWalletsKit.signTransaction` call the escrow flow already uses
 * (see src/hooks/useEscrowSigning.ts).
 *
 * Only XDR *strings* cross this boundary — never `@stellar/stellar-sdk`
 * object instances — so the SDK's bundled stellar-sdk (v15) and the version
 * inside Stellar Wallets Kit coexist without clashing.
 */

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { SubRosaClient, type SubRosaNetwork } from "@sub-rosa/sdk";
import type { SignTransaction } from "@stellar/stellar-sdk/contract";

export interface WalletContext {
  /** Connected wallet address (G…). The round's operator / a bidder. */
  address: string;
  /** Network passphrase the connected wallet is on. */
  networkPassphrase: string;
}

/**
 * Wrap the connected wallet as the SDK's `SignTransaction` adapter. The SDK
 * builds and simulates the transaction, hands us the unsigned XDR, and we
 * return the wallet-signed XDR for it to submit.
 */
export function walletSignTransaction({ address, networkPassphrase }: WalletContext): SignTransaction {
  return async (xdr, opts) => {
    const { signedTxXdr, signerAddress } = await StellarWalletsKit.signTransaction(xdr, {
      // Prefer whatever the SDK asks for, but fall back to the connected
      // wallet's own network/address so a caller can't accidentally sign on
      // the wrong network.
      networkPassphrase: opts?.networkPassphrase ?? networkPassphrase,
      address: opts?.address ?? address,
    });
    return { signedTxXdr, signerAddress: signerAddress ?? address };
  };
}

export interface MakeClientOptions extends WalletContext {
  /** Defaults to "testnet" — the network the hackathon demo runs on. */
  network?: SubRosaNetwork;
}

/**
 * Build a `SubRosaClient` that auto-signs through the connected wallet. The
 * deployment (contract id, rpc, passphrase) is resolved by the SDK from
 * `network`; we never hand-carry a contract id here.
 */
export function makeSubRosaClient({
  address,
  networkPassphrase,
  network = "testnet",
}: MakeClientOptions): SubRosaClient {
  return new SubRosaClient({
    network,
    publicKey: address,
    signTransaction: walletSignTransaction({ address, networkPassphrase }),
  });
}
