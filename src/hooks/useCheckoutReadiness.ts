"use client";

import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useWalletKit } from "@/hooks/use-wallet-kit";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { usdcReadinessFrom } from "@/lib/wallet-readiness";
import type { Order } from "@/types/order.types";

export type CheckoutIssue =
  | "WALLET_NOT_CONNECTED"
  | "WRONG_WALLET"
  | "ACCOUNT_NOT_ACTIVATED"
  | "NO_USDC_TRUSTLINE"
  | "INSUFFICIENT_USDC"
  | "CUSTODIAL_WALLET";

export interface UseCheckoutReadinessResult {
  status: "checking" | "ready" | "blocked";
  issues: CheckoutIssue[];
  recheck: () => void;
}

export function useCheckoutReadiness(order: Order): UseCheckoutReadinessResult {
  const primaryWallet = useAuthStore((s) => s.user?.wallet);
  const { address: liveAddress } = useWalletKit();
  const balance = useWalletBalance();

  const issues = useMemo<CheckoutIssue[]>(() => {
    const result: CheckoutIssue[] = [];

    if (!primaryWallet || primaryWallet.type !== "EXTERNAL") {
      result.push("CUSTODIAL_WALLET");
    }

    if (!liveAddress) {
      result.push("WALLET_NOT_CONNECTED");
    } else if (primaryWallet?.publicKey && liveAddress.toLowerCase() !== primaryWallet.publicKey.toLowerCase()) {
      result.push("WRONG_WALLET");
    }

    if (balance.isUnfunded) {
      result.push("ACCOUNT_NOT_ACTIVATED");
    }

    const readiness = usdcReadinessFrom(balance.balances, balance.isUnfunded);
    if (readiness === "no_trustline" || readiness === "no_account") {
      // no_account handled by ACCOUNT_NOT_ACTIVATED; trustline only when funded
      if (readiness === "no_trustline") result.push("NO_USDC_TRUSTLINE");
    }

    if (balance.balances && !balance.isUnfunded) {
      const usdcBalance = Number(balance.balances.usdc.balance ?? "0");
      const required = Number(order.amount);
      if (Number.isFinite(usdcBalance) && Number.isFinite(required) && usdcBalance < required) {
        result.push("INSUFFICIENT_USDC");
      }
    }

    return result;
  }, [primaryWallet, liveAddress, balance, order.amount]);

  const status: "checking" | "ready" | "blocked" = balance.isLoading
    ? "checking"
    : issues.length > 0
      ? "blocked"
      : "ready";

  const recheck = useCallback(() => {
    balance.refresh();
  }, [balance]);

  return { status, issues, recheck };
}
