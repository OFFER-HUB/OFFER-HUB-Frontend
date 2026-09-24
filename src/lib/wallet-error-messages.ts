/**
 * Wallet extensions (Freighter, Lobstr, xBull) each throw their own raw,
 * technical message when the user declines a connection or signature
 * request in the extension's own popup, e.g. "User declined access",
 * codes, or wording that means nothing to someone who just clicked
 * "Cancel". Surfacing that text directly reads as a broken app, not a
 * normal thing the user just did on purpose.
 *
 * Matches those patterns and normalizes them to one clear message,
 * leaving every other error (network failure, malformed response, a
 * real backend rejection) to show its own real message untouched.
 */

const CANCELLATION_PATTERNS = [
  /declin/i,
  /reject/i,
  /cancel/i,
  /denied/i,
  /user closed/i,
  /not allowed/i,
  /permission/i,
  // Freighter's extension popup rejects with this raw RxJS `EmptyError`
  // message when it's closed without the user responding. It never
  // mentions "cancel" or "reject" at all.
  /no elements in sequence/i,
];

export const WALLET_CANCELLED_MESSAGE = "Connection cancelled. You closed or declined the request in your wallet.";

function extractMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message: unknown };
    if (typeof message === "string" && message.length > 0) return message;
  }
  return null;
}

export function isWalletCancellation(error: unknown): boolean {
  const message = extractMessage(error);
  return message !== null && CANCELLATION_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Resolve a user-facing message for a failed wallet interaction: a friendly
 * fixed message for a cancellation, the error's own message when it has one
 * and isn't a raw cancellation string, otherwise `fallback`.
 */
export function toWalletErrorMessage(error: unknown, fallback: string): string {
  if (isWalletCancellation(error)) return WALLET_CANCELLED_MESSAGE;
  return extractMessage(error) ?? fallback;
}
