/**
 * Wallet-first accounts are created without a real name. The marketplace
 * onboarding step exists to collect that before the user reaches /app.
 *
 * Admin accounts are exempt: they're internal, created via the bootstrap
 * endpoint rather than the marketplace signup flow, and have no business
 * answering "I want to: Client/Freelancer/Both", a country, or a phone
 * number just to reach /admin.
 */
export function isNewUser(user: { firstName?: string | null; isAdmin?: boolean }): boolean {
  if (user.isAdmin) return false;
  return user.firstName == null;
}
