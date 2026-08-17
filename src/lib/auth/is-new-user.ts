/**
 * Wallet-first accounts are created without a real name. The marketplace
 * onboarding step exists to collect that before the user reaches /app.
 */
export function isNewUser(user: { firstName?: string | null }): boolean {
  return user.firstName == null;
}
