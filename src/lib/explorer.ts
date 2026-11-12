import { EXPLORER_URL_BY_NETWORK, STELLAR_NETWORK, type StellarNetworkName } from "@/config/wallet";

export type ExplorerResource = "tx" | "account" | "contract";

/**
 * Stellar Expert link for a transaction, account or contract.
 *
 * Defaults to the network this build runs on, so a mainnet build never links
 * to testnet. Data that records its own network (e.g. a validation run) passes
 * it explicitly.
 */
export function explorerUrl(
  resource: ExplorerResource,
  id: string,
  network: StellarNetworkName = STELLAR_NETWORK
): string {
  return `${EXPLORER_URL_BY_NETWORK[network]}/${resource}/${encodeURIComponent(id)}`;
}
