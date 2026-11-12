import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WalletMonthlyMetrics } from "../WalletMonthlyMetrics";

const MONTHLY = {
  currentMonthEarnings: "900.00",
  previousMonthEarnings: "700.00",
  currentMonthSpending: "150.00",
  previousMonthSpending: "200.00",
};

describe("WalletMonthlyMetrics", () => {
  it("shows what was earned and withdrawn this month, with the change against last month", () => {
    render(<WalletMonthlyMetrics monthly={MONTHLY} currency="USD" />);

    expect(screen.getByText("Earned this month")).toBeInTheDocument();
    expect(screen.getByText("$900.00")).toBeInTheDocument();
    expect(screen.getByText(/\+28\.6%.*vs last month/)).toBeInTheDocument();
    expect(screen.getByText("Withdrawn this month")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });

  it("has no 'Pending withdrawals' card: nothing can be pending now that the server never pays out for a user", () => {
    render(<WalletMonthlyMetrics monthly={MONTHLY} currency="USD" />);

    expect(screen.queryByText(/Pending withdrawals/)).not.toBeInTheDocument();
    expect(screen.queryByText(/processing queue/)).not.toBeInTheDocument();
  });

  it("says so when there is no previous month to compare with", () => {
    render(
      <WalletMonthlyMetrics monthly={{ ...MONTHLY, previousMonthEarnings: "0.00", previousMonthSpending: "0.00" }} currency="USD" />
    );

    expect(screen.getAllByText("No comparison last month")).toHaveLength(2);
  });
});
