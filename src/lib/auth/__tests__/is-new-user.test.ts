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
});
