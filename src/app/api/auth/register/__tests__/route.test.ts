import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";

// Generated per run so no credential-looking literal sits in the repo
const TEST_PASSWORD = `Aa1-${crypto.randomUUID()}`;

describe("POST /api/auth/register", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("API_PROXY_SECRET", "proxy-secret");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { id: "usr_1", email: "new@example.com", type: "BOTH" } }), { status: 201 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockReset();
  });

  const call = (body: Record<string, unknown>) =>
    POST(
      new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": "198.51.100.1" },
        body: JSON.stringify(body),
      }),
    );

  it("forwards the captcha token and the visitor IP to the API", async () => {
    const res = await call({ email: "new@example.com", password: TEST_PASSWORD, username: "newbie", captchaToken: "tok" });

    expect(res.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toMatchObject({ email: "new@example.com", captchaToken: "tok", type: "BOTH" });
    expect(init.headers).toMatchObject({
      "X-OfferHub-Client-IP": "198.51.100.1",
      "X-OfferHub-Proxy-Secret": "proxy-secret",
    });
  });

  it("passes the API's CAPTCHA_FAILED error through unchanged", async () => {
    const apiError = { error: { code: "CAPTCHA_FAILED", message: "We could not verify you are human." } };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(apiError), { status: 400 }));

    const res = await call({ email: "new@example.com", password: TEST_PASSWORD });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(apiError);
  });
});
