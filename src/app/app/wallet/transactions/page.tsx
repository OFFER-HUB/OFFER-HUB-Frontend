"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { getWalletTransactions, type WalletTransactionsData } from "@/lib/api/wallet";
import {
  TransactionFilters,
  TransactionHistorySkeleton,
  TransactionList,
} from "@/components/wallet";
import {
  DEFAULT_TRANSACTION_FILTERS,
  WALLET_TRANSACTION_PAGE_SIZE,
  useWalletTransactions,
} from "@/hooks/useWalletTransactions";

export default function WalletTransactionsPage(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [data, setData] = useState<WalletTransactionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    filters,
    setFilters,
    setCurrentPage,
    filteredTransactions,
    paginatedTransactions,
    page,
    totalPages,
    creditsCount,
    debitsCount,
    reservesCount,
    exportCsv,
  } = useWalletTransactions(data);
  const deferredSearch = useDeferredValue(filters.search);

  const loadTransactions = useCallback(async (): Promise<void> => {
    if (!token) {
      setData(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setError(null);
    try {
      const response = await getWalletTransactions(token, {
        search: deferredSearch,
        types: filters.types,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
        sortBy: filters.sortBy,
      });
      setData(response);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load wallet transactions.";
      setData(null);
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    deferredSearch,
    filters.endDate,
    filters.maxAmount,
    filters.minAmount,
    filters.sortBy,
    filters.startDate,
    filters.types,
    token,
  ]);

  useEffect(() => {
    setIsLoading(true);
    void loadTransactions();
  }, [loadTransactions]);

  function refresh(): void {
    if (!token) return;
    setIsRefreshing(true);
    setIsLoading(true);
    void loadTransactions();
  }

  // Before hydration the store is empty even for a signed-in user, so an early
  // `!token` would flash the sign-in wall on every reload.
  if (!hasHydrated) {
    return <TransactionHistorySkeleton />;
  }

  if (!token) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <Icon path={ICON_PATHS.lock} size="xl" className="mx-auto text-text-secondary mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Transaction history</h1>
        <p className="text-text-secondary mb-6">
          Sign in to review wallet activity, export records, and track balances.
        </p>
        <Link
          href="/login?redirect=/app/wallet/transactions"
          className={cn(
            "inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-sm",
            "bg-primary text-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
            "hover:brightness-105 active:scale-[0.98] transition-all"
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
          <Icon path={ICON_PATHS.document} size="xl" className="mx-auto text-text-secondary mb-4" />
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Transaction history unavailable
          </h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider",
              "bg-white text-text-primary shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "disabled:opacity-60 transition-all"
            )}
          >
            <Icon
              path={ICON_PATHS.refresh}
              size="sm"
              className={cn(isRefreshing && "animate-spin")}
            />
            Retry
          </button>
        </div>
      );
    }
    return <TransactionHistorySkeleton />;
  }

  const walletData = data;

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 space-y-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            <Link href="/app/wallet" className="hover:text-primary transition-colors">
              Wallet
            </Link>
            <span>/</span>
            <span className="text-text-primary">Transactions</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-text-primary">
            Transaction history
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review credits, debits, and reserved funds across your wallet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-200",
              "bg-white text-text-primary",
              "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
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
            onClick={exportCsv}
            disabled={filteredTransactions.length === 0}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-200",
              "bg-white text-text-primary",
              "shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]",
              "hover:text-primary active:shadow-[var(--shadow-neumorphic-inset-light)] dark:active:shadow-[var(--shadow-neumorphic-inset-dark)]",
              "disabled:opacity-50"
            )}
          >
            <Icon path={ICON_PATHS.document} size="sm" />
            Export CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)] transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Total transactions
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold text-text-primary mt-2">
            {walletData.transactions.length}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)] transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Credits
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold text-success mt-2">{creditsCount}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)] transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Debits
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold text-text-primary mt-2">
            {debitsCount}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)] transition-all duration-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Reserved
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold text-warning mt-2">{reservesCount}</p>
        </div>
      </section>

      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_TRANSACTION_FILTERS)}
        resultCount={filteredTransactions.length}
        totalCount={walletData.transactions.length}
      />

      <TransactionList
        transactions={paginatedTransactions}
        currency={walletData.currency}
        showRunningBalance={walletData.runningBalanceAvailable}
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredTransactions.length}
        pageSize={WALLET_TRANSACTION_PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
