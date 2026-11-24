import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleGate } from "../RoleGate";

let mockUser: { type?: "BUYER" | "SELLER" | "BOTH" } | null = null;
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser }) => unknown) => selector({ user: mockUser }),
}));

beforeEach(() => {
  mockUser = null;
});

describe("RoleGate", () => {
  it("shows the pages to an account of the matching role", () => {
    mockUser = { type: "BUYER" };
    render(<RoleGate mode="client"><p>Create offer</p></RoleGate>);
    expect(screen.getByText("Create offer")).toBeInTheDocument();
  });

  it("shows a message instead of the client pages to a freelancer", () => {
    mockUser = { type: "SELLER" };
    render(<RoleGate mode="client"><p>Create offer</p></RoleGate>);

    expect(screen.queryByText("Create offer")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("This area is for clients");
    expect(screen.getByRole("link", { name: /freelancer dashboard/i })).toHaveAttribute(
      "href",
      "/app/freelancer/dashboard",
    );
  });

  it("shows a message instead of the freelancer pages to a client", () => {
    mockUser = { type: "BUYER" };
    render(<RoleGate mode="freelancer"><p>New service</p></RoleGate>);

    expect(screen.queryByText("New service")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /client dashboard/i })).toHaveAttribute(
      "href",
      "/app/client/dashboard",
    );
  });

  it("lets BOTH accounts, untyped accounts and a not-yet-loaded session through", () => {
    mockUser = { type: "BOTH" };
    const { rerender } = render(<RoleGate mode="client"><p>Area</p></RoleGate>);
    expect(screen.getByText("Area")).toBeInTheDocument();

    mockUser = {};
    rerender(<RoleGate mode="freelancer"><p>Area</p></RoleGate>);
    expect(screen.getByText("Area")).toBeInTheDocument();

    mockUser = null;
    rerender(<RoleGate mode="client"><p>Area</p></RoleGate>);
    expect(screen.getByText("Area")).toBeInTheDocument();
  });
});
