/**
 * Smallest amount an offer, a service, an application or an order can have.
 *
 * BlindPay pays out to a bank from $10, and the escrow contract takes its fees
 * (5% platform + 0.3% TrustlessWork) before the freelancer is paid, so the
 * minimum is the smallest amount that still nets $10. The API enforces the
 * same value (`MIN_ORDER_AMOUNT`, also returned by `GET /fees/quote`).
 */
export const MIN_ORDER_AMOUNT = 10.56;

export const MIN_ORDER_AMOUNT_LABEL = `$${MIN_ORDER_AMOUNT.toFixed(2)}`;

export const MIN_ORDER_AMOUNT_REASON =
  "so the freelancer still receives at least $10 after fees and can cash it out to a bank";

/** "11.364" -> "11.36", "0.636" -> "0.64": amounts shown in the UI, to the cent. */
export function formatUsdc(amount: string | number): string {
  const value = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}
