import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfferCard } from "@/components/marketplace/OfferCard";
import type { MarketplaceOffer } from "@/lib/api/marketplace";

function buildOffer(overrides: Partial<MarketplaceOffer> = {}): MarketplaceOffer {
  const next = new Date();
  next.setDate(next.getDate() + 30);
  return {
    id: "ofr_1",
    title: "Python Calculator Development",
    description: "Need a simple, reliable, and easy-to-use calculator developed in Python.",
    category: "MOBILE_DEVELOPMENT",
    budget: "5.00",
    deadline: next.toISOString(),
    status: "OPEN",
    createdAt: "2026-11-01T00:00:00.000Z",
    userId: "usr_1",
    applicantsCount: 1,
    user: {
      id: "usr_1",
      email: "josuemarin2009@example.com",
      username: "josuemarin",
      firstName: "Josue",
      lastName: "Marin",
      avatarUrl: null,
      professionalTitle: null,
    },
    attachments: [],
    ...overrides,
  } as MarketplaceOffer;
}

describe("OfferCard", () => {
  it("shows the client's name, never the email", () => {
    render(<OfferCard offer={buildOffer()} />);
    expect(screen.getByText("Josue Marin")).toBeInTheDocument();
    expect(screen.queryByText(/josuemarin2009/)).not.toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it("falls back to the username, then to the email's local part", () => {
    const noName = buildOffer({ user: { ...buildOffer().user, firstName: null, lastName: null } });
    const { unmount } = render(<OfferCard offer={noName} />);
    expect(screen.getByText("josuemarin")).toBeInTheDocument();
    unmount();

    const onlyEmail = buildOffer({
      user: { ...buildOffer().user, firstName: null, lastName: null, username: null },
    });
    render(<OfferCard offer={onlyEmail} />);
    expect(screen.getByText("josuemarin2009")).toBeInTheDocument();
  });

  it("shows the profile photo when there is one, initials when there is not", () => {
    const withPhoto = buildOffer({ user: { ...buildOffer().user, avatarUrl: "https://img.test/a.png" } });
    const { unmount } = render(<OfferCard offer={withPhoto} />);
    expect(screen.getByRole("img", { name: "Josue Marin" })).toHaveAttribute("src", "https://img.test/a.png");
    unmount();

    render(<OfferCard offer={buildOffer()} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("JM")).toBeInTheDocument();
  });

  it("leads with the title as a heading and shows the budget and applicants", () => {
    render(<OfferCard offer={buildOffer({ applicantsCount: 4, budget: "1000" })} />);
    expect(screen.getByRole("heading", { name: "Python Calculator Development" })).toBeInTheDocument();
    expect(screen.getByText("$1,000")).toBeInTheDocument();
    expect(screen.getByText("4 applicants")).toBeInTheDocument();
  });

  it("does not show a made-up rating", () => {
    render(<OfferCard offer={buildOffer()} />);
    expect(screen.queryByText("5.0")).not.toBeInTheDocument();
  });
});
