import {
  MAX_IMAGE_CAPTION_LENGTH,
  type PortfolioImageEntry,
} from "@/types/portfolio.types";

export function newPortfolioImageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Normalizes API or legacy `string[]` image lists into `PortfolioImageEntry[]`.
 */
export function normalizePortfolioImages(raw: unknown): PortfolioImageEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: PortfolioImageEntry[] = [];
  raw.forEach((item) => {
    if (typeof item === "string" && item.trim()) {
      out.push({
        id: newPortfolioImageId(),
        url: item.trim(),
      });
      return;
    }
    if (item && typeof item === "object" && "url" in item) {
      const o = item as Record<string, unknown>;
      const url = typeof o.url === "string" ? o.url.trim() : "";
      if (!url) return;
      const cap =
        typeof o.caption === "string"
          ? o.caption.slice(0, MAX_IMAGE_CAPTION_LENGTH)
          : undefined;
      out.push({
        id: typeof o.id === "string" && o.id ? o.id : newPortfolioImageId(),
        url,
        caption: cap || undefined,
      });
    }
  });
  return out;
}
