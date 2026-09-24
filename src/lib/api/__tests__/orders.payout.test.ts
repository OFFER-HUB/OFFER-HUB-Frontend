import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import { getPayoutStatus, type PayoutApiError } from "../orders";

const BASE = "http://localhost:4000/api/v1";
const TOKEN = "test-token";
const ORDER_ID = "order_abc123";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

const SAMPLE_PAYOUT = {
  id: "pay_1",
  userId: "usr_1",
  orderId: ORDER_ID,
  bankAccountId: "ba_1",
  blindpayPayoutId: null,
  corridor: "MX/SPEI_BITSO",
  status: "PENDING",
  usdcAmount: "100.00",
  fiatAmount: null,
  fiatCurrency: "MXN",
  exchangeRate: null,
  failureReason: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("getPayoutStatus", () => {
  it("fetches the payout for an order with the auth header", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ data: SAMPLE_PAYOUT })
    );

    const result = await getPayoutStatus(TOKEN, ORDER_ID);

    expect(fetch).toHaveBeenCalledWith(`${BASE}/orders/${ORDER_ID}/payout`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    expect(result).toEqual(SAMPLE_PAYOUT);
  });

  it("throws a PayoutApiError carrying the HTTP status on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: { message: "No payout found for order order_abc123" } }, false, 404)
    );

    const error: PayoutApiError = await getPayoutStatus(TOKEN, ORDER_ID).catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(404);
    expect(error.message).toBe("No payout found for order order_abc123");
  });

  it("falls back to a generic message when the error body has none", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({}, false, 500)
    );

    const error: PayoutApiError = await getPayoutStatus(TOKEN, ORDER_ID).catch((e) => e);

    expect(error.message).toBe("Failed to fetch payout status");
    expect(error.status).toBe(500);
  });
});
