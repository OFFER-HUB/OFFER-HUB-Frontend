import type { StellarNetworkName } from "@/config/wallet";

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
