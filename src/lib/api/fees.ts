import { API_URL } from "@/config/api";
import type { FeeQuote } from "@/types/fees.types";

/**
 * Fee rules and, for an amount, what the freelancer receives after fees.
 * Public: used before an order exists (offer, service, application forms).
 */
export async function getFeeQuote(amount?: string): Promise<FeeQuote> {
  const url = new URL(`${API_URL}/fees/quote`);
  if (amount) url.searchParams.append("amount", amount);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || "Failed to fetch the fee quote");
  }
  const result = await response.json();
  return result.data;
}
