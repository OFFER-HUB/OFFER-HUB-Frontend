import { describe, expect, it, vi } from "vitest";

vi.mock("@/config/api", () => ({ API_URL: "https://api.example.com/api/v1" }));
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: { getState: () => ({ token: null }) },
}));

import { buildUrl } from "../http-client";

describe("buildUrl", () => {
  it("keeps the /api/v1 base path when the path starts with a slash", () => {
    expect(buildUrl("/notifications")).toBe("https://api.example.com/api/v1/notifications");
  });

  it("keeps the base path when the path has no leading slash", () => {
    expect(buildUrl("notifications")).toBe("https://api.example.com/api/v1/notifications");
  });

  it("appends query params and skips undefined values", () => {
    expect(buildUrl("/notifications", { limit: "15", cursor: undefined })).toBe(
      "https://api.example.com/api/v1/notifications?limit=15",
    );
  });
});
