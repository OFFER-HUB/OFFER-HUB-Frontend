import type { StellarNetworkName } from "@/config/wallet";

/**
 * Wallet slice of the auth store.
 *
 * `walletConnected` is redundant with `walletAddress !== null`. Both are kept
 * because consumers read the flag, and the two fields are only ever written
 * together by the actions below — never set them independently or they will
 * drift.
 *
 * Connecting a wallet does not authenticate the user: it is independent of
 * `isAuthenticated`, which still comes from email/password or OAuth until the
 * D1.2 challenge-response flow lands.
 */
export interface WalletConnectionState {
  /** Public key of the connected wallet, or null when none is connected. */
  walletAddress: string | null;
  /** True while a wallet is connected. */
  walletConnected: boolean;
  /** Record a successful wallet connection. */
  connectWallet: (address: string) => void;
  /** Clear the connected wallet. */
  disconnectWallet: () => void;
}

export interface WalletKitContextValue {
  /** True once SWK has been initialized in the browser. False during SSR and first paint. */
  isReady: boolean;
  /** Public key of the connected wallet, or null when no wallet is connected. */
  address: string | null;
  /** Stellar network the kit is configured against. */
  network: StellarNetworkName;
  /** Network passphrase SWK signs with. */
  networkPassphrase: string;
}
