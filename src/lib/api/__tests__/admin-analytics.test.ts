import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import {
  buildAnalyticsSearchParams,
  exportAnalyticsCsv,
  getAdminAnalytics,
  granularityForRange,
  toAdminAnalyticsData,
} from "../admin-analytics";
import type { PlatformAnalytics } from "@/types/admin-analytics.types";

const BASE = "http://localhost:4000/api/v1";
const TOKEN = "test-token";

/**
 * Captured verbatim from the local API on 2026-09-11:
 * GET /admin/analytics?from=2026-08-12T00:00:00.000Z&to=2026-09-11T23:59:59.999Z&granularity=week
 */
const REAL_PAYLOAD: PlatformAnalytics = {
    "period": {
      "from": "2026-08-12T00:00:00.000Z",
      "to": "2026-09-11T23:59:59.999Z"
    },
    "users": {
      "total": 18,
      "active": 18,
      "newThisPeriod": 14,
      "growthRate": 250
    },
    "orders": {
      "total": 6,
      "completed": 3,
      "inProgress": 1,
      "canceled": 1,
      "totalVolume": "155.00",
      "averageValue": "51.67"
    },
    "disputes": {
      "total": 0,
      "open": 0,
      "resolved": 0,
      "rate": 0
    },
    "withdrawals": {
      "total": 0,
      "totalVolume": "0.00"
    },
    "services": {
      "total": 0,
      "byCategory": {}
    },
    "comparison": {
      "users": {
        "current": 14,
        "previous": 4,
        "changePercent": 250
      },
      "orders": {
        "current": 6,
        "previous": 0,
        "changePercent": 100
      },
      "volume": {
        "current": "155.00",
        "previous": "0.00",
        "changePercent": 100
      }
    },
    "timeSeries": [
      {
        "label": "2026-08-12",
        "orders": 0,
        "newUsers": 2,
        "volume": "0.00"
      },
      {
        "label": "2026-08-19",
        "orders": 0,
        "newUsers": 0,
        "volume": "0.00"
      },
      {
        "label": "2026-08-26",
        "orders": 0,
        "newUsers": 0,
        "volume": "0.00"
      },
      {
        "label": "2026-09-02",
        "orders": 0,
        "newUsers": 0,
        "volume": "0.00"
      },
      {
        "label": "2026-09-09",
        "orders": 6,
        "newUsers": 12,
        "volume": "155.00"
      }
    ]
  };

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body), blob: vi.fn().mockResolvedValue(new Blob(["a,b"])) };
}

function lastCall() {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1) as [string, RequestInit];
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("toAdminAnalyticsData", () => {
  it("builds the stat cards from users/orders/disputes/withdrawals + comparison", () => {
    const { stats } = toAdminAnalyticsData(REAL_PAYLOAD);

    expect(stats).toEqual({
      totalUsers: 18,
      activeUsers: 18,
      newUsers: 14,
      newUsersChangePercent: 250,
      totalOrders: 6,
      completedOrders: 3,
      ordersChangePercent: 100,
      transactionVolume: 155,
      volumeChangePercent: 100,
      averageOrderValue: 51.67,
      openDisputes: 0,
      disputeRate: 0,
      withdrawalsVolume: 0,
    });
  });

  it("turns timeSeries into chart points with numeric volume", () => {
    const { trends } = toAdminAnalyticsData(REAL_PAYLOAD);

    expect(trends).toHaveLength(5);
    expect(trends[4]).toEqual({ label: "2026-09-09", newUsers: 12, orders: 6, volume: 155 });
    expect(trends[0].volume).toBe(0);
  });

  it("handles an empty services.byCategory without dividing by zero", () => {
    expect(toAdminAnalyticsData(REAL_PAYLOAD).categories).toEqual([]);
  });

  it("computes category share of active services, largest first", () => {
    const withServices: PlatformAnalytics = {
      ...REAL_PAYLOAD,
      services: { total: 8, byCategory: { design: 2, development: 5, writing: 1 } },
    };

    expect(toAdminAnalyticsData(withServices).categories).toEqual([
      { category: "development", services: 5, percentage: 62.5 },
      { category: "design", services: 2, percentage: 25 },
      { category: "writing", services: 1, percentage: 12.5 },
    ]);
  });

  it("keeps the period the backend resolved", () => {
    expect(toAdminAnalyticsData(REAL_PAYLOAD).period).toEqual(REAL_PAYLOAD.period);
  });

  it("does not let a malformed decimal string become NaN", () => {
    const broken: PlatformAnalytics = { ...REAL_PAYLOAD, orders: { ...REAL_PAYLOAD.orders, totalVolume: "n/a" } };
    expect(toAdminAnalyticsData(broken).stats.transactionVolume).toBe(0);
  });
});

describe("granularityForRange", () => {
  it("buckets by day up to a month, week up to half a year, month beyond", () => {
    expect(granularityForRange({ start: "2026-09-04", end: "2026-09-11" })).toBe("day");
    expect(granularityForRange({ start: "2026-08-12", end: "2026-09-11" })).toBe("day");
    expect(granularityForRange({ start: "2026-06-13", end: "2026-09-11" })).toBe("week");
    expect(granularityForRange({ start: "2025-09-11", end: "2026-09-11" })).toBe("month");
  });
});

describe("buildAnalyticsSearchParams", () => {
  it("sends from/to (the names AnalyticsQueryDto reads) as full-day bounds so the end date is inclusive", () => {
    const params = buildAnalyticsSearchParams({ start: "2026-08-12", end: "2026-09-11" });

    expect(Object.fromEntries(params)).toEqual({
      from: "2026-08-12T00:00:00.000Z",
      to: "2026-09-11T23:59:59.999Z",
      granularity: "day",
    });
    expect(params.has("start")).toBe(false);
    expect(params.has("end")).toBe(false);
  });
});

describe("getAdminAnalytics", () => {
  it("GETs /admin/analytics with the range and returns the mapped view model", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: REAL_PAYLOAD })) as unknown as typeof fetch;

    const result = await getAdminAnalytics(TOKEN, { start: "2026-08-12", end: "2026-09-11" });

    const [url, init] = lastCall();
    expect(url).toBe(`${BASE}/admin/analytics?from=2026-08-12T00%3A00%3A00.000Z&to=2026-09-11T23%3A59%3A59.999Z&granularity=day`);
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result.stats.totalUsers).toBe(18);
    expect(result.trends).toHaveLength(5);
  });

  it("surfaces the backend error message on a non-2xx", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { code: "INSUFFICIENT_SCOPE", message: "Admin access required" } }, false, 403)) as unknown as typeof fetch;

    await expect(getAdminAnalytics(TOKEN, { start: "2026-08-12", end: "2026-09-11" })).rejects.toThrow("Admin access required");
  });
});

describe("exportAnalyticsCsv", () => {
  it("GETs /admin/analytics/export for the same range and returns the blob", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(null)) as unknown as typeof fetch;

    const blob = await exportAnalyticsCsv(TOKEN, { start: "2026-08-12", end: "2026-09-11" });

    const [url] = lastCall();
    expect(url.startsWith(`${BASE}/admin/analytics/export?from=`)).toBe(true);
    expect(url).not.toContain("format=");
    expect(blob).toBeInstanceOf(Blob);
  });
});
