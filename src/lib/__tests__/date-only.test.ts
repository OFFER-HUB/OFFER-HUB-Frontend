import { describe, expect, it } from "vitest";
import { formatLocalDateOnly, parseLocalDateOnly } from "@/lib/date-only";

describe("date-only helpers", () => {
  it("keeps the selected local calendar day", () => {
    const selected = new Date(2026, 8, 19);

    expect(formatLocalDateOnly(selected)).toBe("2026-09-19");
  });

  it("parses a date-only value at local midnight", () => {
    const parsed = parseLocalDateOnly("2026-09-19");

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(19);
    expect(parsed.getHours()).toBe(0);
  });
});
