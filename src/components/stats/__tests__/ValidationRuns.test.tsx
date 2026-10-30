import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ValidationRuns } from "@/components/stats/ValidationRuns";
import type { PublicValidationResults } from "@/types/stats.types";

const validationResults: PublicValidationResults = {
  publishedAt: "2026-10-25T10:00:00.000Z",
  runs: [
    {
      id: "run-1",
      name: "Escrow release validation",
      status: "passed",
      completedAt: "2026-10-24T10:00:00.000Z",
      stellarExpertUrl: "https://stellar.expert/explorer/testnet/tx/abc",
      blindPayReceiptUrl: "https://app.blindpay.com/receipt/abc",
    },
  ],
};

describe("ValidationRuns", () => {
  it("shows publication and refresh times with links to trusted receipts", () => {
    render(
      <ValidationRuns
        data={validationResults}
        error={null}
        fetchedAt="2026-10-25T11:00:00.000Z"
        isLoading={false}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText("Published validation results")).toBeInTheDocument();
    expect(screen.getByText(/Published/)).toBeInTheDocument();
    expect(screen.getByText(/Last refreshed/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Stellar Expert" })).toHaveAttribute(
      "href",
      validationResults.runs[0]?.stellarExpertUrl
    );
    expect(screen.getByRole("link", { name: "BlindPay receipt" })).toHaveAttribute(
      "href",
      validationResults.runs[0]?.blindPayReceiptUrl
    );
  });

  it("does not render untrusted receipt URLs", () => {
    render(
      <ValidationRuns
        data={{
          ...validationResults,
          runs: [
            {
              ...validationResults.runs[0]!,
              stellarExpertUrl: "javascript:alert(1)",
              blindPayReceiptUrl: "https://evil.example/receipt",
            },
          ],
        }}
        error={null}
        fetchedAt={null}
        isLoading={false}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
