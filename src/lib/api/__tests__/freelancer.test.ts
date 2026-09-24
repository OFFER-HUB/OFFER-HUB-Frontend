import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import { getDashboardStats } from "../freelancer";

const BASE = "http://localhost:4000/api/v1";
const TOKEN = "test-token";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

const DASHBOARD_STATS_BODY = {
  data: {
    stats: {
      activeApplications: 3,
      ordersInProgress: 2,
      earningsThisMonth: "500.00",
      averageRating: 4.5,
    },
  },
};

const EARNINGS_ANALYTICS_BODY = {
  data: {
    currency: "USD",
    totals: { thisMonth: "780.00", thisYear: "5000.00", allTime: "12000.00" },
    currentPeriod: { start: "2026-08-01", end: "2026-08-21", totalEarnings: "780.00", orderCount: 4, averageOrderValue: "195.00" },
    previousPeriod: { start: "2026-07-01", end: "2026-07-21", totalEarnings: "600.00", orderCount: 3, averageOrderValue: "200.00" },
    monthly: [],
    byClient: [],
    byCategory: [],
  },
};

describe("getDashboardStats", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("never requests a /analytics/* route", async () => {
    global.fetch = vi.fn((url: unknown) => {
      const href = String(url);
      if (href.includes("/freelancer/dashboard/stats")) return Promise.resolve(jsonResponse(DASHBOARD_STATS_BODY));
      if (href.includes("/freelancer/earnings/analytics")) return Promise.resolve(jsonResponse(EARNINGS_ANALYTICS_BODY));
      return Promise.reject(new Error(`Unexpected fetch to ${href}`));
    }) as unknown as typeof fetch;

    await getDashboardStats(TOKEN);

    const requestedUrls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map((call) => String(call[0]));
    expect(requestedUrls.some((url) => url.includes("/analytics/"))).toBe(false);
    expect(requestedUrls).toEqual(
      expect.arrayContaining([
        `${BASE}/freelancer/dashboard/stats`,
        expect.stringContaining(`${BASE}/freelancer/earnings/analytics?`),
      ]),
    );
  });

  it("uses the working earnings endpoint for totalEarnings and earningsTrend", async () => {
    global.fetch = vi.fn((url: unknown) => {
      const href = String(url);
      if (href.includes("/freelancer/dashboard/stats")) return Promise.resolve(jsonResponse(DASHBOARD_STATS_BODY));
      if (href.includes("/freelancer/earnings/analytics")) return Promise.resolve(jsonResponse(EARNINGS_ANALYTICS_BODY));
      return Promise.reject(new Error(`Unexpected fetch to ${href}`));
    }) as unknown as typeof fetch;

    const result = await getDashboardStats(TOKEN);

    expect(result.totalEarnings).toBe("$780.00");
    // (780 - 600) / 600 * 100 = 30
    expect(result.earningsTrend).toBeCloseTo(30, 5);
    expect(result.activeApplications).toBe(3);
    expect(result.activeOrders).toBe(2);
    expect(result.rating).toBe(4.5);
  });

  it("falls back to the dashboard/stats figures when earnings analytics fails", async () => {
    global.fetch = vi.fn((url: unknown) => {
      const href = String(url);
      if (href.includes("/freelancer/dashboard/stats")) return Promise.resolve(jsonResponse(DASHBOARD_STATS_BODY));
      if (href.includes("/freelancer/earnings/analytics")) return Promise.resolve(jsonResponse({ error: { message: "boom" } }, false, 500));
      return Promise.reject(new Error(`Unexpected fetch to ${href}`));
    }) as unknown as typeof fetch;

    const result = await getDashboardStats(TOKEN);

    expect(result.totalEarnings).toBe("$500.00");
    expect(result.earningsTrend).toBeNull();
  });

  it("throws only when both the dashboard and earnings requests fail", async () => {
    global.fetch = vi.fn((url: unknown) => {
      const href = String(url);
      if (href.includes("/freelancer/dashboard/stats")) return Promise.resolve(jsonResponse({ error: {} }, false, 500));
      if (href.includes("/freelancer/earnings/analytics")) return Promise.resolve(jsonResponse({ error: {} }, false, 500));
      return Promise.reject(new Error(`Unexpected fetch to ${href}`));
    }) as unknown as typeof fetch;

    await expect(getDashboardStats(TOKEN)).rejects.toThrow("Failed to fetch dashboard stats");
  });
});
