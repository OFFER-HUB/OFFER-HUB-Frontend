import { describe, it, expect } from "vitest";
import { ICON_PATHS } from "@/components/ui/Icon";
import { getEmptyProfileViewsAnalytics } from "@/data/profile-views.data";
import {
  getChangePercentage,
  getChangeTone,
  getProfileViewsSummaryCards,
} from "../profile-views-utils";

describe("getChangePercentage", () => {
  it("returns the rounded percentage change from the previous period", () => {
    expect(getChangePercentage({ current: 150, previous: 100 })).toBe(50);
    expect(getChangePercentage({ current: 2, previous: 3 })).toBe(-33);
  });

  it("returns a negative change when views dropped", () => {
    expect(getChangePercentage({ current: 25, previous: 100 })).toBe(-75);
  });

  it("returns 0 when nothing changed", () => {
    expect(getChangePercentage({ current: 40, previous: 40 })).toBe(0);
  });

  it("returns 100 when the previous period was zero and there are views now", () => {
    expect(getChangePercentage({ current: 7, previous: 0 })).toBe(100);
  });

  it("returns 0 when both periods are zero", () => {
    expect(getChangePercentage({ current: 0, previous: 0 })).toBe(0);
  });
});

describe("getChangeTone", () => {
  it("marks a positive change as up, in the success colour", () => {
    expect(getChangeTone(12)).toEqual({
      label: "Up 12%",
      icon: ICON_PATHS.arrowUp,
      className: "text-success",
    });
  });

  it("marks a negative change as down, using the absolute value in the label", () => {
    expect(getChangeTone(-8)).toEqual({
      label: "Down 8%",
      icon: ICON_PATHS.arrowDown,
      className: "text-warning",
    });
  });

  it("marks zero as no change", () => {
    expect(getChangeTone(0)).toEqual({
      label: "No change",
      icon: ICON_PATHS.infoCircle,
      className: "text-text-secondary",
    });
  });
});

describe("getProfileViewsSummaryCards", () => {
  it("lists the 7-day, 30-day and all-time totals in display order", () => {
    const analytics = {
      ...getEmptyProfileViewsAnalytics(),
      week: { current: 5, previous: 3 },
      month: { current: 20, previous: 18 },
      allTime: { current: 300, previous: 280 },
    };

    expect(getProfileViewsSummaryCards(analytics)).toEqual([
      { label: "Last 7 days", value: 5, previous: 3 },
      { label: "Last 30 days", value: 20, previous: 18 },
      { label: "All time", value: 300, previous: 280 },
    ]);
  });
});
