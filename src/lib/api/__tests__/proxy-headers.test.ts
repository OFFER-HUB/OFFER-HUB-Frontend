import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIpFrom, visitorHeaders } from "@/lib/api/proxy-headers";

const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

describe("clientIpFrom", () => {
  it("prefers x-real-ip", () => {
    expect(clientIpFrom(req({ "x-real-ip": "198.51.100.1", "x-forwarded-for": "203.0.113.9" }))).toBe("198.51.100.1");
  });

  it("falls back to the first x-forwarded-for entry", () => {
    expect(clientIpFrom(req({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe("198.51.100.2");
  });

  it("returns null without either header", () => {
    expect(clientIpFrom(req({}))).toBeNull();
  });
});

describe("visitorHeaders", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends the visitor IP with the proxy secret", () => {
    vi.stubEnv("API_PROXY_SECRET", "proxy-secret");
    expect(visitorHeaders(req({ "x-real-ip": "198.51.100.1" }))).toEqual({
      "X-OfferHub-Client-IP": "198.51.100.1",
      "X-OfferHub-Proxy-Secret": "proxy-secret",
    });
  });

  it("sends nothing without the secret", () => {
    vi.stubEnv("API_PROXY_SECRET", "");
    expect(visitorHeaders(req({ "x-real-ip": "198.51.100.1" }))).toEqual({});
  });

  it("sends nothing when the visitor IP is unknown", () => {
    vi.stubEnv("API_PROXY_SECRET", "proxy-secret");
    expect(visitorHeaders(req({}))).toEqual({});
  });
});
