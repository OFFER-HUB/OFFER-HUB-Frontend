"use client";

import { useEffect } from "react";
import { useWalletKit } from "./use-wallet-kit";
import { useAuthStore } from "@/stores/auth-store";

/**
 * How long to wait for SWK to publish a restored address before treating
 * silence as "wallet is no longer available".
 *
 * SWK v2 fires STATE_UPDATED on the first client subscription, but the event
 * is asynchronous. A 500 ms window is enough for any real wallet extension to
 * respond while staying invisible to the user.
 */
const SETTLE_MS = 500;

/**
 * Syncs SWK's restored wallet session with the Zustand auth store on app load.
 *
 * SWK v2 restores its own session from localStorage automatically and fires
 * STATE_UPDATED with the address on the first client subscription. This hook
 * watches that address and keeps the store consistent:
 *
 * - Kit has an address  →  store is updated to match (connectWallet)
 * - Kit has no address after SETTLE_MS  →  store is cleared (disconnectWallet)
 *
 * The settle window prevents a false clear during the brief moment between the
 * first render (address is null) and the STATE_UPDATED event from SWK.
 *
 * Must be called from inside WalletKitProvider so useWalletKit() has a context.
 */
export function useWalletRehydration(): void {
  const { address, isReady } = useWalletKit();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const walletConnected = useAuthStore((state) => state.walletConnected);
  const connectWallet = useAuthStore((state) => state.connectWallet);
  const disconnectWallet = useAuthStore((state) => state.disconnectWallet);

  useEffect(() => {
    if (!isReady || !hasHydrated) return;

    if (address !== null) {
      connectWallet(address);
      return;
    }

    if (!walletConnected) return;

    // Kit has no address yet but the store thinks a wallet is connected.
    // Wait SETTLE_MS for SWK to publish the restored address before deciding
    // the extension is genuinely gone.
    const timer = setTimeout(() => {
      if (useAuthStore.getState().walletConnected) {
        disconnectWallet();
      }
    }, SETTLE_MS);

    return () => clearTimeout(timer);
  }, [address, isReady, hasHydrated, walletConnected, connectWallet, disconnectWallet]);
}
