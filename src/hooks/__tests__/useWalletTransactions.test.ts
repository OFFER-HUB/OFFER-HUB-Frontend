import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WalletTransactionsData } from "@/lib/api/wallet";

const { downloadWalletTransactionsCsv } = vi.hoisted(() => ({
  downloadWalletTransactionsCsv: vi.fn(),
}));

vi.mock("@/components/wallet/transactionsCsv", () => ({
  downloadWalletTransactionsCsv,
}));

import { useWalletTransactions } from "@/hooks/useWalletTransactions";

const data: WalletTransactionsData = {
  currency: "USD",
  runningBalanceAvailable: true,
  transactions: Array.from({ length: 9 }, (_, index) => ({
    id: `tx-${index + 1}`,
    type:
      index === 0 ? ("credit" as const) : index === 1 ? ("debit" as const) : ("reserve" as const),
    amount: String((index + 1) * 10),
    description: index === 0 ? "Client payment" : `Wallet entry ${index + 1}`,
    createdAt: `2026-10-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
    balanceAfter: "100.00",
  })),
};

describe("useWalletTransactions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns counts, sorts newest first, and paginates to eight rows", () => {
    const { result } = renderHook(() => useWalletTransactions(data));

    expect(result.current.creditsCount).toBe(1);
    expect(result.current.debitsCount).toBe(1);
    expect(result.current.reservesCount).toBe(7);
    expect(result.current.filteredTransactions[0].id).toBe("tx-9");
    expect(result.current.paginatedTransactions).toHaveLength(8);
    expect(result.current.totalPages).toBe(2);

    act(() => result.current.setCurrentPage(2));
    expect(result.current.paginatedTransactions).toHaveLength(1);
    expect(result.current.paginatedTransactions[0].id).toBe("tx-1");
  });

  it("filters transaction rows and resets pagination when filters change", () => {
    const { result } = renderHook(() => useWalletTransactions(data));

    act(() => result.current.setCurrentPage(2));
    act(() =>
      result.current.setFilters({
        search: "client",
        types: ["credit"],
        startDate: "2026-10-01",
        endDate: "2026-10-09",
        minAmount: "10",
        maxAmount: "10",
        sortBy: "date-desc",
      })
    );

    expect(result.current.page).toBe(1);
    expect(result.current.filteredTransactions.map((row) => row.id)).toEqual(["tx-1"]);
  });

  it("exports the filtered rows with currency and running-balance metadata", () => {
    const { result } = renderHook(() => useWalletTransactions(data));

    act(() => result.current.exportCsv());

    expect(downloadWalletTransactionsCsv).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "tx-9" })]),
      "USD",
      expect.stringMatching(/^offer-hub-wallet-transactions-\d{4}-\d{2}-\d{2}\.csv$/),
      true
    );
  });
});
