import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { MoveFundsOutCard } from "../MoveFundsOutCard";

describe("MoveFundsOutCard", () => {
  it("tells the user to send from their own wallet, and names the supported wallets", () => {
    render(<MoveFundsOutCard />);

    expect(screen.getByRole("heading", { name: "Moving funds out" })).toBeInTheDocument();
    expect(screen.getByText(/send your USDC from your own wallet app/)).toBeInTheDocument();
    expect(screen.getByText(/Varial, Lobstr or xBull/)).toBeInTheDocument();
  });

  it("explains that a bank payout starts when an order is released, in the four supported countries", () => {
    render(<MoveFundsOutCard />);

    expect(screen.getByText(/payout to the bank account you added starts automatically/)).toBeInTheDocument();
    expect(screen.getByText(/Brazil,\s+Mexico, Argentina and Colombia/)).toBeInTheDocument();
  });

  it("offers no withdraw button, since there is nothing to withdraw from OfferHub", () => {
    render(<MoveFundsOutCard />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("no server-side withdraw", () => {
  /** Every source file the app ships, tests aside. */
  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return name === "__tests__" ? [] : sourceFiles(path);
      return /\.(ts|tsx)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
    });
  }

  it("never calls the API's /wallet/withdraw (the route does not exist and the server never signs for a user)", () => {
    const offenders = sourceFiles(join(process.cwd(), "src")).filter((file) =>
      /\/wallet\/withdraw|createWithdrawalRequest/.test(readFileSync(file, "utf8"))
    );

    expect(offenders).toEqual([]);
  });
});
