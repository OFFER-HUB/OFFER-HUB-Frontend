import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EscrowsTable } from "@/components/stats/EscrowsTable";
import type { RecentEscrow } from "@/types/stats.types";

const escrow: RecentEscrow = {
  id: "escrow-1234567890abcdefghij",
  orderId: "order-1",
  trustlessContractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4",
  status: "FUNDED",
  amount: "150.00",
  createdAt: "2026-10-25T10:00:00.000Z",
};

describe("EscrowsTable", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an empty state when there are no escrows", () => {
    render(
      <EscrowsTable escrows={[]} totalEscrows={0} isLoadingMore={false} onShowMore={vi.fn()} />
    );

    expect(screen.getByText("No escrow accounts have been initialized yet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders escrow status and copies a contract ID", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const writeText = vi.mocked(navigator.clipboard.writeText);

    render(
      <EscrowsTable
        escrows={[escrow]}
        totalEscrows={1}
        isLoadingMore={false}
        onShowMore={vi.fn()}
      />
    );

    expect(screen.getByText("FUNDED")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copy escrow contract ID" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied!"));
    expect(writeText).toHaveBeenCalledWith(escrow.trustlessContractId);
  });

  it("shows pending contract status when a contract ID is missing", () => {
    render(
      <EscrowsTable
        escrows={[{ ...escrow, trustlessContractId: null }]}
        totalEscrows={1}
        isLoadingMore={false}
        onShowMore={vi.fn()}
      />
    );

    expect(screen.getByText("Pending Contract")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copy escrow contract ID" })).not.toBeInTheDocument();
  });

  it("shows more escrows when requested", () => {
    const onShowMore = vi.fn();
    render(
      <EscrowsTable
        escrows={[escrow]}
        totalEscrows={2}
        isLoadingMore={false}
        onShowMore={onShowMore}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Show More" }));
    expect(onShowMore).toHaveBeenCalledOnce();
  });
});
