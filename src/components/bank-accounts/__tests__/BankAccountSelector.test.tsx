import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BankAccountSelector } from "@/components/bank-accounts/BankAccountSelector";
import type { BankAccount } from "@/lib/api/bank-accounts";

const mockListBankAccounts = vi.fn();
const mockSetDefaultBankAccount = vi.fn();
const mockDeleteBankAccount = vi.fn();
const mockGetMyKyc = vi.fn();

vi.mock("@/lib/api/bank-accounts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/bank-accounts")>();
  return {
    ...actual,
    listBankAccounts: (...args: unknown[]) => mockListBankAccounts(...args),
    setDefaultBankAccount: (...args: unknown[]) => mockSetDefaultBankAccount(...args),
    deleteBankAccount: (...args: unknown[]) => mockDeleteBankAccount(...args),
  };
});

vi.mock("@/lib/api/kyc", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/kyc")>();
  return {
    ...actual,
    getMyKyc: (...args: unknown[]) => mockGetMyKyc(...args),
  };
});

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) => selector({ token: "jwt-token" }),
}));

const NEW_ACCOUNT: BankAccount = {
  id: "ba_new",
  userId: "usr_1",
  country: "CO",
  rail: "ACH_COP_BITSO",
  accountNumber: "1234567890",
  bankName: "Bancolombia",
  holderName: "New Freelancer",
  blindpayBankAccountId: null,
  isDefault: false,
  details: null,
  createdAt: "2026-01-05T00:00:00.000Z",
  updatedAt: "2026-01-05T00:00:00.000Z",
};

vi.mock("@/components/bank-accounts/BankAccountForm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/bank-accounts/BankAccountForm")>();
  return {
    ...actual,
    BankAccountForm: ({ onSuccess }: { onSuccess?: (account: BankAccount) => void }) => (
      <button onClick={() => onSuccess?.(NEW_ACCOUNT)}>mock-add-account</button>
    ),
  };
});

const DEFAULT_ACCOUNT: BankAccount = {
  id: "ba_default",
  userId: "usr_1",
  country: "MX",
  rail: "SPEI_BITSO",
  accountNumber: "032180000118359719",
  bankName: "BBVA",
  holderName: "Jane Doe",
  blindpayBankAccountId: "bp_1",
  isDefault: true,
  details: { spei_protocol: "clabe" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const SECONDARY_ACCOUNT: BankAccount = {
  id: "ba_secondary",
  userId: "usr_1",
  country: "BR",
  rail: "PIX",
  accountNumber: "00012345-6",
  bankName: "Banco do Brasil",
  holderName: "Jane Doe",
  blindpayBankAccountId: "bp_2",
  isDefault: false,
  details: { pix_key: "jane@example.com" },
  createdAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  // By default, KYC is approved so account operations work normally
  mockGetMyKyc.mockResolvedValue({
    id: "kyc_1",
    country: "MX",
    blindpayTosId: "tos_12345",
  });
});

describe("BankAccountSelector KYC Gate", () => {
  it("locks adding accounts and displays gate when KYC is not submitted", async () => {
    mockGetMyKyc.mockResolvedValue(null);
    mockListBankAccounts.mockResolvedValue([]);
    render(<BankAccountSelector />);

    expect(await screen.findByText("Identity verification required")).toBeInTheDocument();
    expect(screen.getByText("KYC Required")).toBeInTheDocument();
    const addButton = screen.getByRole("button", { name: "Add new account" });
    expect(addButton).toBeDisabled();
  });

  it("locks adding accounts and displays in-review gate when KYC ToS is pending", async () => {
    mockGetMyKyc.mockResolvedValue({
      id: "kyc_co",
      country: "CO",
      blindpayTosId: null, // Pending ToS
    });
    mockListBankAccounts.mockResolvedValue([]);
    render(<BankAccountSelector />);

    expect(await screen.findByText("Identity verification in review")).toBeInTheDocument();
    expect(screen.getByText("In Review")).toBeInTheDocument();
    const addButton = screen.getByRole("button", { name: "Add new account" });
    expect(addButton).toBeDisabled();
  });

  it("unlocks accounts and allows adding accounts when KYC is approved", async () => {
    mockGetMyKyc.mockResolvedValue({
      id: "kyc_approved",
      country: "MX",
      blindpayTosId: "tos_accepted_123",
    });
    mockListBankAccounts.mockResolvedValue([]);
    render(<BankAccountSelector />);

    expect(await screen.findByText("Verified")).toBeInTheDocument();
    expect(screen.getByText("No bank accounts yet")).toBeInTheDocument();
    const addButton = screen.getByRole("button", { name: "Add new account" });
    expect(addButton).not.toBeDisabled();
  });
});

describe("BankAccountSelector Account Management", () => {
  it("lists accounts with rail label, masked account number and the default badge", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT, SECONDARY_ACCOUNT]);
    render(<BankAccountSelector />);

    await screen.findByText("BBVA");
    expect(screen.getByText(/Mexico — SPEI/)).toBeInTheDocument();
    expect(screen.getByText(/•••• 9719/)).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("shows a friendly empty state explaining why a bank account is needed", async () => {
    mockListBankAccounts.mockResolvedValue([]);
    render(<BankAccountSelector />);

    await screen.findByText("No bank accounts yet");
    expect(
      screen.getByText("Add a bank account so you can receive your payouts once a client releases funds.")
    ).toBeInTheDocument();
  });

  it("uses a custom title when the caller names the section (e.g. settings' Payment Accounts)", async () => {
    mockListBankAccounts.mockResolvedValue([]);
    render(<BankAccountSelector title="Payment Accounts" />);

    await screen.findByText("Payment Accounts");
    expect(screen.queryByText("Bank accounts")).not.toBeInTheDocument();
  });

  it("lets the caller pick a non-default account for a payout via onSelect", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT, SECONDARY_ACCOUNT]);
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<BankAccountSelector onSelect={onSelect} />);

    await screen.findByText("Banco do Brasil");
    await user.click(screen.getByRole("button", { name: "Use this account" }));

    expect(onSelect).toHaveBeenCalledWith(SECONDARY_ACCOUNT);
  });

  it("sets a non-default account as the new default", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT, SECONDARY_ACCOUNT]);
    mockSetDefaultBankAccount.mockResolvedValue({ ...SECONDARY_ACCOUNT, isDefault: true });
    const user = userEvent.setup();
    render(<BankAccountSelector />);

    await screen.findByText("Banco do Brasil");
    await user.click(screen.getByRole("button", { name: "Set as default" }));

    await waitFor(() => expect(mockSetDefaultBankAccount).toHaveBeenCalledWith("jwt-token", "ba_secondary"));
    expect(await screen.findByText("Default")).toBeInTheDocument();
    expect(await screen.findByText("Default payout account updated")).toBeInTheDocument();
  });

  it("requires confirmation before deleting an account", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT]);
    const user = userEvent.setup();
    render(<BankAccountSelector />);

    await screen.findByText("BBVA");
    await user.click(screen.getByRole("button", { name: "Delete BBVA account" }));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(mockDeleteBankAccount).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete account" }));
    await waitFor(() => expect(mockDeleteBankAccount).toHaveBeenCalledWith("jwt-token", "ba_default"));
    await waitFor(() => expect(screen.queryByText("BBVA")).not.toBeInTheDocument());
    expect(await screen.findByText("Bank account deleted")).toBeInTheDocument();
  });

  it("adds a new account through the modal, shows it in the list, and confirms via toast", async () => {
    mockListBankAccounts.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<BankAccountSelector />);

    await screen.findByText("No bank accounts yet");
    await user.click(screen.getByRole("button", { name: "Add new account" }));
    await user.click(screen.getByRole("button", { name: "mock-add-account" }));

    expect(await screen.findByText("Bancolombia")).toBeInTheDocument();
    expect(screen.getByText("Bank account added")).toBeInTheDocument();
  });
});
