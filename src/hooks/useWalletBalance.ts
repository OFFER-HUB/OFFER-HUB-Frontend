"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  HorizonRequestError,
  StellarAccountNotFoundError,
  emptyAccountBalances,
  fetchAccountBalances,
} from "@/services/stellar.service";
import type { StellarAccountBalances } from "@/types/wallet.types";

const FALLBACK_ERROR_MESSAGE = "Could not load balances from Horizon. Try again.";

/** Result keyed by the address it belongs to, so a wallet switch cannot show stale numbers. */
interface BalanceSnapshot {
  address: string;
  balances: StellarAccountBalances;
  isUnfunded: boolean;
}

interface BalanceFailure {
  address: string;
  message: string;
}

export interface UseWalletBalanceResult {
  /** Address the balances belong to, or null when no wallet is connected. */
  address: string | null;
  /** XLM and USDC balances, or null before the first result for `address`. */
  balances: StellarAccountBalances | null;
  /** True while the first load for the connected wallet is pending. */
  isLoading: boolean;
  /** True while a refresh runs over balances that are already on screen. */
  isRefreshing: boolean;
  /** Failure message for the connected wallet, or null. */
  error: string | null;
  /**
   * True when Horizon has no record of the account. `balances` is then a zeroed
   * record rather than null — an unfunded keypair is a valid state, not an error.
   */
  isUnfunded: boolean;
  /** Re-read balances from Horizon. No-op while no wallet is connected. */
  refresh: () => void;
}

function toErrorMessage(cause: unknown): string {
  if (cause instanceof HorizonRequestError || cause instanceof Error) {
    return cause.message.length > 0 ? cause.message : FALLBACK_ERROR_MESSAGE;
  }
  return FALLBACK_ERROR_MESSAGE;
}

/**
 * XLM and USDC balances of the wallet connected in the auth store (SCF D1.1).
 *
 * Loads on connection and whenever the connected address changes; `refresh()`
 * re-reads on demand. Only one request is ever in flight — a new load aborts
 * the previous one, so a fast reconnect cannot resolve out of order.
 */
export function useWalletBalance(): UseWalletBalanceResult {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const storedAddress = useAuthStore((state) => state.walletAddress);

  // Before rehydration the store reports no wallet even for a user who has one,
  // so treat that window as "unknown" instead of "disconnected".
  const address = hasHydrated ? storedAddress : null;

  const [snapshot, setSnapshot] = useState<BalanceSnapshot | null>(null);
  const [failure, setFailure] = useState<BalanceFailure | null>(null);
  const [isRefreshRequested, setIsRefreshRequested] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const load = useCallback(async (target: string): Promise<void> => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const balances = await fetchAccountBalances(target, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setSnapshot({ address: target, balances, isUnfunded: false });
      setFailure(null);
    } catch (cause) {
      if (controller.signal.aborted) return;

      if (cause instanceof StellarAccountNotFoundError) {
        setSnapshot({ address: target, balances: emptyAccountBalances(), isUnfunded: true });
        setFailure(null);
        return;
      }

      setFailure({ address: target, message: toErrorMessage(cause) });
    } finally {
      if (!controller.signal.aborted) {
        setIsRefreshRequested(false);
      }
    }
  }, []);

  useEffect(() => {
    if (address === null) {
      requestRef.current?.abort();
      setIsRefreshRequested(false);
      return;
    }

    void load(address);

    return () => requestRef.current?.abort();
  }, [address, load]);

  const refresh = useCallback(() => {
    if (address === null) return;
    setIsRefreshRequested(true);
    setFailure(null);
    void load(address);
  }, [address, load]);

  const isCurrent = snapshot !== null && snapshot.address === address;
  const balances = isCurrent ? snapshot.balances : null;
  const isUnfunded = isCurrent ? snapshot.isUnfunded : false;
  const error = failure !== null && failure.address === address ? failure.message : null;

  return {
    address,
    balances,
    // Derived rather than stored: true from the render the address appears in,
    // which is one frame before the effect can start the request.
    isLoading: address !== null && balances === null && error === null,
    isRefreshing: isRefreshRequested && balances !== null,
    error,
    isUnfunded,
    refresh,
  };
}
