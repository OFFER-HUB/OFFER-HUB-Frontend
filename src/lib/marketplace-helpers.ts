/**
 * Shared marketplace helpers — category labels, money/rating parsers, and date formatting.
 */

export const CATEGORY_MAP: Record<string, string> = {
  WEB_DEVELOPMENT: "Web Development",
  MOBILE_DEVELOPMENT: "Mobile Development",
  DESIGN: "Design & Creative",
  WRITING: "Writing & Translation",
  MARKETING: "Marketing & Sales",
  VIDEO: "Video & Animation",
  MUSIC: "Music & Audio",
  DATA: "Data & Analytics",
  OTHER: "Other Services",
};

/** Resolve a backend category enum to a human-readable label. */
export function getCategoryLabel(category: string): string {
  return CATEGORY_MAP[category] || category;
}

/** Parse a budget/price decimal string into a finite number (NaN-safe → 0). */
export function parseMoneyAmount(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (value == null || value === "") return 0;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Parse an average rating string; returns null when missing/invalid. */
export function parseAverageRating(
  value: string | number | null | undefined
): number | null {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Format an ISO date as "Mon D, YYYY" for marketplace detail pages. */
export function formatMarketplaceDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format an ISO date as "Mon YYYY" for member-since display. */
export function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
