"use client";

import Link from "next/link";
import { TransactionFilters, TransactionHistorySkeleton, TransactionList } from "@/components/wallet";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { UseWalletTransactionsReturn } from "@/hooks/useWalletTransactions";

interface WalletTransactionsContentProps {
  token: string | null;
  hasHydrated: boolean;
  transactions: UseWalletTransactionsReturn;
}

export function WalletTransactionsContent({
  token,
  hasHydrated,
  transactions,
}: WalletTransactionsContentProps): React.JSX.Element {
  if (!hasHydrated) {
    return <TransactionHistorySkeleton />;
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Icon path={ICON_PATHS.lock} size="xl" className="mx-auto mb-4 text-text-secondary" />
        <h1 className="mb-2 text-xl font-bold text-text-primary">Transaction history</h1>
        <p className="mb-6 text-text-secondary">
          Sign in to review wallet activity, export records, and track balances.
        </p>
        <Link
          href="/login?redirect=/app/wallet/transactions"
          className={cn(
            "inline-flex cursor-pointer items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold",
            "bg-primary text-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
            "transition-all hover:brightness-105 active:scale-[0.98]"
          )}
        >
          Sign in
        </Link>
      </div>
    );
  }

  const data = transactions.data;
  if (transactions.isLoading || !data) {
    if (transactions.error) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <Icon path={ICON_PATHS.document} size="xl" className="mx-auto mb-4 text-text-secondary" />
          <h1 className="mb-2 text-xl font-bold text-text-primary">
            Transaction history unavailable
          </h1>
          <p className="mb-6 text-text-secondary">{transactions.error}</p>
          <button
            type="button"
            onClick={transactions.refresh}
            disabled={transactions.isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-semibold uppercase tracking-wider",
              "bg-white text-text-primary shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "transition-all hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "disabled:opacity-60"
            )}
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={cn(transactions.isRefreshing && "animate-spin")}
            />
            Retry
          </button>
        </div>
      );
    }
    return <TransactionHistorySkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12 transition-all duration-300 ease-in-out">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <Link href="/app/wallet" className="transition-colors hover:text-primary">
              Wallet
            </Link>
            <span>/</span>
            <span className="text-text-primary">Transactions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">
            Transaction history
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Review credits, debits, and reserved funds across your wallet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={transactions.refresh}
            disabled={transactions.isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
              "bg-white text-text-primary shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "disabled:opacity-60"
            )}
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={cn(transactions.isRefreshing && "animate-spin")}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={transactions.exportCsv}
            disabled={transactions.filteredTransactions.length === 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200",
              "bg-white text-text-primary shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "disabled:opacity-50"
            )}
          >
            <Icon path={ICON_PATHS.document} size="sm" />
            Export CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total transactions" value={data.transactions.length} />
        <SummaryCard label="Credits" value={transactions.creditsCount} valueClass="text-success" />
        <SummaryCard label="Debits" value={transactions.debitsCount} />
        <SummaryCard label="Reserved" value={transactions.reservesCount} valueClass="text-warning" />
      </section>

      <TransactionFilters
        filters={transactions.filters}
        onChange={transactions.setFilters}
        onClear={transactions.clearFilters}
        resultCount={transactions.filteredTransactions.length}
        totalCount={data.transactions.length}
      />

      <TransactionList
        transactions={transactions.paginatedTransactions}
        currency={data.currency}
        showRunningBalance={data.runningBalanceAvailable}
        currentPage={transactions.currentPage}
        totalPages={transactions.totalPages}
        totalItems={transactions.filteredTransactions.length}
        pageSize={transactions.pageSize}
        onPageChange={transactions.setCurrentPage}
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  valueClass?: string;
}

function SummaryCard({ label, value, valueClass }: SummaryCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[var(--shadow-neumorphic-light)] transition-all duration-200 dark:shadow-[var(--shadow-neumorphic-dark)]">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
      <p className={cn("mt-2 text-2xl font-extrabold text-text-primary lg:text-3xl", valueClass)}>
        {value}
      </p>
    </div>
  );
}
