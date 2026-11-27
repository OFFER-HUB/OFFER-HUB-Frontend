import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import { getOrderAttachmentUrl, type OrderAttachmentUrlError } from "../orders";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("getOrderAttachmentUrl", () => {
  it("asks for a fresh signed URL with the auth header and no caching", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ data: { url: "https://signed", expiresAt: "2026-11-26T10:10:00.000Z" } })
    );

    const result = await getOrderAttachmentUrl("tok", "ord_1", "att_1");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/v1/orders/ord_1/attachments/att_1/url",
      { headers: { Authorization: "Bearer tok" }, cache: "no-store" }
    );
    expect(result).toEqual({ url: "https://signed", expiresAt: "2026-11-26T10:10:00.000Z" });
  });

  it("throws with the API code so the UI can show the final file as locked", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: { code: "FINAL_LOCKED", message: "Locked" } }, false, 403)
    );

    const error = (await getOrderAttachmentUrl("tok", "ord_1", "att_1").catch(
      (e: unknown) => e
    )) as OrderAttachmentUrlError;

    expect(error.code).toBe("FINAL_LOCKED");
    expect(error.status).toBe(403);
  });
});
