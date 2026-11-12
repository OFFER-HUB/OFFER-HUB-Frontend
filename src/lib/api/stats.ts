import { API_URL } from "@/config/api";
import type {
  PlatformStatsResponse,
  PublicValidationResults,
  PublicValidationRun,
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
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to fetch platform statistics");
  }

  const result = await response.json();
  return result.data;
}

export async function getPublicValidationResults(limit: number = 20): Promise<PublicValidationResults> {
  const url = new URL(`${API_URL}/validation/runs`);
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to fetch public validation results");
  }

  const result: { data?: PublicValidationRun[]; meta?: { total?: number } } = await response.json();
  if (!Array.isArray(result.data)) {
    throw new Error("Public validation results are unavailable");
  }

  return { runs: result.data, total: result.meta?.total ?? result.data.length };
}
