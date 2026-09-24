import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsersTable } from "@/components/admin/users/UsersTable";
import type { AdminUser } from "@/types/admin.types";

/** A row exactly as GET /admin/users returns it — the shape that used to crash the table. */
const ACTIVE: AdminUser = {
  id: "usr_1",
  externalUserId: "local_buyer_offerhub_local",
  email: "buyer@offerhub.local",
  type: "BUYER",
  status: "ACTIVE",
  emailVerified: false,
  emailVerifiedAt: null,
  avatarUrl: null,
  bio: null,
  professionalTitle: null,
  location: null,
  timezone: null,
  createdAt: "2026-09-11T18:30:08.290Z",
  updatedAt: "2026-09-11T18:34:44.173Z",
};

const SUSPENDED: AdminUser = {
  ...ACTIVE,
  id: "usr_2",
  externalUserId: "google_123",
  email: "seller@offerhub.local",
  type: "SELLER",
  status: "SUSPENDED",
  emailVerified: true,
  emailVerifiedAt: "2026-09-10T00:00:00.000Z",
  professionalTitle: "Backend engineer",
};

const WALLET_ONLY: AdminUser = {
  ...ACTIVE,
  id: "usr_3",
  externalUserId: "wallet_GABC",
  email: null,
};

function renderTable(users: AdminUser[], overrides: Partial<React.ComponentProps<typeof UsersTable>> = {}) {
  const props = {
    users,
    isLoading: false,
    sort: { field: "createdAt" as const, direction: "desc" as const },
    selectedIds: new Set<string>(),
    onSortChange: vi.fn(),
    onToggleSelect: vi.fn(),
    onToggleSelectAll: vi.fn(),
    onEdit: vi.fn(),
    onBan: vi.fn(),
    onUnban: vi.fn(),
    ...overrides,
  };
  render(<UsersTable {...props} />);
  return props;
}

describe("UsersTable", () => {
  it("renders real API rows that carry no username or stats", () => {
    renderTable([ACTIVE, SUSPENDED]);

    expect(screen.getByText("buyer@offerhub.local")).toBeInTheDocument();
    expect(screen.getByText("local_buyer_offerhub_local")).toBeInTheDocument();
    expect(screen.getByText("Backend engineer")).toBeInTheDocument();
    expect(screen.getByText("Buyer")).toBeInTheDocument();
    expect(screen.getByText("Seller")).toBeInTheDocument();
  });

  it("shows email verification from the row instead of a fabricated last-active/orders/rating", () => {
    renderTable([ACTIVE, SUSPENDED]);

    expect(screen.getByText("Unverified")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
    expect(screen.queryByText(/last active/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rating/i)).not.toBeInTheDocument();
  });

  it("offers Unban for SUSPENDED rows and Ban for the rest — there is no BANNED status", () => {
    renderTable([ACTIVE, SUSPENDED]);

    expect(screen.getByRole("button", { name: "Ban buyer@offerhub.local" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unban seller@offerhub.local" })).toBeInTheDocument();
    expect(screen.getByText("Suspended")).toBeInTheDocument();
  });

  it("has no delete action — the backend exposes no DELETE /admin/users/:id", () => {
    renderTable([ACTIVE]);

    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("falls back to externalUserId for a wallet-only account with no email", () => {
    renderTable([WALLET_ONLY]);

    expect(screen.getByRole("button", { name: "Edit wallet_GABC" })).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("only offers the sort fields the backend accepts", () => {
    const onSortChange = vi.fn();
    renderTable([ACTIVE], { onSortChange });

    screen.getByText("User").click();
    screen.getByText("Status").click();
    screen.getByText("Registered").click();

    expect(onSortChange.mock.calls.map((c) => c[0])).toEqual(["email", "status", "createdAt"]);
  });
});
