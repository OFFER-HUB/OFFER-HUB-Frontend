import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplyModal } from "../ApplyModal";

const COVER_LETTER = "I have built many projects like this one and can deliver it on time with tests.";

function setup() {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<ApplyModal isOpen onClose={vi.fn()} onSubmit={onSubmit} offerTitle="Logo design" offerBudget="50.00" />);
  return onSubmit;
}

async function fill(rate: string) {
  await userEvent.type(screen.getByPlaceholderText(/interested in this project/i), COVER_LETTER);
  const rateInput = screen.getByPlaceholderText("500.00");
  await userEvent.clear(rateInput);
  if (rate) await userEvent.type(rateInput, rate);
  await userEvent.click(screen.getByRole("button", { name: /submit|apply|send/i }));
}

describe("ApplyModal proposed rate", () => {
  it("rejects a rate under $10, the smallest amount that can be paid out to a bank", async () => {
    const onSubmit = setup();
    await fill("9.99");
    expect(screen.getByText("Proposed rate must be at least $10")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("accepts $10", async () => {
    const onSubmit = setup();
    await fill("10");
    expect(onSubmit).toHaveBeenCalledWith(COVER_LETTER, "10");
  });

  it("keeps the rate optional", async () => {
    const onSubmit = setup();
    await fill("");
    expect(onSubmit).toHaveBeenCalledWith(COVER_LETTER, undefined);
  });
});
