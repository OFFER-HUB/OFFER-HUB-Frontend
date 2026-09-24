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

const HORIZON_URL_BY_NETWORK: Record<StellarNetworkName, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  public: "https://horizon.stellar.org",
};

const EXPLORER_URL_BY_NETWORK: Record<StellarNetworkName, string> = {
  testnet: "https://stellar.expert/explorer/testnet",
  public: "https://stellar.expert/explorer/public",
};

/**
 * Circle's USDC issuers. Reading a balance means matching `asset_code` **and**
 * `asset_issuer`, because anyone can issue an asset called "USDC" — the code
 * alone is not an identity.
 */
const USDC_ISSUER_BY_NETWORK: Record<StellarNetworkName, string> = {
  testnet: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
  public: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
};

/** Stellar public keys are strkey-encoded ed25519 keys: "G" plus 55 base32 chars. */
const STELLAR_PUBLIC_KEY_PATTERN = /^G[A-Z2-7]{55}$/;

function readHttpUrlOverride(value: string | undefined): string | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin + parsed.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function readPublicKeyOverride(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return STELLAR_PUBLIC_KEY_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * Horizon REST base URL, without a trailing slash.
 *
 * Defaults are derived from {@link STELLAR_NETWORK} so the URL can never
 * disagree with the network SWK signs against. The override exists for local
 * Horizon instances and is ignored unless it parses as an http(s) URL.
 *
 * Balances are read over plain REST rather than through `@stellar/stellar-sdk`:
 * the SDK is not a direct dependency here (it only appears as a transitive copy
 * under the wallet kit), and a thin wrapper is what the T3 Horizon -> Stellar
 * RPC migration (D3.1) has to swap out anyway.
 */
export const HORIZON_URL: string =
  readHttpUrlOverride(process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL) ??
  HORIZON_URL_BY_NETWORK[STELLAR_NETWORK];

/** Block explorer base URL for the active network, without a trailing slash. */
export const STELLAR_EXPLORER_URL: string = EXPLORER_URL_BY_NETWORK[STELLAR_NETWORK];

/** Asset code of the stablecoin shown next to XLM. */
export const USDC_ASSET_CODE = "USDC";

/**
 * USDC issuer for the active network. A malformed override falls back to the
 * network default rather than silently matching nothing.
 */
export const USDC_ISSUER: string =
  readPublicKeyOverride(process.env.NEXT_PUBLIC_STELLAR_USDC_ISSUER) ??
  USDC_ISSUER_BY_NETWORK[STELLAR_NETWORK];
