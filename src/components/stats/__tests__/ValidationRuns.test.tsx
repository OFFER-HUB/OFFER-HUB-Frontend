import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ValidationRuns } from "@/components/stats/ValidationRuns";
import type { PublicValidationResults, PublicValidationRun } from "@/types/stats.types";

const H1 = "a".repeat(64);
const H2 = "b".repeat(64);
const H3 = "c".repeat(64);

function run(overrides: Partial<PublicValidationRun> = {}): PublicValidationRun {
  return {
    id: "vr_0123456789abcdef",
    startedAt: "2026-11-16T14:00:00.000Z",
    finishedAt: "2026-11-16T14:06:00.000Z",
    network: "mainnet",
    status: "passed",
    corridor: "BR",
    steps: [
      { name: "escrow_fund", status: "passed", txHashes: [H1], confirmations: [], durationMs: 1000 },
      { name: "escrow_release", status: "passed", txHashes: [H2, H3], confirmations: [], durationMs: 3000 },
      { name: "disbursement_verification", status: "passed", txHashes: [], confirmations: [], durationMs: 300 },
    ],
    stellarExpertUrls: [H1, H2, H3].map((h) => `https://stellar.expert/explorer/public/tx/${h}`),
    blindpayPayoutId: "po_0rqm1fx9D3Zw",
    blindpayStatus: "completed",
    trigger: "schedule",
    durationMs: 360000,
    orderId: "ord_1",
    contractId: "CCONTRACT",
    stellarExpertContractUrl: "https://stellar.expert/explorer/public/contract/CCONTRACT",
    receipt: {
      corridor: "BR",
      source: "blindpay",
      blindpayPayoutId: "po_0rqm1fx9D3Zw",
      status: "completed",
      currency: "BRL",
      receiverAmountMinor: 77036,
      senderAmountMinor: 15000,
      stellarTxHash: "d".repeat(64),
      matchesPayoutTransfer: true,
      paymentProvider: "Stark Bank",
      providerTransactionId: null,
      completedAt: "2026-11-16T14:05:32.000Z",
      verifiedAt: "2026-11-16T14:05:59.000Z",
    },
    publishedAt: "2026-11-16T14:06:01.000Z",
    ...overrides,
  };
}

function results(runs: PublicValidationRun[], total = runs.length): PublicValidationResults {
  return { runs, total };
}

function renderRuns(data: PublicValidationResults, fetchedAt: string | null = null) {
  return render(<ValidationRuns data={data} error={null} fetchedAt={fetchedAt} isLoading={false} onRetry={vi.fn()} />);
}

describe("ValidationRuns", () => {
  it("links every transaction, the escrow contract and BlindPay's deposit on Stellar Expert", () => {
    renderRuns(results([run()]), "2026-11-16T15:00:00.000Z");

    expect(screen.getByText("Published validation results")).toBeInTheDocument();
    expect(screen.getByText(/Last published/)).toBeInTheDocument();
    expect(screen.getByText(/Last refreshed/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "escrow fund" })).toHaveAttribute("href", `https://stellar.expert/explorer/public/tx/${H1}`);
    expect(screen.getByRole("link", { name: "escrow release 1" })).toHaveAttribute("href", `https://stellar.expert/explorer/public/tx/${H2}`);
    expect(screen.getByRole("link", { name: "escrow release 2" })).toHaveAttribute("href", `https://stellar.expert/explorer/public/tx/${H3}`);
    expect(screen.getByRole("link", { name: "Escrow contract" })).toHaveAttribute("href", "https://stellar.expert/explorer/public/contract/CCONTRACT");
    expect(screen.getByRole("link", { name: "BlindPay deposit tx" })).toHaveAttribute(
      "href",
      `https://stellar.expert/explorer/public/tx/${"d".repeat(64)}`
    );
  });

  it("shows the BlindPay-verified disbursement and the verified corridors", () => {
    renderRuns(results([run(), run({ id: "vr_2", corridor: "MX", status: "failed", receipt: null, blindpayPayoutId: null })]));

    expect(screen.getByText(/po_0rqm1fx9D3Zw/)).toBeInTheDocument();
    expect(screen.getByText(/Stark Bank/)).toBeInTheDocument();
    expect(screen.getByText("Verified fiat corridors: BR")).toBeInTheDocument();
  });

  it("explains where a failed run stopped and marks an unverified payout", () => {
    renderRuns(
      results([
        run({
          status: "failed",
          receipt: null,
          blindpayStatus: null,
          steps: [{ name: "payout_settlement", status: "failed", txHashes: [], confirmations: [], durationMs: 1, error: "Payout pay_1 ended FAILED" }],
          stellarExpertUrls: [],
        }),
      ])
    );

    expect(screen.getByText("Failed at payout settlement: Payout pay_1 ended FAILED")).toBeInTheDocument();
    expect(screen.getByText(/not verified/)).toBeInTheDocument();
    expect(screen.queryByText(/Verified fiat corridors/)).not.toBeInTheDocument();
  });

  it("does not render untrusted URLs", () => {
    renderRuns(
      results([
        run({
          stellarExpertUrls: ["javascript:alert(1)", "https://evil.example/tx/abc"],
          stellarExpertContractUrl: "https://evil.example/contract",
          receipt: { ...run().receipt!, stellarTxHash: "not-a-hash" },
        }),
      ])
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("says when more runs exist than are shown", () => {
    renderRuns(results([run()], 42));
    expect(screen.getByText(/Showing 1 of 42/)).toBeInTheDocument();
  });

  it("shows the empty state when nothing is published", () => {
    renderRuns(results([]));
    expect(screen.getByText("No validation runs published")).toBeInTheDocument();
  });
});
