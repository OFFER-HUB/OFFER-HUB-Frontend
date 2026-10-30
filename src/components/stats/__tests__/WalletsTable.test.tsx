import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WalletsTable } from "@/components/stats/WalletsTable";
import type { RecentWallet } from "@/types/stats.types";

const wallet: RecentWallet = {
  id: "wallet-1",
  publicKey: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ",
  createdAt: "2026-10-25T10:00:00.000Z",
};

describe("WalletsTable", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an empty state when there are no wallets", () => {
    render(
      <WalletsTable wallets={[]} totalWallets={0} isLoadingMore={false} onShowMore={vi.fn()} />
    );

    expect(screen.getByText("No Stellar wallets have been initialized yet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("copies a full address and confirms the action", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const writeText = vi.mocked(navigator.clipboard.writeText);

    render(
      <WalletsTable
        wallets={[wallet]}
        totalWallets={2}
        isLoadingMore={false}
        onShowMore={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy full wallet address" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Copied!"));
    expect(writeText).toHaveBeenCalledWith(wallet.publicKey);
  });

  it("shows more wallets when requested", () => {
    const onShowMore = vi.fn();
    render(
      <WalletsTable
        wallets={[wallet]}
        totalWallets={2}
        isLoadingMore={false}
        onShowMore={onShowMore}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Show More" }));
    expect(onShowMore).toHaveBeenCalledOnce();
  });
});
