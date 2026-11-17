import { describe, expect, it } from "vitest";
import { MIN_BUDGET, validateOfferForm } from "./client-offer.data";
import type { OfferFormData } from "./client-offer.data";

function form(budget: string): OfferFormData {
  const next = new Date();
  next.setDate(next.getDate() + 30);
  return {
    title: "Build a calculator in Python",
    description: "A".repeat(60),
    budget,
    category: "DEVELOPMENT",
    deadline: next.toISOString().slice(0, 10),
  } as OfferFormData;
}

describe("offer budget validation", () => {
  it("sets the minimum at $5", () => {
    expect(MIN_BUDGET).toBe(5);
  });

  it("accepts $5", () => {
    expect(validateOfferForm(form("5")).budget).toBeUndefined();
  });

  it("rejects less than $5", () => {
    expect(validateOfferForm(form("4.99")).budget).toBe("Budget must be at least $5");
    expect(validateOfferForm(form("0")).budget).toBe("Budget must be at least $5");
  });

  it("has no maximum", () => {
    expect(validateOfferForm(form("1000000")).budget).toBeUndefined();
    expect(validateOfferForm(form("99999999")).budget).toBeUndefined();
  });

  it("requires a budget", () => {
    expect(validateOfferForm(form("")).budget).toBe("Budget is required");
  });
});
