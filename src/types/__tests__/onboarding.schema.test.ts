import { describe, expect, it } from "vitest";
import { onboardingSchema } from "@/types/onboarding.types";

describe("onboardingSchema", () => {
  it("accepts the minimum required marketplace profile", () => {
    const result = onboardingSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada",
      type: "BUYER",
      bio: "",
      country: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing first name", () => {
    const result = onboardingSchema.safeParse({
      firstName: "  ",
      lastName: "Lovelace",
      username: "ada",
      type: "SELLER",
      bio: "",
      country: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a username shorter than 3 characters", () => {
    const result = onboardingSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ad",
      type: "BOTH",
      bio: "",
      country: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a bio over 500 characters", () => {
    const result = onboardingSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada",
      type: "BOTH",
      bio: "x".repeat(501),
      country: "UK",
    });

    expect(result.success).toBe(false);
  });
});
