import { afterEach, describe, expect, it, vi } from "vitest";
import { ResetPasswordError, resetPassword } from "../password-reset";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resetPassword", () => {
  it("posts the token and new password to /auth/reset-password and returns the message", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse(201, { data: { message: "Password reset successfully." } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(resetPassword("tok", "NewPassw0rd")).resolves.toEqual({
      message: "Password reset successfully.",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/auth\/reset-password$/);
    expect(url).not.toContain("password-reset");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ token: "tok", newPassword: "NewPassw0rd" });
  });

  it("reports an expired token as invalid-token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(400, { message: "Invalid or expired reset token" })),
    );

    await expect(resetPassword("tok", "NewPassw0rd")).rejects.toMatchObject({
      name: "ResetPasswordError",
      kind: "invalid-token",
    });
  });

  it("reports an already-used token as invalid-token", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(jsonResponse(400, { error: { message: "Reset token already used" } })),
    );

    const error = await resetPassword("tok", "NewPassw0rd").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ResetPasswordError);
    expect((error as ResetPasswordError).kind).toBe("invalid-token");
  });

  it("surfaces password validation messages without treating the link as dead", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(422, { message: "Password is too weak" })),
    );

    await expect(resetPassword("tok", "weak")).rejects.toMatchObject({
      kind: "validation",
      message: "Password is too weak",
    });
  });

  it("treats a server error or missing route as a generic failure, not an expired link", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(404, { message: "Cannot POST" })));
    await expect(resetPassword("tok", "NewPassw0rd")).rejects.toMatchObject({ kind: "unavailable" });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("oops", { status: 500 })));
    await expect(resetPassword("tok", "NewPassw0rd")).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("treats a network failure as a generic failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(resetPassword("tok", "NewPassw0rd")).rejects.toMatchObject({ kind: "unavailable" });
  });
});
