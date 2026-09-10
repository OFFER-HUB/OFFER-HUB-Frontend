"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { getWalletDashboard, type WalletDashboardData } from "@/lib/api/wallet";
import {
  BalanceCard,
  BalanceChart,
  RecentTransactions,
  WithdrawModal,
  WalletPageSkeleton,
} from "@/components/wallet";

function parseMoney(s: string): number {
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

function pctVsPrevious(current: string, previous: string): number | null {
  const c = parseMoney(current);
  const p = parseMoney(previous);
  if (p === 0) return null;
  return ((c - p) / p) * 100;
}

function formatPct(p: number): string {
  const sign = p > 0 ? "+" : "";
  return `${sign}${p.toFixed(1)}%`;
}

export default function WalletPage(): React.JSX.Element {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [data, setData] = useState<WalletDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // On-chain balances of the connected external wallet (SCF D1.1). Independent
  // of the platform ledger above: it loads on connection and refreshes on its own.
  const walletBalance = useWalletBalance();
  const refreshWalletBalance = walletBalance.refresh;

  const load = useCallback(async () => {
    if (!token) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setError(null);
    try {
      const res = await getWalletDashboard(token);
      setData(res);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load wallet.";
      setData(null);
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    refreshWalletBalance();
    if (!token) return;
    setIsRefreshing(true);
    void load();
  }, [token, load, refreshWalletBalance]);

  const pullStart = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = document.getElementById("main-content");
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0) {
        pulling.current = true;
        pullStart.current = e.touches[0].clientY;
      }
    };

    const onMove = (e: TouchEvent) => {
      if (!pulling.current || isRefreshing) return;
      const dy = e.touches[0].clientY - pullStart.current;
      if (dy > 72) {
        pulling.current = false;
        refresh();
      }
    };

    const onEnd = () => {
      pulling.current = false;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [refresh, isRefreshing]);

  // Before hydration the store is empty even for a signed-in user, so an early
  // `!token` would flash the sign-in wall on every reload.
  if (!hasHydrated) {
    return <WalletPageSkeleton />;
  }

  if (!token) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white dark:bg-slate-900 shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)] flex items-center justify-center text-text-secondary">
          <Icon path={ICON_PATHS.lock} size="xl" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Wallet Access</h1>
        <p className="text-text-secondary mb-6">Sign in to your account to view your balance, ledger, and transactions.</p>
        <Link
          href="/login?redirect=/app/wallet"
          className={cn(
            "inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-sm",
            "bg-primary text-white shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all cursor-pointer"
          )}
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (isLoading || !data) {
    if (error) {
      return (
        <div className="max-w-lg mx-auto text-center py-16 px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white dark:bg-slate-900 shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)] flex items-center justify-center text-error">
            <Icon path={ICON_PATHS.creditCard} size="xl" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Wallet Unavailable</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold",
              "bg-white dark:bg-slate-900 text-text-primary shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all cursor-pointer disabled:opacity-60"
            )}
          >
            <Icon path={ICON_PATHS.refresh} size="sm" className={cn(isRefreshing && "animate-spin")} />
            Retry Connection
          </button>
        </div>
      );
    }
    return <WalletPageSkeleton />;
  }

  const earnPct = pctVsPrevious(data.monthly.currentMonthEarnings, data.monthly.previousMonthEarnings);
  const spendPct = pctVsPrevious(data.monthly.currentMonthSpending, data.monthly.previousMonthSpending);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 transition-all duration-300 ease-in-out">
      {/* Header Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Wallet
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your balance, track earnings, and withdraw funds.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer",
              "bg-white dark:bg-slate-900 text-text-primary",
              "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            title="Refresh balance and on-chain assets"
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={cn("text-text-secondary", isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className={cn(
              "inline-flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 cursor-pointer",
              "bg-primary hover:bg-primary-hover",
              "shadow-[var(--shadow-neumorphic-light)] active:shadow-[var(--shadow-neumorphic-inset-light)]"
            )}
          >
            Withdraw Funds
          </button>
          <Link
            href="/app/wallet/transactions"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer",
              "bg-white dark:bg-slate-900 text-text-primary",
              "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]"
            )}
          >
            <Icon path={ICON_PATHS.clock} size="sm" />
            View History
          </Link>
        </div>
      </div>

      <p className="text-xs text-text-secondary mb-4 lg:hidden">
        Tip: pull down on this page to refresh on mobile.
      </p>

      {error ? (
        <div className="mb-4 p-4 rounded-2xl bg-error/10 border border-error/20 text-error text-sm font-medium" role="alert">
          {error}
        </div>
      ) : null}
      {withdrawSuccess ? (
        <div className="mb-4 p-4 rounded-2xl bg-success/10 border border-success/20 text-success text-sm font-medium" role="status">
          {withdrawSuccess}
        </div>
      ) : null}

      {/* Master Balance Card */}
      <div className="mb-6">
        <BalanceCard
          available={data.balance.available}
          reserved={data.balance.reserved}
          currency={data.balance.currency}
          externalWallet={
            walletBalance.address === null
              ? undefined
              : {
                  address: walletBalance.address,
                  balances: walletBalance.balances,
                  isLoading: walletBalance.isLoading,
                  isRefreshing: walletBalance.isRefreshing,
                  error: walletBalance.error,
                  isUnfunded: walletBalance.isUnfunded,
                  onRefresh: refreshWalletBalance,
                }
          }
        />
      </div>

      {/* 3-Card Metric KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {/* Card 1: Earned this month */}
        <div
          className={cn(
            "p-6 rounded-3xl bg-white",
            "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
            "transition-all duration-300"
          )}
        >
          <p className="text-sm font-medium text-text-secondary">Earned this month</p>
          <p className="text-xs text-text-secondary mb-2">From completed orders</p>
          <p className="text-2xl sm:text-3xl font-bold text-text-primary">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: data.balance.currency,
            }).format(parseMoney(data.monthly.currentMonthEarnings))}
          </p>
          {earnPct !== null ? (
            <p
              className={cn(
                "text-xs mt-2 font-medium",
                earnPct >= 0 ? "text-success" : "text-error"
              )}
            >
              {formatPct(earnPct)} vs last month
            </p>
          ) : (
            <p className="text-xs text-text-secondary mt-2">No comparison last month</p>
          )}
        </div>

        {/* Card 2: Withdrawn this month */}
        <div
          className={cn(
            "p-6 rounded-3xl bg-white",
            "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
            "transition-all duration-300"
          )}
        >
          <p className="text-sm font-medium text-text-secondary">Withdrawn this month</p>
          <p className="text-xs text-text-secondary mb-2">Completed withdrawals</p>
          <p className="text-2xl sm:text-3xl font-bold text-text-primary">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: data.balance.currency,
            }).format(parseMoney(data.monthly.currentMonthSpending))}
          </p>
          {spendPct !== null ? (
            <p
              className={cn(
                "text-xs mt-2 font-medium",
                spendPct <= 0 ? "text-success" : "text-warning"
              )}
            >
              {formatPct(spendPct)} vs last month
            </p>
          ) : (
            <p className="text-xs text-text-secondary mt-2">No comparison last month</p>
          )}
        </div>

        {/* Card 3: Pending withdrawals */}
        <div
          className={cn(
            "p-6 rounded-3xl bg-white",
            "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
            "transition-all duration-300 sm:col-span-2 lg:col-span-1"
          )}
        >
          <p className="text-sm font-medium text-text-secondary">Pending withdrawals</p>
          <p className="text-xs text-text-secondary mb-2">
            {data.withdrawals.pendingCount} open {data.withdrawals.pendingCount === 1 ? "request" : "requests"}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-text-primary">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: data.balance.currency,
            }).format(parseMoney(data.withdrawals.pendingTotal))}
          </p>
          <p className="text-xs text-text-secondary mt-2">Currently in processing queue</p>
        </div>
      </div>

      {/* Chart & Recent Transactions Grid (Protected with min-w-0 for smooth sidebar animations) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="min-w-0">
          <BalanceChart data={data.chart} />
        </div>
        <div className="min-w-0">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>

      <p className="text-xs text-text-secondary text-center">
        Balances shown in {data.balance.currency}. Currency conversion may apply at payout.
      </p>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        token={token}
        availableBalance={parseMoney(data.balance.available)}
        currency={data.balance.currency}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={(result) => {
          setWithdrawSuccess(
            `Withdrawal request ${result.id} submitted for ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: result.currency,
            }).format(parseMoney(result.amount))}.`
          );
          refresh();
        }}
      />
    </div>
  );
}
