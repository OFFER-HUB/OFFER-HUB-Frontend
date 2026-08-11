"use client";

import { useContext } from "react";
import { WalletKitContext } from "@/components/providers/WalletKitProvider";
import type { WalletKitContextValue } from "@/types/wallet.types";

/**
 * Access the Stellar Wallets Kit state.
 *
 * Must be called from inside `WalletKitProvider`, which is mounted in the root layout.
 */
export function useWalletKit(): WalletKitContextValue {
  const context = useContext(WalletKitContext);

  if (context === null) {
    throw new Error("useWalletKit must be used within a WalletKitProvider");
  }

  return context;
}
