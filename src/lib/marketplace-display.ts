import type { MarketplaceService } from "@/lib/api/marketplace";

type MarketplaceServiceUser = MarketplaceService["user"];

/**
 * Full name when both parts are present, otherwise the username, otherwise the
 * local part of the email address.
 */
export function getMarketplaceUserDisplayName(user: MarketplaceServiceUser): string {
  return user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : (user.username ?? user.email.split("@")[0]);
}

/** Upper-cased first letters of the first two space-separated words. */
export function getInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Numeric average rating, or null when the service has no rating yet. */
export function parseAverageRating(averageRating: string | null): number | null {
  return averageRating ? parseFloat(averageRating) : null;
}

/** Short month/day in the viewer's locale (e.g. "Mar 5"), or null when there is no deadline. */
export function formatOfferDeadline(deadline: string | null | undefined): string | null {
  return deadline
    ? new Date(deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
}
