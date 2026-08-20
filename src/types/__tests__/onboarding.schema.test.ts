import { describe, expect, it } from "vitest";
import { onboardingSchema, onboardingStep1Schema, onboardingStep2Schema } from "@/types/onboarding.types";

describe("onboardingStep1Schema", () => {
  const valid = {
    firstName: "Ada",
    lastName: "Lovelace",
    username: "ada_dev",
    type: "BUYER" as const,
    country: "United Kingdom",
    phone: "+44 20 7946 0958",
  };

  it("accepts a complete step 1 profile", () => {
    expect(onboardingStep1Schema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing first name", () => {
    expect(onboardingStep1Schema.safeParse({ ...valid, firstName: "  " }).success).toBe(false);
  });

  it("rejects a username shorter than 3 characters", () => {
    expect(onboardingStep1Schema.safeParse({ ...valid, username: "ad" }).success).toBe(false);
  });

  it("rejects a username with invalid characters", () => {
    expect(onboardingStep1Schema.safeParse({ ...valid, username: "Ada Lovelace" }).success).toBe(false);
  });

  it("rejects a missing country", () => {
    expect(onboardingStep1Schema.safeParse({ ...valid, country: "" }).success).toBe(false);
  });

  it("rejects a phone shorter than 7 characters", () => {
    expect(onboardingStep1Schema.safeParse({ ...valid, phone: "123" }).success).toBe(false);
  });
});

describe("onboardingStep2Schema", () => {
  const valid = {
    professionalTitle: "Full Stack Developer",
    bio: "I build web apps with React and Node.js for startups.",
  };

  it("accepts a complete step 2 profile", () => {
    expect(onboardingStep2Schema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty professional title", () => {
    expect(onboardingStep2Schema.safeParse({ ...valid, professionalTitle: "" }).success).toBe(false);
  });

  it("rejects a bio shorter than 20 characters", () => {
    expect(onboardingStep2Schema.safeParse({ ...valid, bio: "Too short" }).success).toBe(false);
  });

  it("rejects a bio over 500 characters", () => {
    expect(onboardingStep2Schema.safeParse({ ...valid, bio: "x".repeat(501) }).success).toBe(false);
  });
});

describe("onboardingSchema (merged)", () => {
  it("accepts a complete profile for a freelancer", () => {
    const result = onboardingSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada_dev",
      type: "SELLER",
      country: "United Kingdom",
      phone: "+44 20 7946 0958",
      professionalTitle: "Full Stack Developer",
      bio: "I build web apps with React and Node.js for startups.",
    });
    expect(result.success).toBe(true);
  });
});
