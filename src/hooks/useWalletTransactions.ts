"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { downloadWalletTransactionsCsv } from "@/components/wallet/transactionsCsv";
import type { TransactionFiltersValue } from "@/types/wallet.types";
import { getWalletTransactions } from "@/lib/api/wallet";
import type { WalletTransactionRow, WalletTransactionsData } from "@/types/wallet.types";

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

function filterAndSortTransactions(
  transactions: WalletTransactionRow[],
  filters: TransactionFiltersValue,
  search: string
): WalletTransactionRow[] {
  const searchTerm = search.trim().toLowerCase();
  const minAmount = filters.minAmount === "" ? null : Number.parseFloat(filters.minAmount);
  const maxAmount = filters.maxAmount === "" ? null : Number.parseFloat(filters.maxAmount);

  return transactions
    .filter((transaction) => {
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) return false;
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm)) return false;
      if (filters.startDate && transaction.createdAt.slice(0, 10) < filters.startDate) return false;
      if (filters.endDate && transaction.createdAt.slice(0, 10) > filters.endDate) return false;

      const amount = parseAmount(transaction.amount);
      if (minAmount !== null && !Number.isNaN(minAmount) && amount < minAmount) return false;
      if (maxAmount !== null && !Number.isNaN(maxAmount) && amount > maxAmount) return false;

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
}

function buildExportFilename(): string {
  return `offer-hub-wallet-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
}

export interface UseWalletTransactionsReturn {
  data: WalletTransactionsData | null;
  error: string | null;
  filters: TransactionFiltersValue;
  setFilters: (filters: TransactionFiltersValue) => void;
  clearFilters: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => void;
  filteredTransactions: WalletTransactionRow[];
  paginatedTransactions: WalletTransactionRow[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  creditsCount: number;
  debitsCount: number;
  reservesCount: number;
  exportCsv: () => void;
}

export function useWalletTransactions(token: string | null): UseWalletTransactionsReturn {
  const [data, setData] = useState<WalletTransactionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFiltersValue>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
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

  const refresh = useCallback((): void => {
    if (!token) return;
    setIsRefreshing(true);
    setIsLoading(true);
    void loadTransactions();
  }, [loadTransactions, token]);

  const filteredTransactions = data
    ? filterAndSortTransactions(data.transactions, filters, deferredSearch)
    : [];
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const exportCsv = useCallback((): void => {
    if (!data || filteredTransactions.length === 0) return;
    downloadWalletTransactionsCsv(
      filteredTransactions,
      data.currency,
      buildExportFilename(),
      data.runningBalanceAvailable
    );
  }, [data, filteredTransactions]);

  return {
    data,
    error,
    filters,
    setFilters,
    clearFilters: () => setFilters(DEFAULT_FILTERS),
    isLoading,
    isRefreshing,
    refresh,
    filteredTransactions,
    paginatedTransactions,
    currentPage: page,
    totalPages,
    pageSize: PAGE_SIZE,
    setCurrentPage,
    creditsCount: data?.transactions.filter((transaction) => transaction.type === "credit").length ?? 0,
    debitsCount: data?.transactions.filter((transaction) => transaction.type === "debit").length ?? 0,
    reservesCount: data?.transactions.filter((transaction) => transaction.type === "reserve").length ?? 0,
    exportCsv,
  };
}
