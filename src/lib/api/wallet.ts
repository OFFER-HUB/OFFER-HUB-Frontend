import { API_URL } from "@/config/api";

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

export interface WalletTransactionRow {
  id: string;
  type: "credit" | "debit";
  amount: string;
  description: string;
  createdAt: string;
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

/**
 * Demo payload when the API is unavailable (local dev or endpoint not deployed).
 */
export const MOCK_WALLET_DASHBOARD: WalletDashboardData = {
  balance: {
    currency: "USD",
    available: "4820.50",
    reserved: "340.00",
  },
  monthly: {
    currentMonthEarnings: "2100.00",
    currentMonthSpending: "890.25",
    previousMonthEarnings: "1750.00",
    previousMonthSpending: "1200.00",
  },
  withdrawals: {
    pendingTotal: "500.00",
    pendingCount: 1,
  },
  chart: [
    { label: "Week 1", earnings: 420, spending: 180 },
    { label: "Week 2", earnings: 510, spending: 220 },
    { label: "Week 3", earnings: 680, spending: 190 },
    { label: "Week 4", earnings: 490, spending: 300 },
  ],
  recentTransactions: [
    {
      id: "1",
      type: "credit",
      amount: "250.00",
      description: "Order payment released",
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
    },
    {
      id: "2",
      type: "debit",
      amount: "75.00",
      description: "Service purchase",
      createdAt: new Date(Date.now() - 86400_000).toISOString(),
    },
    {
      id: "3",
      type: "credit",
      amount: "1200.00",
      description: "Wallet top-up",
      createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
    },
  ],
};

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
  return json.data;
}

export async function createWithdrawalRequest(
  token: string,
  payload: CreateWithdrawalRequestInput
): Promise<WithdrawalRequestData> {
  const response = await fetch(`${API_URL}/wallet/withdrawals`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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
