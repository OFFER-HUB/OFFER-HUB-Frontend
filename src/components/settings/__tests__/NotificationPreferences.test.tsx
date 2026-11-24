import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesForm } from "../PreferencesForm";
import { useNotificationPreferences } from "@/stores/notification-preferences-store";

beforeEach(() => {
  useNotificationPreferences.getState().reset();
});

describe("PreferencesForm notifications section", () => {
  it("lists a switch per category, all on by default", () => {
    render(<PreferencesForm />);

    const messages = screen.getByRole("switch", { name: "Messages" });
    expect(messages).toHaveAttribute("aria-checked", "true");
    expect(screen.getAllByRole("switch")).toHaveLength(7);
  });

  it("turns a category off and keeps the choice in the store", async () => {
    const user = userEvent.setup();
    render(<PreferencesForm />);

    await user.click(screen.getByRole("switch", { name: "Messages" }));

    expect(screen.getByRole("switch", { name: "Messages" })).toHaveAttribute("aria-checked", "false");
    expect(useNotificationPreferences.getState().popups.messages).toBe(false);
  });
});
