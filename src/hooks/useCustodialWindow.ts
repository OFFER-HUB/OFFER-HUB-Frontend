"use client";

import { useEffect, useState } from "react";
import { STELLAR_NETWORK } from "@/config/wallet";
import { getWalletReadiness } from "@/lib/api/wallet-readiness";
import { useAuthStore } from "@/stores/auth-store";
import type { CustodialReadOnlyWindow } from "@/types/wallet.types";

/**
 * The read-only window of the signed-in user's custodial wallet, or null.
 *
 * It only exists on the testnet sandbox, after the mainnet cutover, for a user
 * who has not claimed their wallet. Everywhere else nothing is fetched.
 */
export function useCustodialWindow(): CustodialReadOnlyWindow | null {
  const token = useAuthStore((state) => state.token);
  const walletType = useAuthStore((state) => state.user?.wallet?.type);
  const [window, setWindow] = useState<CustodialReadOnlyWindow | null>(null);

  const applies = STELLAR_NETWORK === "testnet" && walletType === "INVISIBLE" && token !== null;

  useEffect(() => {
    if (!applies) return;
    let cancelled = false;
    getWalletReadiness(token)
      .then((readiness) => {
        if (!cancelled) setWindow(readiness.custodialReadOnly);
      })
      .catch(() => {
        // The banner is a courtesy: if the status can't be read, show nothing
        if (!cancelled) setWindow(null);
      });
    return () => {
      cancelled = true;
    };
  }, [applies, token]);

  // Derived, not reset: when the user stops qualifying (logs out, claims) a stale window is never shown
  return applies ? window : null;
}
