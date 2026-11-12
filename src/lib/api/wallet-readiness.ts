import { API_URL } from "@/config/api";
import type { WalletReadinessData } from "@/types/wallet.types";

/** Whether the caller's wallet can take part in money actions, and any sandbox read-only window. */
export async function getWalletReadiness(token: string): Promise<WalletReadinessData> {
  const response = await fetch(`${API_URL}/wallet/readiness`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Could not read the wallet status (${response.status}).`);
  }

  const json = (await response.json()) as { data: WalletReadinessData };
  return json.data;
}
