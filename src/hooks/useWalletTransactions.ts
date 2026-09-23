import { useMemo, useState } from "react";
import type { WalletTransactionsData } from "@/lib/api/wallet";
import type { TransactionFiltersValue } from "@/components/wallet/TransactionFilters";

export const WALLET_TRANSACTION_PAGE_SIZE = 8;
export const DEFAULT_TRANSACTION_FILTERS: TransactionFiltersValue = { search: "", types: [], startDate: "", endDate: "", minAmount: "", maxAmount: "", sortBy: "date-desc" };
const amount = (value: string) => Number.isNaN(Number.parseFloat(value)) ? 0 : Number.parseFloat(value);
const timestamp = (value: string) => { const result = new Date(value).getTime(); return Number.isNaN(result) ? 0 : result; };

export function useWalletTransactions(data: WalletTransactionsData | null) {
  const [filters, setFilters] = useState<TransactionFiltersValue>(DEFAULT_TRANSACTION_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const filteredTransactions = useMemo(() => {
    if (!data) return [];
    const search = filters.search.trim().toLowerCase();
    const min = filters.minAmount === "" ? null : Number.parseFloat(filters.minAmount);
    const max = filters.maxAmount === "" ? null : Number.parseFloat(filters.maxAmount);
    return data.transactions.filter((transaction) => {
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) return false;
      if (search && !transaction.description.toLowerCase().includes(search)) return false;
      if (filters.startDate && transaction.createdAt.slice(0, 10) < filters.startDate) return false;
      if (filters.endDate && transaction.createdAt.slice(0, 10) > filters.endDate) return false;
      if (min !== null && !Number.isNaN(min) && amount(transaction.amount) < min) return false;
      return !(max !== null && !Number.isNaN(max) && amount(transaction.amount) > max);
    }).sort((left, right) => filters.sortBy === "date-asc" ? timestamp(left.createdAt) - timestamp(right.createdAt) : filters.sortBy === "date-desc" ? timestamp(right.createdAt) - timestamp(left.createdAt) : filters.sortBy === "amount-asc" ? amount(left.amount) - amount(right.amount) : amount(right.amount) - amount(left.amount));
  }, [data, filters]);
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / WALLET_TRANSACTION_PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  return { filters, setFilters, currentPage, setCurrentPage, filteredTransactions, paginatedTransactions: filteredTransactions.slice((page - 1) * WALLET_TRANSACTION_PAGE_SIZE, page * WALLET_TRANSACTION_PAGE_SIZE), page, totalPages, creditsCount: data?.transactions.filter((t) => t.type === "credit").length ?? 0, debitsCount: data?.transactions.filter((t) => t.type === "debit").length ?? 0, reservesCount: data?.transactions.filter((t) => t.type === "reserve").length ?? 0 };
}
