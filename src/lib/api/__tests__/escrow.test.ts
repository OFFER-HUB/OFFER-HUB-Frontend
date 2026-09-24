import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import {
  prepareEscrowCreate,
  prepareEscrowFund,
  prepareReleaseStep,
  prepareRefundStep,
  prepareDisputeStep,
  submitEscrowXdr,
} from "../escrow";

const BASE = "http://localhost:4000/api/v1";
const TOKEN = "test-token";
const ORDER_ID = "ord_abc123";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

function lastCall() {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.at(-1);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("prepareEscrowCreate", () => {
  it("POSTs to /orders/:id/escrow/prepare and returns the unwrapped result", async () => {
    const body = { data: { unsignedXdr: "AAAA", operation: "create", expiresAt: 123, orderId: ORDER_ID } };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await prepareEscrowCreate(TOKEN, ORDER_ID);

    expect(lastCall()?.[0]).toBe(`${BASE}/orders/${ORDER_ID}/escrow/prepare`);
    expect(lastCall()?.[1]).toMatchObject({
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    expect(result).toEqual(body.data);
  });

  it("throws a typed EscrowApiError carrying the backend code and status", async () => {
    const body = { error: { code: "INVALID_STATE", message: "Cannot prepare create escrow order ord_abc123 in state IN_PROGRESS" } };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body, false, 400)) as unknown as typeof fetch;

    await expect(prepareEscrowCreate(TOKEN, ORDER_ID)).rejects.toMatchObject({
      message: body.error.message,
      code: "INVALID_STATE",
      status: 400,
    });
  });

  it("falls back to a generic message when the error body has no error.message", async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({}, false, 500)) as unknown as typeof fetch;

    await expect(prepareEscrowCreate(TOKEN, ORDER_ID)).rejects.toMatchObject({
      message: "Failed to prepare escrow creation",
      status: 500,
    });
  });
});

describe("prepareEscrowFund", () => {
  it("POSTs to /orders/:id/escrow/fund/prepare", async () => {
    const body = { data: { unsignedXdr: "BBBB", operation: "fund", expiresAt: 456, orderId: ORDER_ID } };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await prepareEscrowFund(TOKEN, ORDER_ID);

    expect(lastCall()?.[0]).toBe(`${BASE}/orders/${ORDER_ID}/escrow/fund/prepare`);
    expect(result).toEqual(body.data);
  });
});

describe("step-wise prepare endpoints", () => {
  it("prepareReleaseStep POSTs to /orders/:orderId/resolution/release/prepare", async () => {
    const body = {
      data: { orderId: ORDER_ID, operation: "release", step: "complete_milestone", signer: "seller", unsignedXdr: "CCCC", expiresAt: 789 },
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await prepareReleaseStep(TOKEN, ORDER_ID);

    expect(lastCall()?.[0]).toBe(`${BASE}/orders/${ORDER_ID}/resolution/release/prepare`);
    expect(result).toEqual(body.data);
  });

  it("prepareRefundStep POSTs to /orders/:orderId/resolution/refund/prepare", async () => {
    const body = {
      data: { orderId: ORDER_ID, operation: "refund", step: "dispute", signer: "buyer", unsignedXdr: "DDDD", expiresAt: 789 },
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await prepareRefundStep(TOKEN, ORDER_ID);

    expect(lastCall()?.[0]).toBe(`${BASE}/orders/${ORDER_ID}/resolution/refund/prepare`);
    expect(result).toEqual(body.data);
  });

  it("prepareDisputeStep POSTs to /orders/:orderId/resolution/dispute/prepare", async () => {
    const body = {
      data: { orderId: ORDER_ID, operation: "dispute", step: "dispute", signer: "buyer", unsignedXdr: "EEEE", expiresAt: 789 },
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await prepareDisputeStep(TOKEN, ORDER_ID);

    expect(lastCall()?.[0]).toBe(`${BASE}/orders/${ORDER_ID}/resolution/dispute/prepare`);
    expect(result).toEqual(body.data);
  });

  it("surfaces step: null as data, not an error, when a sequence has finished", async () => {
    const body = {
      data: { orderId: ORDER_ID, operation: "release", step: null, signer: null, unsignedXdr: null, expiresAt: null },
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;

    const result = await prepareReleaseStep(TOKEN, ORDER_ID);

    expect(result.step).toBeNull();
    expect(result.unsignedXdr).toBeNull();
  });
});

describe("submitEscrowXdr", () => {
  it("POSTs signedXdr + operation with the Idempotency-Key header", async () => {
    const body = { data: { transactionHash: "tx_hash_123", order: { id: ORDER_ID, status: "IN_PROGRESS" } } };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body)) as unknown as typeof fetch;
    const idempotencyKey = "11111111-1111-1111-1111-111111111111";

    const result = await submitEscrowXdr(TOKEN, ORDER_ID, "SIGNED_XDR_BLOB", "release", idempotencyKey);

    expect(lastCall()?.[0]).toBe(`${BASE}/orders/${ORDER_ID}/escrow/submit`);
    const init = lastCall()?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe(idempotencyKey);
    expect(JSON.parse(init.body as string)).toEqual({ signedXdr: "SIGNED_XDR_BLOB", operation: "release" });
    expect(result).toEqual(body.data);
  });

  it("accepts every documented operation, including fund", async () => {
    const operations = ["create", "fund", "release", "refund", "dispute"] as const;
    global.fetch = vi.fn().mockResolvedValue(
      jsonResponse({ data: { transactionHash: "tx", order: { id: ORDER_ID } } })
    ) as unknown as typeof fetch;

    for (const operation of operations) {
      await submitEscrowXdr(TOKEN, ORDER_ID, "XDR", operation, "key");
    }

    expect(fetch).toHaveBeenCalledTimes(operations.length);
  });

  it("throws a typed EscrowApiError when the signed XDR is rejected", async () => {
    const body = { error: { code: "INVALID_REQUEST", message: "signedXdr is not a valid Stellar transaction envelope" } };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(body, false, 400)) as unknown as typeof fetch;

    await expect(submitEscrowXdr(TOKEN, ORDER_ID, "not-xdr", "create", "key")).rejects.toMatchObject({
      code: "INVALID_REQUEST",
      status: 400,
    });
  });
});
