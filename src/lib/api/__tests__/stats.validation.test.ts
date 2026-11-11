import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "http://localhost:4000/api/v1" }));

import { getPublicValidationResults } from "../stats";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) };
}

describe("getPublicValidationResults", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("reads the public GET /validation/runs endpoint and unwraps { data, meta }", async () => {
    const runs = [{ id: "vr_1" }];
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: runs, meta: { total: 7 } }) as unknown as Response);

    await expect(getPublicValidationResults()).resolves.toEqual({ runs, total: 7 });
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("http://localhost:4000/api/v1/validation/runs?limit=20");
    expect(init).toMatchObject({ method: "GET", cache: "no-store" });
    expect((init as RequestInit).headers).not.toHaveProperty("Authorization");
  });

  it("surfaces the API's error message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ error: { code: "VALIDATION_ERROR", message: "limit must not be greater than 100" } }, false, 400) as unknown as Response
    );
    await expect(getPublicValidationResults(500)).rejects.toThrow("limit must not be greater than 100");
  });

  it("rejects a response without a runs array", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: null }) as unknown as Response);
    await expect(getPublicValidationResults()).rejects.toThrow("unavailable");
  });
});
