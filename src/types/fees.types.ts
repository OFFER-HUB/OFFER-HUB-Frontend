/**
 * Fees the escrow contract takes and what each party really receives.
 * Computed by the API (`feeBreakdown` on orders, `GET /fees/quote`); the app
 * only displays it.
 */
export interface FeeBreakdown {
  currency: "USDC";
  /** What the escrow holds for this amount (the order price for a full release). */
  gross: string;
  platformFeePercent: number;
  trustlessWorkFeePercent: number;
  platformFee: string;
  trustlessWorkFee: string;
  totalFees: string;
  /** Exactly what reaches the receiving wallet, up to 7 decimals. */
  netReceived: string;
  /** `netReceived` rounded down to the cent: what a bank payout asks for. */
  payoutAmount: string;
}

export interface FeeQuote {
  /** Smallest amount an offer, service, application or order can have. */
  minOrderAmount: string;
  payoutMinUsd: number;
  payoutMaxUsd: number;
  breakdown?: FeeBreakdown & { payoutInRange: boolean };
}
