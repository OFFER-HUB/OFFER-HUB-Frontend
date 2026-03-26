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

const mockTransactionTime = (hoursAgo: number): string =>
  new Date(Date.now() - hoursAgo * 3600_000).toISOString();

export const MOCK_WALLET_TRANSACTIONS: WalletTransactionsData = {
  currency: "USD",
  runningBalanceAvailable: true,
  transactions: [
    {
      id: "txn-150-001",
      type: "credit",
      amount: "825.00",
      description: "Milestone released for brand identity package",
      createdAt: mockTransactionTime(5),
      orderId: "ord-1a2b3c4d",
      balanceAfter: "4820.50",
    },
    {
      id: "txn-150-002",
      type: "reserve",
      amount: "220.00",
      description: "Funds reserved for mobile app audit",
      createdAt: mockTransactionTime(12),
      orderId: "ord-5e6f7g8h",
      balanceAfter: "3995.50",
    },
    {
      id: "txn-150-003",
      type: "debit",
      amount: "140.00",
      description: "Withdrawal to connected bank account",
      createdAt: mockTransactionTime(28),
      balanceAfter: "4215.50",
    },
    {
      id: "txn-150-004",
      type: "credit",
      amount: "310.00",
      description: "Referral bonus payout",
      createdAt: mockTransactionTime(31),
      balanceAfter: "4355.50",
    },
    {
      id: "txn-150-005",
      type: "debit",
      amount: "96.00",
      description: "Premium workspace subscription",
      createdAt: mockTransactionTime(46),
      balanceAfter: "4045.50",
    },
    {
      id: "txn-150-006",
      type: "credit",
      amount: "1290.00",
      description: "Escrow released for dashboard redesign",
      createdAt: mockTransactionTime(54),
      orderId: "ord-9i0j1k2l",
      balanceAfter: "4141.50",
    },
    {
      id: "txn-150-007",
      type: "reserve",
      amount: "180.00",
      description: "Funds reserved for copywriting sprint",
      createdAt: mockTransactionTime(63),
      orderId: "ord-3m4n5o6p",
      balanceAfter: "2851.50",
    },
    {
      id: "txn-150-008",
      type: "credit",
      amount: "455.00",
      description: "Wallet top-up via card",
      createdAt: mockTransactionTime(74),
      balanceAfter: "3031.50",
    },
    {
      id: "txn-150-009",
      type: "debit",
      amount: "72.50",
      description: "Platform service fee",
      createdAt: mockTransactionTime(88),
      balanceAfter: "2576.50",
    },
    {
      id: "txn-150-010",
      type: "credit",
      amount: "980.00",
      description: "Consulting retainer deposit",
      createdAt: mockTransactionTime(101),
      orderId: "ord-7q8r9s0t",
      balanceAfter: "2649.00",
    },
    {
      id: "txn-150-011",
      type: "reserve",
      amount: "90.00",
      description: "Dispute hold for order review",
      createdAt: mockTransactionTime(123),
      orderId: "ord-1u2v3w4x",
      balanceAfter: "1669.00",
    },
    {
      id: "txn-150-012",
      type: "debit",
      amount: "210.00",
      description: "USDC off-ramp transfer",
      createdAt: mockTransactionTime(148),
      balanceAfter: "1759.00",
    },
    {
      id: "txn-150-013",
      type: "credit",
      amount: "640.00",
      description: "Order payment released for SEO package",
      createdAt: mockTransactionTime(171),
      orderId: "ord-5y6z7a8b",
      balanceAfter: "1969.00",
    },
    {
      id: "txn-150-014",
      type: "debit",
      amount: "58.75",
      description: "Collaboration tools reimbursement",
      createdAt: mockTransactionTime(201),
      balanceAfter: "1329.00",
    },
    {
      id: "txn-150-015",
      type: "credit",
      amount: "375.00",
      description: "Affiliate campaign payout",
      createdAt: mockTransactionTime(225),
      balanceAfter: "1387.75",
    },
    {
      id: "txn-150-016",
      type: "reserve",
      amount: "120.00",
      description: "Funds reserved for discovery workshop",
      createdAt: mockTransactionTime(246),
      orderId: "ord-9c0d1e2f",
      balanceAfter: "1012.75",
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

  const payload = "data" in json ? json.data : json;
  if (Array.isArray(payload)) {
    return {
      currency: "USD",
      runningBalanceAvailable: payload.some((tx) => Boolean(tx.balanceAfter)),
      transactions: payload,
    };
  }

  return payload;
}
