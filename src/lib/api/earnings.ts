import { API_URL } from "@/config/api";

export interface EarningsMonthlyPoint {
  /** Short label for charts, e.g. "Mar 2025" */
  label: string;
  /** ISO month start YYYY-MM-DD */
  monthStart: string;
  earnings: number;
  orderCount: number;
}

export interface EarningsClientRow {
  clientId: string;
  clientName: string;
  earnings: number;
  orderCount: number;
}

export interface EarningsCategoryRow {
  categoryId: string;
  categoryLabel: string;
  earnings: number;
  orderCount: number;
}

export interface EarningsPeriodMetrics {
  start: string;
  end: string;
  totalEarnings: string;
  orderCount: number;
  averageOrderValue: string;
}

export interface FreelancerEarningsAnalytics {
  currency: string;
  totals: {
    thisMonth: string;
    thisYear: string;
    allTime: string;
  };
  /** Selected range */
  currentPeriod: EarningsPeriodMetrics;
  /** Same length immediately before currentPeriod.start */
  previousPeriod: EarningsPeriodMetrics;
  /** Monthly buckets within the selected range (max 12 points) */
  monthly: EarningsMonthlyPoint[];
  byClient: EarningsClientRow[];
  byCategory: EarningsCategoryRow[];
  /** Optional monthly revenue goal (same currency) for progress / chart reference */
  monthlyGoal?: string;
}

export interface EarningsAnalyticsParams {
  startDate: string;
  endDate: string;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatMonthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function monthStartStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`;
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function parseISODate(s: string): Date {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

function daysBetweenInclusive(start: Date, end: Date): number {
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

/**
 * Deterministic mock analytics for the given range (used when the API is unavailable).
 */
export function buildMockEarningsAnalytics(
  startDate: string,
  endDate: string
): FreelancerEarningsAnalytics {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const now = new Date();

  const allMonths: EarningsMonthlyPoint[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= endMonth) {
    const seed = cursor.getFullYear() * 12 + cursor.getMonth();
    const earnings = 1800 + (seed % 7) * 420 + (seed % 3) * 180;
    const orderCount = 4 + (seed % 5);
    allMonths.push({
      label: formatMonthLabel(cursor),
      monthStart: monthStartStr(cursor),
      earnings,
      orderCount,
    });
    cursor = addMonths(cursor, 1);
  }
  const monthly = allMonths.length > 12 ? allMonths.slice(-12) : allMonths;

  const rangeDays = daysBetweenInclusive(start, end);
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (rangeDays - 1));

  const hash = (s: string): number =>
    s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const currentTotal =
    monthly.reduce((s, m) => s + m.earnings, 0) ||
    3200 + (hash(startDate) % 5000);
  const currentOrders =
    monthly.reduce((s, m) => s + m.orderCount, 0) || 12 + (hash(endDate) % 8);
  const prevTotal = Math.round(currentTotal * (0.75 + (hash(startDate + endDate) % 40) / 100));
  const prevOrders = Math.max(1, currentOrders - 2);

  const avg = (total: number, n: number): string =>
    n > 0 ? (total / n).toFixed(2) : "0.00";

  const byClient: EarningsClientRow[] = [
    { clientId: "c1", clientName: "Northwind Studio", earnings: 4200, orderCount: 6 },
    { clientId: "c2", clientName: "Acme Corp", earnings: 3100, orderCount: 4 },
    { clientId: "c3", clientName: "Blue Oak LLC", earnings: 2750, orderCount: 5 },
    { clientId: "c4", clientName: "Pixel Foundry", earnings: 1890, orderCount: 3 },
    { clientId: "c5", clientName: "Summit Labs", earnings: 1240, orderCount: 2 },
  ];

  const byCategory: EarningsCategoryRow[] = [
    { categoryId: "cat-dev", categoryLabel: "Development", earnings: 6800, orderCount: 9 },
    { categoryId: "cat-design", categoryLabel: "Design", earnings: 3200, orderCount: 5 },
    { categoryId: "cat-consult", categoryLabel: "Consulting", earnings: 2100, orderCount: 4 },
    { categoryId: "cat-other", categoryLabel: "Other", earnings: 980, orderCount: 2 },
  ];

  const monthIdx = now.getMonth();

  return {
    currency: "USD",
    totals: {
      thisMonth: `${2400 + (now.getDate() % 10) * 120}.00`,
      thisYear: `${12800 + monthIdx * 900}.50`,
      allTime: `48250.75`,
    },
    currentPeriod: {
      start: startDate,
      end: endDate,
      totalEarnings: `${currentTotal.toFixed(2)}`,
      orderCount: currentOrders,
      averageOrderValue: avg(currentTotal, currentOrders),
    },
    previousPeriod: {
      start: prevStart.toISOString().slice(0, 10),
      end: prevEnd.toISOString().slice(0, 10),
      totalEarnings: `${prevTotal.toFixed(2)}`,
      orderCount: prevOrders,
      averageOrderValue: avg(prevTotal, prevOrders),
    },
    monthly,
    byClient,
    byCategory,
    monthlyGoal: "5000.00",
  };
}

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
