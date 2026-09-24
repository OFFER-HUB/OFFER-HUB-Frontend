import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import {
  assignDispute,
  buildAdminDisputesSearchParams,
  getAdminDispute,
  getAdminDisputes,
  resolveDispute,
  unwrapDisputesPage,
} from "../admin-disputes";
import type { AdminDispute } from "@/types/admin.types";

const BASE = "http://localhost:4000/api/v1";
const TOKEN = "test-token";

/** Shape of one GET /disputes item as the backend returns it (DisputeWithRelations). */
const DISPUTE: AdminDispute = {
  id: "dsp_qa0open000000000000000000",
  orderId: "ord_qadsp0open0000000000000000",
  openedBy: "BUYER",
  reason: "QUALITY_ISSUE",
  evidence: ["https://example.com/evidence/logo-v1.png"],
  status: "OPEN",
  resolutionDecision: null,
  decisionNote: null,
  createdAt: "2026-09-11T20:00:00.000Z",
  updatedAt: "2026-09-11T20:00:00.000Z",
  order: {
    id: "ord_qadsp0open0000000000000000",
    title: "Logo redesign",
    description: null,
    amount: "220.00",
    currency: "USD",
    status: "DISPUTED",
    buyerId: "usr_buyer",
    sellerId: "usr_seller",
    buyer: { id: "usr_buyer", email: "buyer@offerhub.local" },
    seller: { id: "usr_seller", email: "seller@example.com" },
    service: null,
    escrow: null,
    milestones: [],
    createdAt: "2026-09-11T19:00:00.000Z",
  },
};

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}
function lastCall() {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1) as [string, RequestInit];
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("unwrapDisputesPage", () => {
  it("reads the doubly-wrapped { data: { data, hasMore } } the controller + interceptor produce", () => {
    expect(unwrapDisputesPage({ data: { data: [DISPUTE], hasMore: true }, meta: {} })).toEqual({ disputes: [DISPUTE], hasMore: true });
  });

  it("tolerates a bare array and an empty body", () => {
    expect(unwrapDisputesPage({ data: [DISPUTE] })).toEqual({ disputes: [DISPUTE], hasMore: false });
    expect(unwrapDisputesPage(null)).toEqual({ disputes: [], hasMore: false });
  });
});

describe("buildAdminDisputesSearchParams", () => {
  it("omits ALL filters and always sends paging", () => {
    expect(buildAdminDisputesSearchParams({ status: "ALL", openedBy: "ALL", page: 2, limit: 10 }).toString()).toBe("page=2&limit=10");
    expect(Object.fromEntries(buildAdminDisputesSearchParams({ status: "UNDER_REVIEW", openedBy: "SELLER", page: 1, limit: 10 }))).toEqual({
      status: "UNDER_REVIEW", openedBy: "SELLER", page: "1", limit: "10",
    });
  });
});

describe("getAdminDisputes / getAdminDispute", () => {
  it("GETs /disputes with the query and returns the page", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: { data: [DISPUTE], hasMore: false } })) as unknown as typeof fetch;
    const page = await getAdminDisputes(TOKEN, { status: "OPEN", openedBy: "ALL", page: 1, limit: 10 });
    expect(lastCall()[0]).toBe(`${BASE}/disputes?status=OPEN&page=1&limit=10`);
    expect(page.disputes[0].order.title).toBe("Logo redesign");
  });

  it("GETs /disputes/:id and unwraps one level", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: DISPUTE })) as unknown as typeof fetch;
    const d = await getAdminDispute(TOKEN, DISPUTE.id);
    expect(lastCall()[0]).toBe(`${BASE}/disputes/${DISPUTE.id}`);
    expect(d.status).toBe("OPEN");
  });

  it("surfaces the backend error message", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ error: { code: "DISPUTE_NOT_FOUND", message: "Dispute dsp_x not found" } }, false, 404)) as unknown as typeof fetch;
    await expect(getAdminDispute(TOKEN, "dsp_x")).rejects.toThrow("Dispute dsp_x not found");
  });
});

describe("admin transitions", () => {
  it("assignDispute POSTs /disputes/:id/assign with the reviewing admin id", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: { ...DISPUTE, status: "UNDER_REVIEW" } })) as unknown as typeof fetch;
    const d = await assignDispute(TOKEN, DISPUTE.id, "usr_admin");
    const [url, init] = lastCall();
    expect(url).toBe(`${BASE}/disputes/${DISPUTE.id}/assign`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ assignedTo: "usr_admin" });
    expect(d.status).toBe("UNDER_REVIEW");
  });

  it("resolveDispute POSTs the ResolveDisputeDto as-is", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ data: { ...DISPUTE, status: "RESOLVED", resolutionDecision: "SPLIT" } })) as unknown as typeof fetch;
    await resolveDispute(TOKEN, DISPUTE.id, { decision: "SPLIT", releaseAmount: "120.00", refundAmount: "100.00", note: "half done" });
    const [url, init] = lastCall();
    expect(url).toBe(`${BASE}/disputes/${DISPUTE.id}/resolve`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ decision: "SPLIT", releaseAmount: "120.00", refundAmount: "100.00", note: "half done" });
  });
});
