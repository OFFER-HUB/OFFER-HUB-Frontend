import { describe, it, expect } from "vitest";
import type { MarketplaceService } from "@/lib/api/marketplace";
import {
  formatOfferDeadline,
  getInitials,
  getMarketplaceUserDisplayName,
  parseAverageRating,
} from "../marketplace-display";

function user(overrides: Partial<MarketplaceService["user"]> = {}): MarketplaceService["user"] {
  return {
    id: "usr_1",
    email: "ana.lopez@example.com",
    username: null,
    firstName: null,
    lastName: null,
    avatarUrl: null,
    country: null,
    ...overrides,
  };
}

describe("getMarketplaceUserDisplayName", () => {
  it("uses the full name when both first and last name are present", () => {
    expect(
      getMarketplaceUserDisplayName(user({ firstName: "Ana", lastName: "López", username: "ana" }))
    ).toBe("Ana López");
  });

  it("falls back to the username when either name part is missing", () => {
    expect(getMarketplaceUserDisplayName(user({ firstName: "Ana", username: "analo" }))).toBe(
      "analo"
    );
    expect(getMarketplaceUserDisplayName(user({ lastName: "López", username: "analo" }))).toBe(
      "analo"
    );
  });

  it("falls back to the local part of the email when there is no username", () => {
    expect(getMarketplaceUserDisplayName(user())).toBe("ana.lopez");
  });
});

describe("getInitials", () => {
  it("takes the upper-cased first letters of the first two words", () => {
    expect(getInitials("ana maría lópez")).toBe("AM");
  });

  it("returns a single letter for a one-word name", () => {
    expect(getInitials("analo")).toBe("A");
  });

  it("keeps punctuation-joined words together, like an email local part", () => {
    expect(getInitials("ana.lopez")).toBe("A");
  });
});

describe("parseAverageRating", () => {
  it("parses a numeric rating string", () => {
    expect(parseAverageRating("4.75")).toBe(4.75);
  });

  it("returns null when the service has no rating", () => {
    expect(parseAverageRating(null)).toBeNull();
  });

  it("returns null for an empty rating string", () => {
    expect(parseAverageRating("")).toBeNull();
  });
});

describe("formatOfferDeadline", () => {
  it("formats the deadline as a short month and day in the viewer's locale", () => {
    const iso = "2026-03-05T12:00:00.000Z";

    expect(formatOfferDeadline(iso)).toBe(
      new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
  });

  it("still formats a deadline that has already passed", () => {
    const iso = "2020-01-15T12:00:00.000Z";

    expect(formatOfferDeadline(iso)).toBe(
      new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    );
  });

  it("returns null when there is no deadline", () => {
    expect(formatOfferDeadline("")).toBeNull();
    expect(formatOfferDeadline(null)).toBeNull();
    expect(formatOfferDeadline(undefined)).toBeNull();
  });
});
