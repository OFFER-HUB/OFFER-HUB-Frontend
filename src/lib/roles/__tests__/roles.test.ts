import { describe, expect, it } from "vitest";
import { canUseMode, dashboardForMode, initialModeForType } from "../roles";

describe("canUseMode", () => {
  it("keeps clients out of freelancer pages and freelancers out of client pages", () => {
    expect(canUseMode("BUYER", "client")).toBe(true);
    expect(canUseMode("BUYER", "freelancer")).toBe(false);
    expect(canUseMode("SELLER", "freelancer")).toBe(true);
    expect(canUseMode("SELLER", "client")).toBe(false);
  });

  it("lets BOTH accounts and accounts without a type use both areas", () => {
    expect(canUseMode("BOTH", "client")).toBe(true);
    expect(canUseMode("BOTH", "freelancer")).toBe(true);
    expect(canUseMode(undefined, "client")).toBe(true);
    expect(canUseMode(undefined, "freelancer")).toBe(true);
  });
});

describe("initialModeForType", () => {
  it("starts clients in client mode and everyone else in freelancer mode", () => {
    expect(initialModeForType("BUYER")).toBe("client");
    expect(initialModeForType("SELLER")).toBe("freelancer");
    expect(initialModeForType("BOTH")).toBe("freelancer");
  });
});

describe("dashboardForMode", () => {
  it("maps each mode to its dashboard", () => {
    expect(dashboardForMode("client")).toBe("/app/client/dashboard");
    expect(dashboardForMode("freelancer")).toBe("/app/freelancer/dashboard");
  });
});
