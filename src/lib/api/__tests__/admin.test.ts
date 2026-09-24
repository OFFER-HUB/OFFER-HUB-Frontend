import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import {
  buildAdminUsersSearchParams,
  getAdminUsers,
  getAdminUserDetail,
  banUser,
  unbanUser,
  updateAdminUser,
} from "../admin";
import type { AdminUser, AdminUsersQuery } from "@/types/admin.types";

const BASE = "http://localhost:4000/api/v1";
const TOKEN = "test-token";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

function lastCall() {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1) as [string, RequestInit];
}

/** Exactly what GET /admin/users returns per row — no username, no stats. */
const ROW: AdminUser = {
  id: "usr_ZJnWWIxK3HFxDkOVykOfnGYHVUMItwDN",
  externalUserId: "local_buyer_offerhub_local",
  email: "buyer@offerhub.local",
  type: "BUYER",
  status: "ACTIVE",
  emailVerified: false,
  emailVerifiedAt: null,
  avatarUrl: null,
  bio: null,
  professionalTitle: null,
  location: null,
  timezone: null,
  createdAt: "2026-09-11T18:30:08.290Z",
  updatedAt: "2026-09-11T18:34:44.173Z",
};

const DEFAULT_QUERY: AdminUsersQuery = {
  search: "",
  status: "ALL",
  role: "ALL",
  registeredAfter: "",
  registeredBefore: "",
  sort: { field: "createdAt", direction: "desc" },
  page: 1,
  limit: 10,
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("buildAdminUsersSearchParams", () => {
  it("sends only paging + sort when nothing is filtered ('ALL' and empty strings are not params)", () => {
    const params = buildAdminUsersSearchParams(DEFAULT_QUERY);
    expect(params.toString()).toBe("page=1&limit=10&sortBy=createdAt&sortOrder=desc");
  });

  it("maps every UI filter onto the AdminUsersQueryDto names", () => {
    const params = buildAdminUsersSearchParams({
      ...DEFAULT_QUERY,
      search: "  buyer  ",
      status: "SUSPENDED",
      role: "SELLER",
      registeredAfter: "2026-09-01",
      registeredBefore: "2026-09-30",
      sort: { field: "email", direction: "asc" },
      page: 3,
      limit: 25,
    });
    expect(Object.fromEntries(params)).toEqual({
      search: "buyer",
      status: "SUSPENDED",
      role: "SELLER",
      registeredFrom: "2026-09-01",
      registeredTo: "2026-09-30",
      page: "3",
      limit: "25",
      sortBy: "email",
      sortOrder: "asc",
    });
  });
});

describe("getAdminUsers", () => {
  it("GETs /admin/users with the query string and returns rows + pagination meta", async () => {
    const meta = { total: 18, page: 1, limit: 10, totalPages: 2 };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: [ROW], meta })) as unknown as typeof fetch;

    const result = await getAdminUsers(TOKEN, DEFAULT_QUERY);

    const [url, init] = lastCall();
    expect(url).toBe(`${BASE}/admin/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc`);
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual({ users: [ROW], meta });
  });

  it("surfaces the backend error message on a non-2xx", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { code: "INSUFFICIENT_SCOPE", message: "Admin access required" } }, false, 403)) as unknown as typeof fetch;

    await expect(getAdminUsers(TOKEN, DEFAULT_QUERY)).rejects.toThrow("Admin access required");
  });
});

describe("getAdminUserDetail", () => {
  it("GETs /admin/users/:id and unwraps the detail document", async () => {
    const detail = {
      ...ROW,
      skills: [],
      balance: { available: "0.00", reserved: "0.00", currency: "USD" },
      _count: { buyerOrders: 2, sellerOrders: 0, services: 0, applications: 1 },
      stats: { completedOrders: 0, totalEarnings: "0.00", averageRating: null },
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: detail })) as unknown as typeof fetch;

    const result = await getAdminUserDetail(TOKEN, ROW.id);

    expect(lastCall()[0]).toBe(`${BASE}/admin/users/${ROW.id}`);
    expect(result.stats.completedOrders).toBe(0);
    expect(result._count.buyerOrders).toBe(2);
  });
});

describe("mutations", () => {
  it("updateAdminUser PATCHes only AdminUpdateUserDto fields", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: { ...ROW, type: "BOTH" } })) as unknown as typeof fetch;

    const result = await updateAdminUser(TOKEN, ROW.id, { type: "BOTH", professionalTitle: "Designer" });

    const [url, init] = lastCall();
    expect(url).toBe(`${BASE}/admin/users/${ROW.id}`);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ type: "BOTH", professionalTitle: "Designer" });
    expect(result.type).toBe("BOTH");
  });

  it("banUser POSTs /admin/users/:id/ban with the reason — the backend route is POST, not PATCH", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: { ...ROW, status: "SUSPENDED" } })) as unknown as typeof fetch;

    const result = await banUser(TOKEN, ROW.id, { reason: "spam" });

    const [url, init] = lastCall();
    expect(url).toBe(`${BASE}/admin/users/${ROW.id}/ban`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ reason: "spam" });
    expect(result.status).toBe("SUSPENDED");
  });

  it("unbanUser POSTs /admin/users/:id/unban", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: ROW })) as unknown as typeof fetch;

    const result = await unbanUser(TOKEN, ROW.id);

    const [url, init] = lastCall();
    expect(url).toBe(`${BASE}/admin/users/${ROW.id}/unban`);
    expect(init.method).toBe("POST");
    expect(result.status).toBe("ACTIVE");
  });
});
