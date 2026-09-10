import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  toLocalISODate,
  getRangeForPreset,
  parseMoney,
  pctChange,
  formatPct,
} from "../earnings-utils";

const FIXED_DATE = new Date("2025-09-15T12:00:00Z");

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
});

afterAll(() => {
  vi.useRealTimers();
});

describe("toLocalISODate", () => {
  it("formats a Date as YYYY-MM-DD", () => {
    expect(toLocalISODate(new Date("2025-03-07T00:00:00"))).toBe("2025-03-07");
  });

  it("zero-pads month and day", () => {
    expect(toLocalISODate(new Date("2025-01-05T00:00:00"))).toBe("2025-01-05");
  });
});

describe("getRangeForPreset", () => {
  it("30d returns a 30-day window ending today", () => {
    const { start, end } = getRangeForPreset("30d");
    expect(end).toBe("2025-09-15");
    const diffDays =
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(29);
  });

  it("90d returns a 90-day window ending today", () => {
    const { start, end } = getRangeForPreset("90d");
    const diffDays =
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(89);
  });

  it("ytd starts on Jan 1 of the current year", () => {
    const { start } = getRangeForPreset("ytd");
    expect(start).toBe("2025-01-01");
  });

  it("all returns a start 3 years back", () => {
    const { start } = getRangeForPreset("all");
    expect(start.startsWith("2022")).toBe(true);
  });

  it("12m starts 11 months before the current month's start", () => {
    const { start } = getRangeForPreset("12m");
    // Sep 2025 minus 11 months = Oct 2024 day 1
    expect(start).toBe("2024-10-01");
  });
});

describe("parseMoney", () => {
  it("parses a valid decimal string", () => {
    expect(parseMoney("123.45")).toBe(123.45);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(parseMoney("")).toBe(0);
    expect(parseMoney("abc")).toBe(0);
  });
});

describe("pctChange", () => {
  it("calculates percentage increase", () => {
    expect(pctChange(150, 100)).toBe(50);
  });

  it("calculates percentage decrease", () => {
    expect(pctChange(80, 100)).toBeCloseTo(-20);
  });

  it("returns null when previous is zero", () => {
    expect(pctChange(100, 0)).toBeNull();
  });
});

describe("formatPct", () => {
  it("prefixes positive values with +", () => {
    expect(formatPct(12.5)).toBe("+12.5%");
  });

  it("does not add + prefix for negative values", () => {
    expect(formatPct(-5.3)).toBe("-5.3%");
  });

  it("formats zero without + prefix", () => {
    expect(formatPct(0)).toBe("0.0%");
  });
});
