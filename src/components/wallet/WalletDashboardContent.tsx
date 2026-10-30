"use client";

import { useState } from "react";
import Link from "next/link";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { BalanceChart } from "@/components/wallet/BalanceChart";
import { RecentTransactions } from "@/components/wallet/RecentTransactions";
import { UsdbTestnetFundingCard } from "@/components/wallet/UsdbTestnetFundingCard";
import { WalletMonthlyMetrics } from "@/components/wallet/WalletMonthlyMetrics";
import { WithdrawModal } from "@/components/wallet/WithdrawModal";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { STELLAR_NETWORK } from "@/config/wallet";
import { parseMoney } from "@/lib/earnings-utils";
import { cn } from "@/lib/cn";
import type { UseWalletBalanceResult } from "@/hooks/useWalletBalance";
import type { WalletDashboardData, WithdrawalRequestData } from "@/types/wallet.types";

interface WalletDashboardContentProps {
  token: string;
  data: WalletDashboardData;
  isExternalWallet: boolean;
  isRefreshing: boolean;
  walletBalance: UseWalletBalanceResult;
  onRefresh: () => void;
}

function formatCurrency(value: string, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseMoney(value));
}

export function WalletDashboardContent({
  token,
  data,
  isExternalWallet,
  isRefreshing,
  walletBalance,
  onRefresh,
}: WalletDashboardContentProps): React.JSX.Element {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  function handleWithdrawSuccess(result: WithdrawalRequestData): void {
    setWithdrawSuccess(
      `Withdrawal request ${result.id} submitted for ${formatCurrency(result.amount, result.currency)}.`
    );
    onRefresh();
  }

  return (
    <div className="mx-auto w-full max-w-7xl pb-12 transition-all duration-300 ease-in-out">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Wallet</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your balance, track earnings, and withdraw funds.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh balance and on-chain assets"
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
              "bg-white text-text-primary shadow-[var(--shadow-neumorphic-light)] dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
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
            className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-neumorphic-light)] transition-all duration-200 hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)]"
          >
            Withdraw Funds
          </button>
          <Link
            href="/app/wallet/transactions"
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-text-primary shadow-[var(--shadow-neumorphic-light)] transition-all duration-200 hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:bg-slate-900 dark:shadow-[var(--shadow-neumorphic-dark)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]"
          >
            <Icon path={ICON_PATHS.clock} size="sm" />
            View History
          </Link>
        </div>
      </div>

      <p className="mb-4 text-xs text-text-secondary lg:hidden">
        Tip: pull down on this page to refresh on mobile.
      </p>

      {withdrawSuccess && (
        <div
          className="mb-4 rounded-2xl border border-success/20 bg-success/10 p-4 text-sm font-medium text-success"
          role="status"
        >
          {withdrawSuccess}
        </div>
      )}

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
                  onRefresh: walletBalance.refresh,
                }
          }
        />
      </div>

      {STELLAR_NETWORK === "testnet" && isExternalWallet && (
        <div className="mb-6">
          <UsdbTestnetFundingCard />
        </div>
      )}

      <WalletMonthlyMetrics
        monthly={data.monthly}
        withdrawals={data.withdrawals}
        currency={data.balance.currency}
      />

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="min-w-0">
          <BalanceChart data={data.chart} />
        </div>
        <div className="min-w-0">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>

      <p className="text-center text-xs text-text-secondary">
        Balances shown in {data.balance.currency}. Currency conversion may apply at payout.
      </p>

      <WithdrawModal
        isOpen={isWithdrawOpen}
        token={token}
        availableBalance={parseMoney(data.balance.available)}
        currency={data.balance.currency}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
