import { API_URL } from "@/config/api";
import type {
  WalletBalance,
  WalletMonthlyStats,
  WalletWithdrawals,
  WalletChartPoint,
  WalletTransactionType,
  WalletTransactionRow,
  WalletTransactionsData,
  WalletDashboardData,
  WalletBalanceSummary,
  WalletTransactionFilters,
} from "@/types/wallet.types";

export type {
  WalletBalance,
  WalletMonthlyStats,
  WalletWithdrawals,
  WalletChartPoint,
  WalletTransactionType,
  WalletTransactionRow,
  WalletTransactionsData,
  WalletDashboardData,
  WalletBalanceSummary,
  WalletTransactionFilters,
};

type ApiErrorResponse = {
  message?: string;
  title?: string;
  error?: { message?: string };
};

async function parseApiError(response: Response, fallback: string): Promise<Error> {
  const json = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  return new Error(json?.error?.message ?? json?.message ?? json?.title ?? fallback);
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function hasWalletDashboardShape(data: unknown): data is WalletDashboardData {
  return Boolean(
    data &&
      typeof data === "object" &&
      "balance" in data &&
      "monthly" in data &&
      "withdrawals" in data &&
      "chart" in data &&
      "recentTransactions" in data
  );
}

function buildTransactionsUrl(filters: WalletTransactionFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.types && filters.types.length > 0) params.set("types", filters.types.join(","));
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.minAmount) params.set("minAmount", filters.minAmount);
  if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);

  const query = params.toString();
  return `${API_URL}/wallet/transactions${query ? `?${query}` : ""}`;
}

export async function getWalletBalance(token: string): Promise<WalletBalanceSummary> {
  const response = await fetch(`${API_URL}/wallet`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw await parseApiError(response, "Failed to load wallet balance");
  const json = (await response.json()) as { data: WalletBalanceSummary | WalletDashboardData };

  if (hasWalletDashboardShape(json.data)) {
    return {
      availableBalance: json.data.balance.available,
      reservedBalance: json.data.balance.reserved,
      currency: json.data.balance.currency,
    };
  }

  return json.data;
}

export async function getWalletDashboard(token: string): Promise<WalletDashboardData> {
  const response = await fetch(`${API_URL}/wallet/dashboard`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to load wallet");
  }

  const json = (await response.json()) as { data: WalletDashboardData };
  const data = json.data;

  // Ensure monthly always exists even if the API omits it
  if (!data.monthly) {
    data.monthly = {
      currentMonthEarnings: "0.00",
      previousMonthEarnings: "0.00",
      currentMonthSpending: "0.00",
      previousMonthSpending: "0.00",
    };
  }

  return data;
}

export async function getWalletTransactions(
  token: string,
  filters: WalletTransactionFilters = {}
): Promise<WalletTransactionsData> {
  const response = await fetch(buildTransactionsUrl(filters), {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to load wallet transactions");
  }

  const json = (await response.json()) as
    | { data: WalletTransactionsData | WalletTransactionRow[] }
    | WalletTransactionsData
    | WalletTransactionRow[];

  const data = "data" in json ? json.data : json;
  if (Array.isArray(data)) {
    return {
      currency: "USD",
      runningBalanceAvailable: data.some((tx) => Boolean(tx.balanceAfter)),
      transactions: data,
    };
  }

  return data;
}
