import { describe, expect, it } from "vitest";
import { isNewUser } from "@/lib/auth/is-new-user";

describe("isNewUser", () => {
  it("returns true when firstName is null", () => {
    expect(isNewUser({ firstName: null })).toBe(true);
  });

  it("returns true when firstName is undefined", () => {
    expect(isNewUser({})).toBe(true);
  });

  it("returns false when firstName is a non-empty string", () => {
    expect(isNewUser({ firstName: "Ada" })).toBe(false);
  });

  it("returns false for an admin even with no firstName — admins don't go through marketplace onboarding", () => {
    expect(isNewUser({ firstName: null, isAdmin: true })).toBe(false);
  });

  it("still applies the marketplace onboarding check to a non-admin", () => {
    expect(isNewUser({ firstName: null, isAdmin: false })).toBe(true);
  });
});
