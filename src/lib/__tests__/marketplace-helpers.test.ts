import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  CATEGORY_MAP,
  getCategoryLabel,
  parseMoneyAmount,
  parseAverageRating,
  formatMarketplaceDate,
  formatMemberSince,
} from "../marketplace-helpers";
import { formatTimeAgo } from "../date-formatters";

const FIXED_DATE = new Date("2025-09-15T12:00:00Z");

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("CATEGORY_MAP / getCategoryLabel", () => {
  it("maps known categories", () => {
    expect(getCategoryLabel("WEB_DEVELOPMENT")).toBe("Web Development");
    expect(CATEGORY_MAP.DESIGN).toBe("Design & Creative");
  });

  it("falls back to the raw category when unknown", () => {
    expect(getCategoryLabel("CUSTOM_CAT")).toBe("CUSTOM_CAT");
  });
});

describe("parseMoneyAmount", () => {
  it("parses decimal strings", () => {
    expect(parseMoneyAmount("1234.50")).toBe(1234.5);
  });

  it("returns 0 for invalid input", () => {
    expect(parseMoneyAmount(null)).toBe(0);
    expect(parseMoneyAmount("")).toBe(0);
    expect(parseMoneyAmount("abc")).toBe(0);
  });
});

describe("parseAverageRating", () => {
  it("parses rating strings", () => {
    expect(parseAverageRating("4.5")).toBe(4.5);
  });

  it("returns null when missing", () => {
    expect(parseAverageRating(null)).toBeNull();
    expect(parseAverageRating("")).toBeNull();
  });
});

describe("formatMarketplaceDate / formatMemberSince", () => {
  it("formats full and short dates", () => {
    expect(formatMarketplaceDate("2025-03-07T00:00:00Z")).toMatch(/Mar/);
    expect(formatMemberSince("2024-01-15T00:00:00Z")).toMatch(/2024/);
  });
});

describe("formatTimeAgo", () => {
  it("returns relative labels", () => {
    expect(formatTimeAgo("2025-09-15T11:59:30Z")).toBe("just now");
    expect(formatTimeAgo("2025-09-15T11:00:00Z")).toBe("1 hour ago");
    expect(formatTimeAgo("2025-09-14T12:00:00Z")).toBe("1 day ago");
  });
});
