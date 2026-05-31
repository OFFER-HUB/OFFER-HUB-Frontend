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

export async function getWalletBalance(token: string): Promise<WalletBalanceSummary> {
  const response = await fetch(`${API_URL}/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to load wallet balance");
  const json = (await response.json()) as { data: WalletBalanceSummary };
  return json.data;
}

export async function getWalletDashboard(token: string): Promise<WalletDashboardData> {
  const response = await fetch(`${API_URL}/wallet/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = "Failed to load wallet";
    try {
      const err = (await response.json()) as { error?: { message?: string } };
      if (err?.error?.message) message = err.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const json = (await response.json()) as { data: WalletDashboardData };
  const data = json.data;

  // Wallet dashboard still provides balance/withdrawals/transactions while
  // analytics endpoints provide monthly metrics + history chart.
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

export async function getWalletTransactions(token: string): Promise<WalletTransactionsData> {
  const response = await fetch(`${API_URL}/wallet/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = "Failed to load wallet transactions";
    try {
      const err = (await response.json()) as { error?: { message?: string } };
      if (err?.error?.message) message = err.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
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
