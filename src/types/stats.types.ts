export interface PlatformStatsSummary {
  users: number;
  wallets: number;
  escrows: number;
  transactions: number;
}

export interface RecentWallet {
  id: string;
  publicKey: string;
  createdAt: string;
}

export interface RecentEscrow {
  id: string;
  orderId: string;
  trustlessContractId: string | null;
  status: string;
  amount: string;
  createdAt: string;
}

export interface PlatformStatsResponse {
  summary: PlatformStatsSummary;
  recentWallets: RecentWallet[];
  recentEscrows: RecentEscrow[];
}
