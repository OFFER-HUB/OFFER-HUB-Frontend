"use client";

import { useCallback } from "react";
import Link from "next/link";
import { WalletDashboardContent } from "@/components/wallet/WalletDashboardContent";
import { WalletPageSkeleton } from "@/components/wallet/WalletPageSkeleton";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useWalletDashboard } from "@/hooks/useWalletDashboard";
import { useAuthStore } from "@/stores/auth-store";

export default function WalletPage(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const isExternalWallet = useAuthStore((state) => state.user?.wallet)?.type === "EXTERNAL";
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const walletDashboard = useWalletDashboard(token);
  const walletBalance = useWalletBalance();
  const handleRefresh = useCallback(() => {
    walletBalance.refresh();
    void walletDashboard.refresh();
  }, [walletBalance.refresh, walletDashboard.refresh]);

  usePullToRefresh(handleRefresh, {
    containerId: "main-content",
    threshold: 72,
    isRefreshing: walletDashboard.isRefreshing,
  });

  if (!hasHydrated) {
    return <WalletPageSkeleton />;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-text-secondary shadow-[var(--shadow-neumorphic-light)] dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]">
          <Icon path={ICON_PATHS.lock} size="xl" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-text-primary">Wallet Access</h1>
        <p className="mb-6 text-text-secondary">
          Sign in to your account to view your balance, ledger, and transactions.
        </p>
        <Link
          href="/login?redirect=/app/wallet"
          className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-neumorphic-light)] transition-all hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (walletDashboard.isLoading || !walletDashboard.data) {
    if (walletDashboard.error) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-error shadow-[var(--shadow-neumorphic-light)] dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]">
            <Icon path={ICON_PATHS.creditCard} size="xl" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">Wallet Unavailable</h1>
          <p className="mb-6 text-text-secondary">{walletDashboard.error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={walletDashboard.isRefreshing}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-text-primary shadow-[var(--shadow-neumorphic-light)] transition-all hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] disabled:opacity-60 dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]"
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={walletDashboard.isRefreshing ? "animate-spin" : ""}
            />
            Retry Connection
          </button>
        </div>
      );
    }
    return <WalletPageSkeleton />;
  }

  return (
    <WalletDashboardContent
      token={token}
      data={walletDashboard.data}
      isExternalWallet={isExternalWallet}
      isRefreshing={walletDashboard.isRefreshing}
      walletBalance={walletBalance}
      onRefresh={handleRefresh}
    />
  );
}
