import { API_URL } from "@/config/api";
import type { ApiResponse } from "@/types/api-response.types";
import type { PlatformStatsResponse, PublicValidationResults } from "@/types/stats.types";

export type {
  PlatformStatsResponse,
  PlatformStatsSummary,
  RecentEscrow,
  RecentWallet,
} from "@/types/stats.types";

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
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to fetch platform statistics");
  }

  const result = await response.json();
  return result.data;
}

export async function getPublicValidationResults(): Promise<PublicValidationResults> {
  const response = await fetch(`${API_URL}/config/validation-results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch public validation results");
  }

  const result: ApiResponse<PublicValidationResults> = await response.json();
  if (!result.data) {
    throw new Error("Public validation results are unavailable");
  }

  return result.data;
}
