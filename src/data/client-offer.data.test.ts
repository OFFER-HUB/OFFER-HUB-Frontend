import { describe, expect, it } from "vitest";
import { MIN_BUDGET, validateOfferForm } from "./client-offer.data";
import type { OfferFormData } from "@/types/client-offer.types";

function form(budget: string): OfferFormData {
  const next = new Date();
  next.setDate(next.getDate() + 30);
  return {
    title: "Build a calculator in Python",
    description: "A".repeat(60),
    budget,
    category: "DEVELOPMENT",
    deadline: next.toISOString().slice(0, 10),
  };
}

describe("offer budget validation", () => {
  it("sets the minimum at $10", () => {
    expect(MIN_BUDGET).toBe(10);
  });

  it("accepts $10", () => {
    expect(validateOfferForm(form("10")).budget).toBeUndefined();
  });

  it("rejects less than $10", () => {
    expect(validateOfferForm(form("9.99")).budget).toBe("Budget must be at least $10");
    expect(validateOfferForm(form("0")).budget).toBe("Budget must be at least $10");
  });

  it("has no maximum", () => {
    expect(validateOfferForm(form("1000000")).budget).toBeUndefined();
    expect(validateOfferForm(form("99999999")).budget).toBeUndefined();
  });

  it("requires a budget", () => {
    expect(validateOfferForm(form("")).budget).toBe("Budget is required");
  });
});
