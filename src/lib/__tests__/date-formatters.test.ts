import { beforeEach, describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatTime } from "@/lib/date-formatters";
import { useDisplayPreferences } from "@/stores/display-preferences-store";

const ISO = "2026-11-13T23:30:00Z";

describe("date formatters follow display preferences", () => {
  beforeEach(() => {
    useDisplayPreferences.setState({ timezone: "UTC", dateFormat: "MDY", timeFormat: "12h" });
  });

  it("formats each date style", () => {
    expect(formatDate(ISO)).toBe("Nov 13, 2026");
    useDisplayPreferences.setState({ dateFormat: "DMY" });
    expect(formatDate(ISO)).toBe("13 Nov 2026");
    useDisplayPreferences.setState({ dateFormat: "YMD" });
    expect(formatDate(ISO)).toBe("2026-11-13");
  });

  it("formats 12h and 24h time", () => {
    expect(formatTime(ISO)).toBe("11:30 PM");
    useDisplayPreferences.setState({ timeFormat: "24h" });
    expect(formatTime(ISO)).toBe("23:30");
  });

  it("applies the time zone, shifting the calendar day when needed", () => {
    useDisplayPreferences.setState({ timezone: "Asia/Tokyo", timeFormat: "24h" });
    expect(formatDateTime(ISO)).toBe("Nov 14, 2026, 08:30");
  });

  it("falls back to UTC for an invalid time zone", () => {
    useDisplayPreferences.setState({ timezone: "Not/AZone" });
    expect(formatDate(ISO)).toBe("Nov 13, 2026");
  });
});
