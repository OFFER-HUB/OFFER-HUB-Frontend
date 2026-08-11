"use client";

import { createContext, useMemo, useSyncExternalStore } from "react";
import { KitEventType, Networks, StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { STELLAR_NETWORK, type StellarNetworkName } from "@/config/wallet";
import type { WalletKitContextValue } from "@/types/wallet.types";

const networkPassphraseByName: Record<StellarNetworkName, Networks> = {
  testnet: Networks.TESTNET,
  public: Networks.PUBLIC,
};

const activeNetworkPassphrase = networkPassphraseByName[STELLAR_NETWORK];

/**
 * Wallets supported in T1 (SCF D1.1). SWK ships many more modules, but only these
 * three are part of the deliverable, so the list stays explicit.
 */
const walletModules = [new FreighterModule(), new LobstrModule(), new xBullModule()];

/**
 * SWK v2 is a static singleton, so it is configured once at module evaluation rather
 * than in an effect — that guarantees the kit is ready before any consumer can reach
 * it. `init` only assigns internal signals and the kit guards every browser API, so
 * this is safe to run during SSR as well.
 *
 * Note the kit defaults to the public network; passing testnet here is what keeps T1
 * on testnet.
 */
StellarWalletsKit.init({
  modules: walletModules,
  network: activeNetworkPassphrase,
});

/**
 * Latest address published by the kit. SWK owns this state, so it is mirrored into a
 * module-level cache that `useSyncExternalStore` can read a stable snapshot from.
 */
let cachedAddress: string | null = null;

function subscribeToKitState(onStoreChange: () => void): () => void {
  return StellarWalletsKit.on(KitEventType.STATE_UPDATED, (event) => {
    cachedAddress = event.payload.address ?? null;
    onStoreChange();
  });
}

function getAddressSnapshot(): string | null {
  return cachedAddress;
}

/**
 * The kit restores the previous session from localStorage, which the server cannot
 * know about. Reporting "no address" on the server keeps hydration consistent; the
 * restored address arrives on the first client subscription.
 */
function getServerAddressSnapshot(): string | null {
  return null;
}

const subscribeToNothing = () => () => {};
const getIsBrowserSnapshot = () => true;
const getIsServerSnapshot = () => false;

export const WalletKitContext = createContext<WalletKitContextValue | null>(null);

interface WalletKitProviderProps {
  children: React.ReactNode;
}

export function WalletKitProvider({ children }: WalletKitProviderProps) {
  const address = useSyncExternalStore(
    subscribeToKitState,
    getAddressSnapshot,
    getServerAddressSnapshot,
  );

  const isReady = useSyncExternalStore(
    subscribeToNothing,
    getIsBrowserSnapshot,
    getIsServerSnapshot,
  );

  const value = useMemo<WalletKitContextValue>(
    () => ({
      isReady,
      address,
      network: STELLAR_NETWORK,
      networkPassphrase: activeNetworkPassphrase,
    }),
    [isReady, address],
  );

  return <WalletKitContext.Provider value={value}>{children}</WalletKitContext.Provider>;
}
