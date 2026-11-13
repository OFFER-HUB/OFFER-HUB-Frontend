import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

describe("EmailVerificationBanner resend", () => {
  it("shows why the resend failed instead of staying silent", async () => {
    const onResend = vi.fn().mockRejectedValue(new Error("Email delivery failed"));
    render(<EmailVerificationBanner userId="u1" email="a@b.com" onResend={onResend} />);

    fireEvent.click(screen.getByRole("button", { name: /resend email/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email delivery failed");
    expect(screen.getByRole("button", { name: /resend email/i })).toBeEnabled();
  });

  it("confirms a successful resend and starts the cooldown", async () => {
    const onResend = vi.fn().mockResolvedValue(undefined);
    render(<EmailVerificationBanner userId="u2" email="a@b.com" onResend={onResend} />);

    fireEvent.click(screen.getByRole("button", { name: /resend email/i }));

    await waitFor(() => expect(screen.getByText(/Sent · retry in/)).toBeInTheDocument());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
