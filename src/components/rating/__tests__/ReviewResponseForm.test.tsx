import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewResponseForm } from "../ReviewResponseForm";

describe("ReviewResponseForm", () => {
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with initial state", () => {
    render(<ReviewResponseForm onSubmit={onSubmit} />);

    expect(screen.getByPlaceholderText(/thank the reviewer/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /post response/i })).toBeInTheDocument();
    expect(screen.getByText("Min 10 characters")).toBeInTheDocument();
  });

  it("shows an error when submitted with fewer than 10 characters", async () => {
    render(<ReviewResponseForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText(/thank the reviewer/i);
    await userEvent.type(textarea, "Short");

    await userEvent.click(screen.getByRole("button", { name: /post response/i }));

    expect(screen.getByText(/response must be at least 10 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("opens the ConfirmationModal instead of native window.confirm", async () => {
    window.confirm = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm");
    render(<ReviewResponseForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText(/thank the reviewer/i);
    await userEvent.type(textarea, "Thank you very much for your kind feedback!");

    await userEvent.click(screen.getByRole("button", { name: /post response/i }));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Post Review Response")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to submit this response\? You can only respond once/i)
    ).toBeInTheDocument();
  });

  it("cancels submission when Cancel is clicked in ConfirmationModal", async () => {
    render(<ReviewResponseForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText(/thank the reviewer/i);
    await userEvent.type(textarea, "Thank you very much for your kind feedback!");

    await userEvent.click(screen.getByRole("button", { name: /post response/i }));

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the response when confirmed in ConfirmationModal", async () => {
    onSubmit.mockResolvedValueOnce(undefined);
    render(<ReviewResponseForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText(/thank the reviewer/i);
    const validText = "Thank you very much for your kind feedback!";
    await userEvent.type(textarea, validText);

    await userEvent.click(screen.getByRole("button", { name: /post response/i }));

    const dialog = screen.getByRole("alertdialog");
    const confirmButton = dialog.querySelector("button.bg-primary");
    expect(confirmButton).toBeInTheDocument();
    await userEvent.click(confirmButton!);

    expect(onSubmit).toHaveBeenCalledWith(validText);
  });

  it("displays error when onSubmit rejects", async () => {
    onSubmit.mockRejectedValueOnce(new Error("Network error"));
    render(<ReviewResponseForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText(/thank the reviewer/i);
    await userEvent.type(textarea, "Thank you very much for your kind feedback!");

    await userEvent.click(screen.getByRole("button", { name: /post response/i }));

    const dialog = screen.getByRole("alertdialog");
    const confirmButton = dialog.querySelector("button.bg-primary");
    await userEvent.click(confirmButton!);

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });
});
