import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

let mockWindow: { cutoverAt: string; expiresAt: string } | null = null;
vi.mock("@/hooks/useCustodialWindow", () => ({ useCustodialWindow: () => mockWindow }));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

import { CustodialWindowBanner } from "../CustodialWindowBanner";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-12-10T12:00:00.000Z"));
  mockWindow = { cutoverAt: "2026-11-24T15:00:00.000Z", expiresAt: "2027-02-22T15:00:00.000Z" };
});
afterEach(() => vi.useRealTimers());

describe("CustodialWindowBanner", () => {
  it("shows nothing when there is no window (mainnet, or before the cutover)", () => {
    mockWindow = null;
    const { container } = render(<CustodialWindowBanner />);

    expect(container).toBeEmptyDOMElement();
  });

  it("explains the cutover, the end date and the days left, and links to Claim Your Wallet", () => {
    render(<CustodialWindowBanner />);

    expect(screen.getByRole("alert")).toHaveTextContent("OfferHub moved to Stellar mainnet on November 24, 2026");
    expect(screen.getByRole("alert")).toHaveTextContent("February 22, 2027");
    expect(screen.getByRole("alert")).toHaveTextContent("75 days left");
    expect(screen.getByRole("link", { name: "Claim your wallet" })).toHaveAttribute("href", "/app/settings");
  });

  it("says 'day', not 'days', on the last day", () => {
    vi.setSystemTime(new Date("2027-02-22T03:00:00.000Z"));
    render(<CustodialWindowBanner />);

    expect(screen.getByRole("alert")).toHaveTextContent("1 day left");
  });

  it("after the window it says the keys were destroyed and offers no claim link", () => {
    vi.setSystemTime(new Date("2027-03-01T00:00:00.000Z"));
    render(<CustodialWindowBanner />);

    expect(screen.getByRole("alert")).toHaveTextContent("The claim window closed on February 22, 2027");
    expect(screen.getByRole("alert")).toHaveTextContent("destroyed");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
