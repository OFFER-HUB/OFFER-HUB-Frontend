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

const BELOW_MIN =
  "Budget must be at least $10.56, so the freelancer still receives at least $10 after fees and can cash it out to a bank";

describe("offer budget validation", () => {
  it("sets the minimum at $10.56, the smallest amount that nets the $10 BlindPay payout minimum after fees", () => {
    expect(MIN_BUDGET).toBe(10.56);
  });

  it("accepts $10.56 and more", () => {
    expect(validateOfferForm(form("10.56")).budget).toBeUndefined();
    expect(validateOfferForm(form("12")).budget).toBeUndefined();
  });

  it("rejects less than $10.56, saying why", () => {
    expect(validateOfferForm(form("10.55")).budget).toBe(BELOW_MIN);
    expect(validateOfferForm(form("10")).budget).toBe(BELOW_MIN);
    expect(validateOfferForm(form("0")).budget).toBe(BELOW_MIN);
  });

  it("has no maximum", () => {
    expect(validateOfferForm(form("1000000")).budget).toBeUndefined();
    expect(validateOfferForm(form("99999999")).budget).toBeUndefined();
  });

  it("requires a budget", () => {
    expect(validateOfferForm(form("")).budget).toBe("Budget is required");
  });
});
