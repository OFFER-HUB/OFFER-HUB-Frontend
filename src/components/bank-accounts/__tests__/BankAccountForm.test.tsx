import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BankAccountForm } from "@/components/bank-accounts/BankAccountForm";

const mockAddBankAccount = vi.fn();

vi.mock("@/lib/api/bank-accounts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/bank-accounts")>();
  return {
    ...actual,
    addBankAccount: (...args: unknown[]) => mockAddBankAccount(...args),
  };
});

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) => selector({ token: "jwt-token" }),
}));

const NEW_ACCOUNT = {
  id: "ba_1",
  userId: "usr_1",
  country: "MX",
  rail: "SPEI_BITSO",
  accountNumber: "032180000118359719",
  bankName: "BBVA",
  holderName: "Jane Doe",
  blindpayBankAccountId: null,
  isDefault: false,
  details: { spei_protocol: "clabe" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BankAccountForm", () => {
  it("defaults to the first corridor's country and rail", () => {
    render(<BankAccountForm />);
    expect(screen.getByLabelText("Country")).toHaveValue("BR");
    expect(screen.getByLabelText("Payout method")).toHaveValue("PIX");
  });

  it("updates the rail options when the country changes", async () => {
    const user = userEvent.setup();
    render(<BankAccountForm />);

    await user.selectOptions(screen.getByLabelText("Country"), "MX");

    const railSelect = screen.getByLabelText("Payout method") as HTMLSelectElement;
    expect(railSelect).toHaveValue("SPEI_BITSO");
    expect(Array.from(railSelect.options).map((o) => o.value)).toEqual(["SPEI_BITSO"]);
  });

  it("shows rail-specific detail fields in step 2 and requires them", async () => {
    const user = userEvent.setup();
    render(<BankAccountForm />);

    await user.selectOptions(screen.getByLabelText("Country"), "BR");
    await user.selectOptions(screen.getByLabelText("Payout method"), "PIX_SAFE");

    await user.click(screen.getByRole("button", { name: "Continue to Details" }));

    expect(screen.getByLabelText("Account Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Pix Safe Bank Code")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add bank account" }));

    expect(await screen.findByText("Enter account type")).toBeInTheDocument();
    expect(mockAddBankAccount).not.toHaveBeenCalled();
  });

  it("blocks submission and reports errors when required fields are empty in step 2", async () => {
    const user = userEvent.setup();
    render(<BankAccountForm />);

    await user.click(screen.getByRole("button", { name: "Continue to Details" }));

    await user.click(screen.getByRole("button", { name: "Add bank account" }));

    expect(await screen.findByText("Enter your Pix key")).toBeInTheDocument();
    expect(screen.getByText("Enter the bank name")).toBeInTheDocument();
    expect(screen.getByText("Enter the account holder's name")).toBeInTheDocument();
    expect(mockAddBankAccount).not.toHaveBeenCalled();
  });

  it("submits a valid account and reports the created account", async () => {
    mockAddBankAccount.mockResolvedValue(NEW_ACCOUNT);
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<BankAccountForm onSuccess={onSuccess} />);

    // Step 1: Select Country and Rail
    await user.selectOptions(screen.getByLabelText("Country"), "MX");
    await user.click(screen.getByRole("button", { name: "Continue to Details" }));

    // Step 2: Fill Account Details
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    await user.type(screen.getByLabelText("CLABE"), "032180000118359719");
    await user.type(screen.getByLabelText("Bank name"), "BBVA");
    await user.type(screen.getByLabelText("Account holder name"), "Jane Doe");
    await user.click(screen.getByLabelText("Set as default payout account"));

    await user.click(screen.getByRole("button", { name: "Add bank account" }));

    await waitFor(() =>
      expect(mockAddBankAccount).toHaveBeenCalledWith(
        "jwt-token",
        expect.objectContaining({
          country: "MX",
          rail: "SPEI_BITSO",
          accountNumber: "032180000118359719",
          bankName: "BBVA",
          holderName: "Jane Doe",
          isDefault: true,
          details: { spei_protocol: "clabe" },
        })
      )
    );
    expect(onSuccess).toHaveBeenCalledWith(NEW_ACCOUNT);
  });

  it("requires and submits the full beneficiary/document set for Colombia (ACH)", async () => {
    // Reported live: registering a Colombian account with just the generic
    // fields failed on BlindPay's side with an opaque "internal_error" —
    // their schema requires these six fields for ach_cop_bitso specifically.
    mockAddBankAccount.mockResolvedValue({ ...NEW_ACCOUNT, country: "CO", rail: "ACH_COP_BITSO" });
    const user = userEvent.setup();
    render(<BankAccountForm />);

    await user.selectOptions(screen.getByLabelText("Country"), "CO");
    await user.click(screen.getByRole("button", { name: "Continue to Details" }));

    await user.type(screen.getByLabelText("Account number"), "12345678901");
    await user.type(screen.getByLabelText("Bank name"), "Bancolombia");
    await user.type(screen.getByLabelText("Account holder name"), "Andres Marin");

    // Missing detail fields block submission first.
    await user.click(screen.getByRole("button", { name: "Add bank account" }));
    expect(await screen.findByText("Enter beneficiary first name")).toBeInTheDocument();
    expect(mockAddBankAccount).not.toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText("Account Type"), "savings");
    await user.type(screen.getByLabelText("Beneficiary first name"), "Andres");
    await user.type(screen.getByLabelText("Beneficiary last name"), "Marin");
    await user.selectOptions(screen.getByLabelText("Document type"), "CC");
    await user.type(screen.getByLabelText("Document number"), "1661105408");
    await user.type(screen.getByLabelText("Beneficiary email"), "andres@example.com");
    await user.type(screen.getByLabelText("Bank code"), "007");

    await user.click(screen.getByRole("button", { name: "Add bank account" }));

    await waitFor(() =>
      expect(mockAddBankAccount).toHaveBeenCalledWith(
        "jwt-token",
        expect.objectContaining({
          country: "CO",
          rail: "ACH_COP_BITSO",
          details: {
            account_type: "savings",
            ach_cop_beneficiary_first_name: "Andres",
            ach_cop_beneficiary_last_name: "Marin",
            ach_cop_document_type: "CC",
            ach_cop_document_id: "1661105408",
            ach_cop_email: "andres@example.com",
            ach_cop_bank_code: "007",
          },
        })
      )
    );
  });

  it("allows navigating back to step 1 via Previous button", async () => {
    const user = userEvent.setup();
    render(<BankAccountForm />);

    await user.click(screen.getByRole("button", { name: "Continue to Details" }));
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
  });

  it("cancels form from step 1 when onCancel is provided", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<BankAccountForm onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
