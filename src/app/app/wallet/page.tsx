"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  getWalletDashboard,
  MOCK_WALLET_DASHBOARD,
  type WalletDashboardData,
} from "@/lib/api/wallet";
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
  const [data, setData] = useState<WalletDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

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
      setIsDemo(false);
    } catch {
      setData(MOCK_WALLET_DASHBOARD);
      setIsDemo(true);
      setError(null);
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
    if (!token) return;
    setIsRefreshing(true);
    void load();
  }, [token, load]);

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

  if (!token) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <Icon path={ICON_PATHS.lock} size="xl" className="mx-auto text-text-secondary mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Wallet</h1>
        <p className="text-text-secondary mb-6">Sign in to view your balance and transactions.</p>
        <Link
          href="/login?redirect=/app/wallet"
          className={cn(
            "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium",
            "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
          )}
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (isLoading || !data) {
    return <WalletPageSkeleton />;
  }

  const earnPct = pctVsPrevious(data.monthly.currentMonthEarnings, data.monthly.previousMonthEarnings);
  const spendPct = pctVsPrevious(data.monthly.currentMonthSpending, data.monthly.previousMonthSpending);

  return (
    <div className="page-full-height max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Wallet</h1>
          <p className="text-sm text-text-secondary mt-1">
            Overview of your funds on OFFER HUB
            {isDemo ? " · showing sample data until the API is available" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
              "bg-white text-text-primary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "disabled:opacity-60"
            )}
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={cn(isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className={cn(
              "inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium",
              "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
            )}
          >
            Withdraw
          </button>
          <Link
            href="/app/wallet/transactions"
            className={cn(
              "inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium",
              "bg-background text-text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            View history
          </Link>
        </div>
      </div>

      <p className="text-xs text-text-secondary mb-4 lg:hidden">
        Tip: pull down on this page to refresh on mobile.
      </p>

      {error ? (
        <div className="mb-4 p-3 rounded-xl bg-error/10 text-error text-sm" role="alert">
          {error}
        </div>
      ) : null}
      {withdrawSuccess ? (
        <div className="mb-4 p-3 rounded-xl bg-success/10 text-success text-sm" role="status">
          {withdrawSuccess}
        </div>
      ) : null}

      <div className="mb-6">
        <BalanceCard
          available={data.balance.available}
          reserved={data.balance.reserved}
          currency={data.balance.currency}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className={cn(
            "p-5 rounded-3xl bg-white",
            "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
          )}
        >
          <p className="text-sm font-medium text-text-secondary mb-1">Earnings (this month)</p>
          <p className="text-2xl font-bold text-text-primary">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: data.balance.currency,
            }).format(parseMoney(data.monthly.currentMonthEarnings))}
          </p>
          {earnPct !== null ? (
            <p
              className={cn(
                "text-sm mt-2 font-medium",
                earnPct >= 0 ? "text-success" : "text-error"
              )}
            >
              {formatPct(earnPct)} vs last month
            </p>
          ) : (
            <p className="text-sm text-text-secondary mt-2">No comparison last month</p>
          )}
        </div>
        <div
          className={cn(
            "p-5 rounded-3xl bg-white",
            "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
          )}
        >
          <p className="text-sm font-medium text-text-secondary mb-1">Spending (this month)</p>
          <p className="text-2xl font-bold text-text-primary">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: data.balance.currency,
            }).format(parseMoney(data.monthly.currentMonthSpending))}
          </p>
          {spendPct !== null ? (
            <p
              className={cn(
                "text-sm mt-2 font-medium",
                spendPct <= 0 ? "text-success" : "text-warning"
              )}
            >
              {formatPct(spendPct)} vs last month
            </p>
          ) : (
            <p className="text-sm text-text-secondary mt-2">No comparison last month</p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "p-5 rounded-3xl bg-white mb-6",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-text-secondary">Pending withdrawals</p>
            <p className="text-xl font-bold text-text-primary mt-1">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: data.balance.currency,
              }).format(parseMoney(data.withdrawals.pendingTotal))}
            </p>
          </div>
          <span className="text-sm text-text-secondary">
            {data.withdrawals.pendingCount} open request
            {data.withdrawals.pendingCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <BalanceChart data={data.chart} />
        <RecentTransactions transactions={data.recentTransactions} />
      </div>

      <p className="text-xs text-text-secondary text-center">
        Balances shown in {data.balance.currency}. Currency conversion may apply at payout.
      </p>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        token={token}
        availableBalance={parseMoney(data.balance.available)}
        currency={data.balance.currency}
        isDemo={isDemo}
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
