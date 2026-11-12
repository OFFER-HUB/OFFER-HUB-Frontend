"use client";

import { useWalletBalance } from "@/hooks/useWalletBalance";
import { usdcReadinessFrom } from "@/lib/wallet-readiness";
import { UsdcReadinessPrompt } from "@/components/wallet/UsdcReadinessPrompt";

export interface ConnectedWalletReadinessProps {
  className?: string;
}

/**
 * The readiness prompt for the connected wallet, reading its balances itself,
 * for screens that don't already have them: the signing modal shows it when a
 * money action comes back WALLET_REQUIRED / TRUSTLINE_REQUIRED (#522).
 */
export function ConnectedWalletReadiness({ className }: ConnectedWalletReadinessProps): React.JSX.Element | null {
  const { balances, isUnfunded, refresh } = useWalletBalance();
  return (
    <UsdcReadinessPrompt
      readiness={usdcReadinessFrom(balances, isUnfunded)}
      onEnabled={refresh}
      className={className}
    />
  );
}
