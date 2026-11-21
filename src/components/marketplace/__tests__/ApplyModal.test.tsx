import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplyModal } from "../ApplyModal";

// The fee note asks the API; never hit the network from a unit test.
vi.mock("@/lib/api/fees", () => ({
  getFeeQuote: vi.fn().mockResolvedValue({ minOrderAmount: "10.56", payoutMinUsd: 10, payoutMaxUsd: 10000 }),
}));

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
  it("rejects a rate under $10.56: after fees the freelancer could not cash it out to a bank", async () => {
    const onSubmit = setup();
    await fill("10");
    expect(
      screen.getByText(
        "Proposed rate must be at least $10.56, so the freelancer still receives at least $10 after fees and can cash it out to a bank",
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("accepts $10.56", async () => {
    const onSubmit = setup();
    await fill("10.56");
    expect(onSubmit).toHaveBeenCalledWith(COVER_LETTER, "10.56");
  });

  it("keeps the rate optional", async () => {
    const onSubmit = setup();
    await fill("");
    expect(onSubmit).toHaveBeenCalledWith(COVER_LETTER, undefined);
  });
});
