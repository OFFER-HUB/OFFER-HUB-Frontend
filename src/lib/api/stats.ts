import { API_URL } from "@/config/api";

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

export async function getPlatformStats(
  walletsLimit: number = 5,
  escrowsLimit: number = 5
): Promise<PlatformStatsResponse> {
  const url = new URL(`${API_URL}/config/stats`);
  url.searchParams.append("walletsLimit", walletsLimit.toString());
  url.searchParams.append("escrowsLimit", escrowsLimit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to fetch platform statistics");
  }

  const result = await response.json();
  return result.data;
}
