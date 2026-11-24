import { beforeEach, describe, expect, it } from "vitest";
import {
  categoryOf,
  isPopupEnabled,
  useNotificationPreferences,
} from "../notification-preferences-store";

beforeEach(() => {
  useNotificationPreferences.getState().reset();
});

describe("notification preferences", () => {
  it("maps every notification type to a category", () => {
    expect(categoryOf("order_created")).toBe("orders");
    expect(categoryOf("offer_rejected")).toBe("offers");
    expect(categoryOf("message_received")).toBe("messages");
    expect(categoryOf("payment_received")).toBe("payments");
    expect(categoryOf("dispute_resolved")).toBe("disputes");
    expect(categoryOf("review_received")).toBe("reviews");
    expect(categoryOf("system")).toBe("system");
  });

  it("shows every pop-up by default", () => {
    expect(isPopupEnabled("message_received")).toBe(true);
  });

  it("stops pop-ups for a category that is switched off, and only that category", () => {
    useNotificationPreferences.getState().setPopup("messages", false);

    expect(isPopupEnabled("message_received")).toBe(false);
    expect(isPopupEnabled("order_created")).toBe(true);
  });

  it("persists the choice so it survives a reload", () => {
    useNotificationPreferences.getState().setPopup("orders", false);

    const stored = JSON.parse(window.localStorage.getItem("notification-preferences") ?? "{}") as {
      state?: { popups?: Record<string, boolean> };
    };
    expect(stored.state?.popups?.orders).toBe(false);
  });
});
