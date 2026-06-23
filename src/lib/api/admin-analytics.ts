import { API_URL } from "@/config/api";
import type { ApiResponse } from "@/types/api-response.types";
import type {
  AdminAnalyticsData,
  DateRange,
  ExportFormat,
  TrendsChartData,
} from "@/types/admin-analytics.types";

const API_BASE_URL = API_URL;

type ApiErrorResponse = {
  message?: string;
  title?: string;
  error?: { message?: string };
};

async function parseApiError(response: Response, fallback: string): Promise<Error> {
  const json = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  return new Error(json?.error?.message ?? json?.message ?? json?.title ?? fallback);
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Fetch platform-wide analytics data for the admin dashboard.
 */
export async function getAdminAnalytics(
  token: string,
  dateRange?: DateRange
): Promise<AdminAnalyticsData> {
  const params = dateRange
    ? `?start=${dateRange.start}&end=${dateRange.end}`
    : "";

  const response = await fetch(`${API_BASE_URL}/admin/analytics${params}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch admin analytics");
  }

  const result = (await response.json()) as ApiResponse<AdminAnalyticsData>;

  if (!result.data) {
    throw new Error(result.message || "Admin analytics response was empty");
  }

  return result.data;
}

/**
 * Fetch trends data for a specific time period.
 */
export async function getAnalyticsTrends(
  token: string,
  period: TrendsChartData["period"],
  dateRange?: DateRange
): Promise<TrendsChartData> {
  const params = new URLSearchParams({ period });
  if (dateRange) {
    params.append("start", dateRange.start);
    params.append("end", dateRange.end);
  }

  const response = await fetch(`${API_BASE_URL}/admin/analytics/trends?${params}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch analytics trends");
  }

  const result = (await response.json()) as ApiResponse<TrendsChartData>;

  if (!result.data) {
    throw new Error(result.message || "Analytics trends response was empty");
  }

  return result.data;
}

/**
 * Export analytics data in the specified format.
 */
export async function exportAnalyticsData(
  token: string,
  format: ExportFormat,
  dateRange?: DateRange,
  includeCharts: boolean = false
): Promise<Blob> {
  const params = new URLSearchParams({
    format,
    includeCharts: includeCharts.toString(),
  });

  if (dateRange) {
    params.append("start", dateRange.start);
    params.append("end", dateRange.end);
  }

  const response = await fetch(`${API_BASE_URL}/admin/analytics/export?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await parseApiError(response, "Failed to export analytics data");
  }

  return response.blob();
}