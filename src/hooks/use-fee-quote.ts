"use client";

import { useEffect, useState } from "react";
import { getFeeQuote } from "@/lib/api/fees";
import type { FeeBreakdown } from "@/types/fees.types";

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const DEBOUNCE_MS = 300;

/**
 * What the freelancer receives after fees for an amount typed in a form,
 * from `GET /fees/quote`. Debounced; `null` while the amount is empty or
 * invalid, or when the API can't answer (the form still works without it).
 */
export function useFeeQuote(amount: string | number | null | undefined): FeeBreakdown | null {
  const text = amount === null || amount === undefined ? "" : String(amount).trim();
  const valid = AMOUNT_PATTERN.test(text) && Number(text) > 0;
  const [result, setResult] = useState<{ amount: string; breakdown: FeeBreakdown | null } | null>(null);

  useEffect(() => {
    if (!valid) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      async function load(): Promise<void> {
        try {
          const quote = await getFeeQuote(text);
          if (!cancelled) setResult({ amount: text, breakdown: quote.breakdown ?? null });
        } catch {
          if (!cancelled) setResult({ amount: text, breakdown: null });
        }
      }
      void load();
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, valid]);

  // A stale answer for a previous amount is never shown.
  return valid && result?.amount === text ? result.breakdown : null;
}
