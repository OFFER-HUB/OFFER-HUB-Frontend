import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import { getWalletTransactions } from "@/lib/api/wallet";
import { downloadWalletTransactionsCsv } from "@/components/wallet/transactionsCsv";
import type { WalletTransactionRow, WalletTransactionsData } from "@/types/wallet.types";

vi.mock("@/lib/api/wallet", () => ({
  getWalletTransactions: vi.fn(),
}));

vi.mock("@/components/wallet/transactionsCsv", () => ({
  downloadWalletTransactionsCsv: vi.fn(),
}));

const mockGetWalletTransactions = vi.mocked(getWalletTransactions);
const mockDownloadCsv = vi.mocked(downloadWalletTransactionsCsv);

function transaction(
  id: string,
  amount: string,
  type: WalletTransactionRow["type"] = "credit",
  createdAt = `2026-10-${String(Number(id) + 1).padStart(2, "0")}T12:00:00.000Z`
): WalletTransactionRow {
  return {
    id,
    type,
    amount,
    description: `Transaction ${id}`,
    createdAt,
  };
}

function transactionsData(rows: WalletTransactionRow[] = []): WalletTransactionsData {
  return {
    currency: "USD",
    runningBalanceAvailable: true,
    transactions: rows,
  };
}

describe("useWalletTransactions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads transactions and derives counts, sorting, and pagination", async () => {
    const rows = Array.from({ length: 10 }, (_, index) =>
      transaction(String(index), String(index + 1), index === 8 ? "debit" : "credit")
    );
    mockGetWalletTransactions.mockResolvedValue(transactionsData(rows));

    const { result } = renderHook(() => useWalletTransactions("token"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetWalletTransactions).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({ sortBy: "date-desc" })
    );
    expect(result.current.filteredTransactions).toHaveLength(10);
    expect(result.current.filteredTransactions.slice(0, 2).map((row) => row.id)).toEqual(["9", "8"]);
    expect(result.current.paginatedTransactions).toHaveLength(8);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.creditsCount).toBe(9);
    expect(result.current.debitsCount).toBe(1);
    expect(result.current.reservesCount).toBe(0);

    act(() => result.current.setCurrentPage(2));
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedTransactions).toHaveLength(2);
  });

  it("applies amount and search filters and resets pagination when filters change", async () => {
    const rows = [
      transaction("0", "12", "credit"),
      { ...transaction("1", "25", "debit"), description: "Client payment" },
      transaction("2", "40", "reserve"),
    ];
    mockGetWalletTransactions.mockResolvedValue(transactionsData(rows));

    const { result } = renderHook(() => useWalletTransactions("token"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setCurrentPage(2));

    act(() =>
      result.current.setFilters({
        ...result.current.filters,
        search: "client",
        minAmount: "20",
        maxAmount: "30",
      })
    );

    await waitFor(() => expect(result.current.filteredTransactions).toHaveLength(1));
    expect(result.current.filteredTransactions[0]?.description).toBe("Client payment");
    expect(result.current.currentPage).toBe(1);
  });

  it("exports the filtered rows using the wallet currency and balance setting", async () => {
    const rows = [transaction("0", "12")];
    mockGetWalletTransactions.mockResolvedValue(transactionsData(rows));

    const { result } = renderHook(() => useWalletTransactions("token"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.exportCsv());

    expect(mockDownloadCsv).toHaveBeenCalledWith(
      rows,
      "USD",
      expect.stringMatching(/^offer-hub-wallet-transactions-\d{4}-\d{2}-\d{2}\.csv$/),
      true
    );
  });

  it("stops loading without requesting when no token is available", async () => {
    const { result } = renderHook(() => useWalletTransactions(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(mockGetWalletTransactions).not.toHaveBeenCalled();
  });
});
