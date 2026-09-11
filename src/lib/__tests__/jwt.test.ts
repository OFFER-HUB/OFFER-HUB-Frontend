import { describe, it, expect } from "vitest";
import { decodeSessionToken, hasAdminClaim } from "@/lib/jwt";

/** Unsigned-but-well-formed JWT in the base64url alphabet the backend emits. */
function makeJwt(payload: Record<string, unknown>): string {
  const b64u = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64u({ alg: "HS256", typ: "JWT" })}.${b64u(payload)}.signature`;
}

describe("decodeSessionToken", () => {
  it("decodes the backend payload shape, including base64url-only characters", () => {
    // `>>??` forces '+' and '/' into standard base64, i.e. '-' and '_' in base64url,
    // and the payload length is not a multiple of four so padding must be restored.
    const token = makeJwt({
      sub: "usr_V1StGXR8_Z5jdHi6B-myT",
      email: "a@b.co",
      type: "BOTH",
      sessionId: "ses_x",
      walletAddress: "GABC>>??",
      isAdmin: true,
    });

    expect(decodeSessionToken(token)).toMatchObject({
      sub: "usr_V1StGXR8_Z5jdHi6B-myT",
      walletAddress: "GABC>>??",
      isAdmin: true,
    });
  });

  it("returns null for anything that is not a three-segment JWT", () => {
    expect(decodeSessionToken("")).toBeNull();
    expect(decodeSessionToken("not.a.jwt")).toBeNull();
    expect(decodeSessionToken("a.b")).toBeNull();
    expect(decodeSessionToken("jwt_test_token")).toBeNull();
  });

  it("returns null when the payload has no string `sub`", () => {
    expect(decodeSessionToken(makeJwt({ isAdmin: true }))).toBeNull();
  });
});

describe("hasAdminClaim", () => {
  it("is true only for an explicit boolean isAdmin: true", () => {
    expect(hasAdminClaim(makeJwt({ sub: "usr_1", isAdmin: true }))).toBe(true);
    expect(hasAdminClaim(makeJwt({ sub: "usr_2", isAdmin: false }))).toBe(false);
    // A pre-admin-role token has no claim at all.
    expect(hasAdminClaim(makeJwt({ sub: "usr_3", type: "SELLER" }))).toBe(false);
    // Truthy non-booleans must not pass.
    expect(hasAdminClaim(makeJwt({ sub: "usr_4", isAdmin: "true" }))).toBe(false);
    expect(hasAdminClaim(makeJwt({ sub: "usr_5", isAdmin: 1 }))).toBe(false);
  });

  it("is false for a missing or malformed token", () => {
    expect(hasAdminClaim(null)).toBe(false);
    expect(hasAdminClaim("garbage")).toBe(false);
  });
});
