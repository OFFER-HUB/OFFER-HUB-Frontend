import { API_URL } from "@/config/api";
import { getMockProfileViewsAnalytics } from "@/data/profile-views.data";
import type { ApiResponse } from "@/types/api-response.types";
import type { ProfileViewsAnalytics } from "@/types/profile-views.types";

const API_BASE_URL = API_URL;

export interface MonthlyAnalyticsMetric {
  currentMonth: string;
  previousMonth: string;
  changePercent: number | null;
  currency?: string;
}

export interface BalanceHistoryPoint {
  label: string;
  earnings: number;
  spending: number;
}

function extractData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json && json.data !== undefined) {
    return (json as { data: T }).data;
  }
  return json as T;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toMoneyString(value: unknown): string {
  return toNumber(value, 0).toFixed(2);
}

function toOptionalPercent(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveValue(source: Record<string, unknown>, keys: string[], fallback: unknown = 0): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return fallback;
}

function normalizeMetric(payload: unknown): MonthlyAnalyticsMetric {
  const obj = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;

  const currentMonth = resolveValue(obj, [
    "currentMonth",
    "currentMonthEarnings",
    "currentMonthSpending",
    "thisMonth",
    "monthly",
    "value",
    "amount",
  ]);
  const previousMonth = resolveValue(obj, [
    "previousMonth",
    "previousMonthEarnings",
    "previousMonthSpending",
    "lastMonth",
    "previous",
    "previousValue",
  ]);
  const changePercent = resolveValue(obj, [
    "changePercent",
    "percentageChange",
    "percentChange",
    "monthOverMonthPercent",
  ], null);
  const currency = resolveValue(obj, ["currency", "currencyCode"], undefined);

  return {
    currentMonth: toMoneyString(currentMonth),
    previousMonth: toMoneyString(previousMonth),
    changePercent: toOptionalPercent(changePercent),
    currency: typeof currency === "string" ? currency : undefined,
  };
}

async function fetchAnalyticsMetric(
  token: string,
  endpoint: "earnings" | "spending"
): Promise<MonthlyAnalyticsMetric> {
  const response = await fetch(`${API_BASE_URL}/analytics/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load analytics ${endpoint}`);
  }

  const json = await response.json();
  return normalizeMetric(extractData<unknown>(json));
}

function normalizeBalanceHistory(payload: unknown): BalanceHistoryPoint[] {
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { points?: unknown[] }).points)
      ? (payload as { points: unknown[] }).points
      : [];

  return rows.map((row, index) => {
    const point = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
    const fallbackLabel = `Period ${index + 1}`;

    return {
      label:
        (typeof point.label === "string" && point.label) ||
        (typeof point.month === "string" && point.month) ||
        (typeof point.period === "string" && point.period) ||
        fallbackLabel,
      earnings: toNumber(resolveValue(point, ["earnings", "income", "credits"], 0), 0),
      spending: toNumber(resolveValue(point, ["spending", "expenses", "debits"], 0), 0),
    };
  });
}

export async function getEarningsAnalytics(token: string): Promise<MonthlyAnalyticsMetric> {
  return fetchAnalyticsMetric(token, "earnings");
}

export async function getSpendingAnalytics(token: string): Promise<MonthlyAnalyticsMetric> {
  return fetchAnalyticsMetric(token, "spending");
}

export async function getBalanceHistoryAnalytics(token: string): Promise<BalanceHistoryPoint[]> {
  const response = await fetch(`${API_BASE_URL}/analytics/balance-history`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load analytics balance history");
  }

  const json = await response.json();
  return normalizeBalanceHistory(extractData<unknown>(json));
}

/**
 * Fetch profile views analytics for the authenticated freelancer.
 *
 * Falls back to mock data when the endpoint is unavailable so the dashboard
 * remains reviewable during frontend development.
 */
export async function getProfileViewsAnalytics(token: string): Promise<ProfileViewsAnalytics> {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer/analytics/profile-views`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile views analytics");
    }

    const result = (await response.json()) as ApiResponse<ProfileViewsAnalytics>;

    if (!result.data) {
      throw new Error("Profile views analytics response was empty");
    }

    return result.data;
  } catch {
    return getMockProfileViewsAnalytics();
  }
}
