import { API_URL } from "@/config/api";
import { getFreelancerEarningsAnalytics } from "@/lib/api/earnings";
import type { DashboardStats } from "@/types/freelancer-dashboard.types";

const API_BASE_URL = API_URL;

function formatCurrencyValue(value: unknown): string {
  if (typeof value === "string" && value.includes("$")) return value;
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return `$${safe.toFixed(2)}`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Month-to-date range: the 1st of the current month through today. */
function currentMonthToDateRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startDate: formatDate(start), endDate: formatDate(now) };
}

function computeChangePercent(current: string, previous: string): number | null {
  const currentValue = Number.parseFloat(current);
  const previousValue = Number.parseFloat(previous);
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue) || previousValue === 0) {
    return null;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
}

export interface FreelancerStats {
  activeServices: number;
  totalEarnings: string;
  stellarBalance: string;
  balanceSynced: boolean;
  pendingProposals: number;
  unreadMessages: number;
}

export interface FreelancerActivity {
  id: string;
  type: 'order_created' | 'order_completed' | 'payment_received' | 'withdrawal_completed' | 'topup_completed';
  title: string;
  description: string;
  createdAt: string;
  time: string;
}

export async function getFreelancerStats(token: string): Promise<FreelancerStats> {
  const response = await fetch(`${API_BASE_URL}/freelancer/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch freelancer stats');
  }

  const data = await response.json();
  return data.data;
}

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const [dashboardRes, earningsRes] = await Promise.allSettled([
    fetch(`${API_BASE_URL}/freelancer/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }),
    getFreelancerEarningsAnalytics(token, currentMonthToDateRange()),
  ]);

  let dashboardData: { stats: Record<string, unknown>; comparison?: Record<string, unknown> } | null = null;
  if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
    const body = await dashboardRes.value.json();
    dashboardData = body.data;
  }

  if (!dashboardData && earningsRes.status !== "fulfilled") {
    throw new Error('Failed to fetch dashboard stats');
  }

  const stats = dashboardData?.stats ?? {};
  const comparison = dashboardData?.comparison as { earnings?: { changePercent?: number | null } } | undefined;

  const earnings = earningsRes.status === "fulfilled" ? earningsRes.value : null;
  const earningsTrend = earnings
    ? computeChangePercent(earnings.currentPeriod.totalEarnings, earnings.previousPeriod.totalEarnings)
    : (comparison?.earnings?.changePercent ?? null);

  return {
    activeApplications: Number(stats.activeApplications ?? 0),
    activeOrders: Number(stats.ordersInProgress ?? 0),
    totalEarnings: formatCurrencyValue(
      earnings?.totals.thisMonth ?? String(stats.earningsThisMonth ?? "0.00")
    ),
    rating: stats.averageRating !== null && stats.averageRating !== undefined ? parseFloat(String(stats.averageRating)) : null,
    ratingCount: 0,
    activeApplicationsTrend: null,
    activeOrdersTrend: null,
    earningsTrend,
    ratingTrend: null,
  };
}

export async function getFreelancerActivities(token: string): Promise<FreelancerActivity[]> {
  const response = await fetch(`${API_BASE_URL}/freelancer/activities`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch freelancer activities');
  }

  const data = await response.json();
  return data.data;
}
