/**
 * Wallet Configuration
 *
 * Centralized configuration for the Stellar Wallets Kit (SWK) integration.
 * SCF T1 runs entirely on Stellar testnet, so testnet is the default and
 * mainnet has to be opted into explicitly through the environment.
 */

export type StellarNetworkName = "testnet" | "public";

const CONFIGURED_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK;

/**
 * Active Stellar network.
 *
 * Anything other than an explicit "public" falls back to testnet, so a missing
 * or malformed env var can never silently point the kit at mainnet.
 */
export const STELLAR_NETWORK: StellarNetworkName =
  CONFIGURED_NETWORK === "public" ? "public" : "testnet";
