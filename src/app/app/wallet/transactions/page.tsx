"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  getWalletTransactions,
  MOCK_WALLET_TRANSACTIONS,
  type WalletTransactionsData,
} from "@/lib/api/wallet";
import {
  TransactionFilters,
  TransactionHistorySkeleton,
  TransactionList,
} from "@/components/wallet";
import type { TransactionFiltersValue } from "@/components/wallet/TransactionFilters";
import { downloadWalletTransactionsCsv } from "@/components/wallet/transactionsCsv";

const PAGE_SIZE = 8;

const DEFAULT_FILTERS: TransactionFiltersValue = {
  search: "",
  types: [],
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date-desc",
};

function parseAmount(value: string): number {
  const amount = Number.parseFloat(value);
  return Number.isNaN(amount) ? 0 : amount;
}

function toDateValue(value: string): number {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function buildExportFilename(): string {
  const now = new Date();
  return `offer-hub-wallet-transactions-${now.toISOString().slice(0, 10)}.csv`;
}

export default function WalletTransactionsPage(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<WalletTransactionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [filters, setFilters] = useState<TransactionFiltersValue>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      if (!token) {
        if (isMounted) {
          setData(null);
          setIsLoading(false);
          setIsRefreshing(false);
        }
        return;
      }

      try {
        const response = await getWalletTransactions(token);
        if (!isMounted) return;
        setData(response);
        setIsDemo(false);
      } catch {
        if (!isMounted) return;
        setData(MOCK_WALLET_TRANSACTIONS);
        setIsDemo(true);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }

    setIsLoading(true);
    void load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    deferredSearch,
    filters.endDate,
    filters.maxAmount,
    filters.minAmount,
    filters.sortBy,
    filters.startDate,
    filters.types,
  ]);

  function refresh(): void {
    if (!token) return;
    setIsRefreshing(true);
    setIsLoading(true);

    void getWalletTransactions(token)
      .then((response) => {
        setData(response);
        setIsDemo(false);
      })
      .catch(() => {
        setData(MOCK_WALLET_TRANSACTIONS);
        setIsDemo(true);
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
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
    return <TransactionHistorySkeleton />;
  }

  const walletData = data;

  const searchTerm = deferredSearch.trim().toLowerCase();
  const minAmount = filters.minAmount === "" ? null : Number.parseFloat(filters.minAmount);
  const maxAmount = filters.maxAmount === "" ? null : Number.parseFloat(filters.maxAmount);

  const filteredTransactions = walletData.transactions
    .filter((transaction) => {
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) {
        return false;
      }

      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm)) {
        return false;
      }

      if (filters.startDate && transaction.createdAt.slice(0, 10) < filters.startDate) {
        return false;
      }

      if (filters.endDate && transaction.createdAt.slice(0, 10) > filters.endDate) {
        return false;
      }

      const amount = parseAmount(transaction.amount);
      if (minAmount !== null && !Number.isNaN(minAmount) && amount < minAmount) {
        return false;
      }

      if (maxAmount !== null && !Number.isNaN(maxAmount) && amount > maxAmount) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      if (filters.sortBy === "date-asc") {
        return toDateValue(left.createdAt) - toDateValue(right.createdAt);
      }

      if (filters.sortBy === "date-desc") {
        return toDateValue(right.createdAt) - toDateValue(left.createdAt);
      }

      if (filters.sortBy === "amount-asc") {
        return parseAmount(left.amount) - parseAmount(right.amount);
      }

      return parseAmount(right.amount) - parseAmount(left.amount);
    });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function exportCsv(): void {
    if (filteredTransactions.length === 0) return;
    downloadWalletTransactionsCsv(
      filteredTransactions,
      walletData.currency,
      buildExportFilename(),
      walletData.runningBalanceAvailable
    );
  }

  const creditsCount = walletData.transactions.filter((transaction) => transaction.type === "credit").length;
  const debitsCount = walletData.transactions.filter((transaction) => transaction.type === "debit").length;
  const reservesCount = walletData.transactions.filter((transaction) => transaction.type === "reserve").length;

  return (
    <div className="page-full-height max-w-6xl mx-auto pb-10 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <Link href="/app/wallet" className="hover:text-text-primary transition-colors">
              Wallet
            </Link>
            <span>/</span>
            <span className="text-text-primary">Transactions</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Transaction history</h1>
          <p className="text-sm text-text-secondary mt-1">
            Review credits, debits, and reserved funds across your wallet
            {isDemo ? " · showing sample data until the API responds" : ""}
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
            <Icon path={ICON_PATHS.refresh} size="sm" className={cn(isRefreshing && "animate-spin")} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => exportCsv()}
            disabled={filteredTransactions.length === 0}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
              "bg-background text-text-primary",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "disabled:opacity-50"
            )}
          >
            <Icon path={ICON_PATHS.document} size="sm" />
            Export CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
          <p className="text-sm text-text-secondary">Total transactions</p>
          <p className="text-2xl font-bold text-text-primary mt-2">{walletData.transactions.length}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
          <p className="text-sm text-text-secondary">Credits</p>
          <p className="text-2xl font-bold text-success mt-2">{creditsCount}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
          <p className="text-sm text-text-secondary">Debits</p>
          <p className="text-2xl font-bold text-text-primary mt-2">{debitsCount}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
          <p className="text-sm text-text-secondary">Reserved</p>
          <p className="text-2xl font-bold text-warning mt-2">{reservesCount}</p>
        </div>
      </section>

      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(DEFAULT_FILTERS)}
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
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}