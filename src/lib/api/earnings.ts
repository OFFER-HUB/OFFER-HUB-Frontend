import { API_URL } from "@/config/api";
import type {
  FreelancerEarningsAnalytics,
  EarningsAnalyticsParams,
} from "@/types/earnings.types";

export type {
  EarningsMonthlyPoint,
  EarningsClientRow,
  EarningsCategoryRow,
  EarningsPeriodMetrics,
  FreelancerEarningsAnalytics,
  EarningsAnalyticsParams,
  PresetId,
} from "@/types/earnings.types";

function extractData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export async function getFreelancerEarningsAnalytics(
  token: string,
  params: EarningsAnalyticsParams
): Promise<FreelancerEarningsAnalytics> {
  const query = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  const response = await fetch(`${API_URL}/freelancer/earnings/analytics?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = "Failed to load earnings analytics";
    try {
      const err = (await response.json()) as { error?: { message?: string }; message?: string };
      if (err?.error?.message) message = err.error.message;
      else if (typeof err?.message === "string") message = err.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const json = await response.json();
  return extractData<FreelancerEarningsAnalytics>(json);
}
