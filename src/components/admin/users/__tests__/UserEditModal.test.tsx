import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEditModal, diffUserPayload } from "@/components/admin/users/UserEditModal";
import { useAuthStore } from "@/stores/auth-store";
import type { AdminUser } from "@/types/admin.types";

vi.mock("@/lib/api/admin", () => ({
  getAdminUserDetail: vi.fn().mockResolvedValue({
    id: "usr_1",
    skills: [],
    balance: null,
    _count: { buyerOrders: 0, sellerOrders: 0, services: 0, applications: 0 },
    stats: { completedOrders: 0, totalEarnings: "0.00", averageRating: null },
  }),
}));

const USER: AdminUser = {
  id: "usr_1",
  externalUserId: "local_buyer",
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

const WALLET_ONLY: AdminUser = { ...USER, id: "usr_2", externalUserId: "wallet_GABC", email: null };

beforeEach(() => {
  useAuthStore.setState({ token: "token", isAuthenticated: true, hasHydrated: true });
});

describe("diffUserPayload", () => {
  it("contains only the fields that differ from the row — untouched nulls are not sent as empty strings", () => {
    const form = { email: "buyer@offerhub.local", type: "SELLER" as const, professionalTitle: "", location: "", timezone: "", bio: "" };
    expect(diffUserPayload(USER, form)).toEqual({ type: "SELLER" });
  });

  it("sends a cleared field as an empty string only when it previously had a value", () => {
    const withTitle = { ...USER, professionalTitle: "Designer" };
    const form = { email: "buyer@offerhub.local", type: "BUYER" as const, professionalTitle: "  ", location: "", timezone: "", bio: "" };
    expect(diffUserPayload(withTitle, form)).toEqual({ professionalTitle: "" });
  });

  it("is empty when nothing changed", () => {
    const form = { email: "buyer@offerhub.local", type: "BUYER" as const, professionalTitle: "", location: "", timezone: "", bio: "" };
    expect(diffUserPayload(USER, form)).toEqual({});
  });
});

describe("UserEditModal", () => {
  it("saves a role change without touching the other fields", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<UserEditModal isOpen user={USER} onClose={onClose} onSave={onSave} onBan={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Role"), "SELLER");
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("usr_1", { type: "SELLER" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("lets a wallet-only account with no email change role", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<UserEditModal isOpen user={WALLET_ONLY} onClose={vi.fn()} onSave={onSave} onBan={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Role"), "BOTH");
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("usr_2", { type: "BOTH" }));
    expect(screen.queryByText("Please enter a valid email address.")).not.toBeInTheDocument();
  });

  it("rejects a malformed email but only when one is being set", async () => {
    const onSave = vi.fn();
    render(<UserEditModal isOpen user={USER} onClose={vi.fn()} onSave={onSave} onBan={vi.fn()} />);

    await userEvent.clear(screen.getByLabelText("Email"));
    await userEvent.type(screen.getByLabelText("Email"), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("closes without calling the API when nothing changed", async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<UserEditModal isOpen user={USER} onClose={onClose} onSave={onSave} onBan={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("loads stats from the detail endpoint instead of the row", async () => {
    render(<UserEditModal isOpen user={USER} onClose={vi.fn()} onSave={vi.fn()} onBan={vi.fn()} />);

    expect(await screen.findByText("Orders (bought / sold)")).toBeInTheDocument();
    expect(screen.getByText("No ratings")).toBeInTheDocument();
  });
});
