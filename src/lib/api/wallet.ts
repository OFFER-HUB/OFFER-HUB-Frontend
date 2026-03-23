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
