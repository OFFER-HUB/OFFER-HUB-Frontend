import { API_URL } from "@/config/api";
import type {
  AdminAnalyticsData,
  AnalyticsGranularity,
  DateRange,
  PlatformAnalytics,
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Pick a bucket size that keeps the trends chart readable: daily up to a
 * month, weekly up to half a year, monthly beyond.
 */
export function granularityForRange(range: DateRange): AnalyticsGranularity {
  const days = Math.round((Date.parse(range.end) - Date.parse(range.start)) / MS_PER_DAY);
  if (days <= 31) return "day";
  if (days <= 183) return "week";
  return "month";
}

/**
 * The backend does `new Date(to)`, so a bare "YYYY-MM-DD" end date would stop
 * at midnight and drop that whole day. Send full-day bounds instead.
 */
export function buildAnalyticsSearchParams(range: DateRange): URLSearchParams {
  return new URLSearchParams({
    from: `${range.start}T00:00:00.000Z`,
    to: `${range.end}T23:59:59.999Z`,
    granularity: granularityForRange(range),
  });
}

function toNumber(decimal: string): number {
  const parsed = parseFloat(decimal);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Build the dashboard view model from the backend document. Pure; no I/O. */
export function toAdminAnalyticsData(raw: PlatformAnalytics): AdminAnalyticsData {
  const totalServices = raw.services.total;
  const categories = Object.entries(raw.services.byCategory)
    .map(([category, services]) => ({
      category,
      services,
      percentage: totalServices > 0 ? (services / totalServices) * 100 : 0,
    }))
    .sort((a, b) => b.services - a.services);

  return {
    period: raw.period,
    stats: {
      totalUsers: raw.users.total,
      activeUsers: raw.users.active,
      newUsers: raw.users.newThisPeriod,
      newUsersChangePercent: raw.comparison.users.changePercent,
      totalOrders: raw.orders.total,
      completedOrders: raw.orders.completed,
      ordersChangePercent: raw.comparison.orders.changePercent,
      transactionVolume: toNumber(raw.orders.totalVolume),
      volumeChangePercent: raw.comparison.volume.changePercent,
      averageOrderValue: toNumber(raw.orders.averageValue),
      openDisputes: raw.disputes.open,
      disputeRate: raw.disputes.rate,
      withdrawalsVolume: toNumber(raw.withdrawals.totalVolume),
    },
    trends: raw.timeSeries.map((point) => ({
      label: point.label,
      newUsers: point.newUsers,
      orders: point.orders,
      volume: toNumber(point.volume),
    })),
    categories,
  };
}

/**
 * Fetch platform-wide analytics for the admin dashboard.
 */
export async function getAdminAnalytics(token: string, range: DateRange): Promise<AdminAnalyticsData> {
  const response = await fetch(
    `${API_BASE_URL}/admin/analytics?${buildAnalyticsSearchParams(range).toString()}`,
    { headers: authHeaders(token) }
  );

  if (!response.ok) {
    throw await parseApiError(response, "Failed to fetch admin analytics");
  }

  const json = (await response.json()) as { data: PlatformAnalytics };
  return toAdminAnalyticsData(json.data);
}

/**
 * Download the same period as CSV — the only export format the backend offers.
 */
export async function exportAnalyticsCsv(token: string, range: DateRange): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/admin/analytics/export?${buildAnalyticsSearchParams(range).toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw await parseApiError(response, "Failed to export analytics data");
  }

  return response.blob();
}
