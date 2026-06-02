import { API_URL } from "@/config/api";
import {
  getBalanceHistoryAnalytics,
  getEarningsAnalytics,
  getSpendingAnalytics,
} from "@/lib/api/analytics";

export interface WalletBalance {
  currency: string;
  available: string;
  reserved: string;
}

export interface WalletMonthlyStats {
  currentMonthEarnings: string;
  currentMonthSpending: string;
  previousMonthEarnings: string;
  previousMonthSpending: string;
}

export interface WalletWithdrawals {
  pendingTotal: string;
  pendingCount: number;
}

export interface WalletChartPoint {
  label: string;
  earnings: number;
  spending: number;
}

export type WalletTransactionType = "credit" | "debit" | "reserve";

export interface WalletTransactionRow {
  id: string;
  type: WalletTransactionType;
  amount: string;
  description: string;
  createdAt: string;
  orderId?: string | null;
  balanceAfter?: string | null;
}

export interface WalletTransactionsData {
  currency: string;
  runningBalanceAvailable: boolean;
  transactions: WalletTransactionRow[];
}

export interface WalletDashboardData {
  balance: WalletBalance;
  monthly: WalletMonthlyStats;
  withdrawals: WalletWithdrawals;
  chart: WalletChartPoint[];
  recentTransactions: WalletTransactionRow[];
}

export interface CreateWithdrawalRequestInput {
  amount: number;
  destination: string;
  saveDestination?: boolean;
}

interface WithdrawalApiPayload {
  amount: string;
  currency: string;
  destinationType: string;
  destinationRef: string;
  commit: boolean;
}

export interface WithdrawalRequestData {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  amount: string;
  fee: string;
  totalDeducted: string;
  currency: string;
  destination: string;
  estimatedArrival: string;
  createdAt: string;
  message?: string;
}

export interface WalletBalanceSummary {
  availableBalance: string;
  reservedBalance: string;
  currency: string;
}

export interface WalletTransactionFilters {
  search?: string;
  types?: WalletTransactionType[];
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
}

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

  // Enrich with analytics endpoints when available (404 = not yet deployed, skip silently)
  const [earningsRes, spendingRes, historyRes] = await Promise.allSettled([
    getEarningsAnalytics(token),
    getSpendingAnalytics(token),
    getBalanceHistoryAnalytics(token),
  ]);

  if (earningsRes.status === "fulfilled") {
    data.monthly.currentMonthEarnings = earningsRes.value.currentMonth;
    data.monthly.previousMonthEarnings = earningsRes.value.previousMonth;
  }

  if (spendingRes.status === "fulfilled") {
    data.monthly.currentMonthSpending = spendingRes.value.currentMonth;
    data.monthly.previousMonthSpending = spendingRes.value.previousMonth;
  }

  if (historyRes.status === "fulfilled" && historyRes.value.length > 0) {
    data.chart = historyRes.value;
  }

  return data;
}

export async function createWithdrawalRequest(
  token: string,
  payload: CreateWithdrawalRequestInput
): Promise<WithdrawalRequestData> {
  const response = await fetch(`${API_URL}/wallet/withdraw`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: payload.amount.toFixed(2),
      currency: "USD",
      destinationType: "crypto",
      destinationRef: payload.destination,
      commit: true,
    } satisfies WithdrawalApiPayload),
  });

  const json = (await response.json().catch(() => null)) as
    | {
        message?: string;
        title?: string;
        data?: WithdrawalRequestData;
        error?: { message?: string };
      }
    | null;

  if (!response.ok) {
    const message =
      json?.error?.message ??
      json?.message ??
      json?.title ??
      "Failed to create withdrawal request";
    throw new Error(message);
  }

  if (json?.data) {
    return json.data;
  }

  throw new Error("Withdrawal request was created, but no response data was returned.");
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
