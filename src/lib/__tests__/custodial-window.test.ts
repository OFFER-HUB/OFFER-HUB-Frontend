import { describe, it, expect } from "vitest";
import { describeCustodialWindow } from "../custodial-window";

const window = { cutoverAt: "2026-11-24T15:00:00.000Z", expiresAt: "2027-02-22T15:00:00.000Z" };

describe("describeCustodialWindow", () => {
  it("is open before the end, with the dates and the days left rounded up", () => {
    const notice = describeCustodialWindow(window, Date.parse("2026-11-24T15:00:00.000Z"));

    expect(notice).toEqual({
      state: "open",
      cutoverOn: "November 24, 2026",
      expiresOn: "February 22, 2027",
      daysLeft: 90,
    });
  });

  it("counts a part of a day as a whole day", () => {
    const notice = describeCustodialWindow(window, Date.parse("2027-02-22T03:00:00.000Z"));

    expect(notice.state).toBe("open");
    expect(notice.daysLeft).toBe(1);
  });

  it("closes at the expiry moment and never reports negative days", () => {
    const at = describeCustodialWindow(window, Date.parse(window.expiresAt));
    const after = describeCustodialWindow(window, Date.parse("2027-06-01T00:00:00.000Z"));

    expect(at).toMatchObject({ state: "closed", daysLeft: 0 });
    expect(after).toMatchObject({ state: "closed", daysLeft: 0 });
  });
});
