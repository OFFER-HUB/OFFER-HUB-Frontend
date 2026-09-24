import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KycForm, cleanLettersOnly, maskTaxId, maskPostalCode, calculateAge } from "@/components/kyc/KycForm";

const mockSubmitKyc = vi.fn();
const mockGetProfile = vi.fn();

vi.mock("@/lib/api/kyc", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/kyc")>();
  return {
    ...actual,
    submitKyc: (...args: unknown[]) => mockSubmitKyc(...args),
  };
});

vi.mock("@/lib/api/profile", () => ({
  getProfile: (...args: unknown[]) => mockGetProfile(...args),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null; user: { firstName?: string; lastName?: string } | null }) => unknown) =>
    selector({
      token: "mock-jwt-token",
      user: { firstName: "Test", lastName: "User" },
    }),
}));

// Mock KycFileUploadField to keep file inputs test-friendly
vi.mock("@/components/kyc/KycFileUploadField", () => ({
  KycFileUploadField: ({
    label,
    value,
    onChange,
    error,
  }: {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    error?: string;
  }) => (
    <div data-testid={`upload-${label}`}>
      <span>{label}</span>
      <button type="button" onClick={() => onChange(`https://example.com/${label.replace(/\s+/g, "_").toLowerCase()}.jpg`)}>
        Upload {label}
      </button>
      {value && <span data-testid={`value-${label}`}>{value}</span>}
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetProfile.mockResolvedValue({
    firstName: "Test",
    lastName: "User",
    dateOfBirth: "1995-05-15T00:00:00.000Z",
  });
});

describe("KycForm Utilities", () => {
  it("filters non-letter characters correctly", () => {
    expect(cleanLettersOnly("John 123 Doe!@#")).toBe("John  Doe");
    expect(cleanLettersOnly("José-María O'Connor")).toBe("José-María O'Connor");
  });

  it("applies country tax ID masks accurately", () => {
    expect(maskTaxId("12345678901", "BR")).toBe("123.456.789-01");
    expect(maskTaxId("20123456789", "AR")).toBe("20-12345678-9");
    expect(maskTaxId("abcd123456xyz", "MX")).toBe("ABCD123456XYZ");
    expect(maskTaxId("1234567890", "CO")).toBe("1234567890");
  });

  it("applies country postal code masks accurately", () => {
    expect(maskPostalCode("01310100", "BR")).toBe("01310-100");
    expect(maskPostalCode("123456", "MX")).toBe("12345");
    expect(maskPostalCode("110111", "CO")).toBe("110111");
  });

  it("calculates age correctly", () => {
    expect(calculateAge("2000-01-01")).toBeGreaterThanOrEqual(24);
    expect(calculateAge("2020-01-01")).toBeLessThan(18);
  });
});

describe("KycForm Wizard Navigation & Validation", () => {
  it("renders Step 1 with the 4 supported corridors and initial fields", async () => {
    render(<KycForm />);

    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Personal Details")).toBeInTheDocument();
    expect(screen.getByText("Brazil")).toBeInTheDocument();
    expect(screen.getByText("Mexico")).toBeInTheDocument();
    expect(screen.getByText("Argentina")).toBeInTheDocument();
    expect(screen.getByText("Colombia")).toBeInTheDocument();
  });

  it("dynamically shows 5 steps and enhanced notice when Colombia is selected", async () => {
    const user = userEvent.setup();
    render(<KycForm />);

    await user.click(screen.getByText("Colombia"));

    expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    expect(screen.getByText(/Colombia Enhanced Verification/)).toBeInTheDocument();
  });

  it("blocks advancing from Step 1 with empty fields or age under 18", async () => {
    const user = userEvent.setup();
    render(<KycForm />);

    // Wait for initial profile load
    await waitFor(() => expect(mockGetProfile).toHaveBeenCalled());

    // Clear first name
    const firstNameInput = screen.getByLabelText("First Name");
    await user.clear(firstNameInput);

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();

    // Fill valid name but invalid DOB (under 18)
    await user.type(firstNameInput, "Carlos");
    const dobInput = screen.getByLabelText("Date of Birth");
    await user.clear(dobInput);
    await user.type(dobInput, "2020-01-01");

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByText("You must be at least 18 years old to complete verification")).toBeInTheDocument();
  });

  it("navigates through Brazil flow (4 steps) and submits data", async () => {
    mockSubmitKyc.mockResolvedValue({ id: "kyc_1" });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<KycForm onSuccess={onSuccess} />);

    // Wait for getProfile
    await waitFor(() => expect(mockGetProfile).toHaveBeenCalled());

    // --- Step 1: Personal Details ---
    const firstNameInput = screen.getByLabelText("First Name");
    const lastNameInput = screen.getByLabelText("Last Name");
    const dobInput = screen.getByLabelText("Date of Birth");

    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Maria");
    await user.clear(lastNameInput);
    await user.type(lastNameInput, "Silva");
    await user.clear(dobInput);
    await user.type(dobInput, "1990-01-01");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    // --- Step 2: Address & Tax ---
    expect(await screen.findByText("Step 2 of 4")).toBeInTheDocument();
    const taxIdInput = screen.getByLabelText(/Tax ID/);
    const addressInput = screen.getByLabelText("Street Address");
    const cityInput = screen.getByLabelText("City");
    const stateInput = screen.getByLabelText("State / Province");
    const postalInput = screen.getByLabelText("Postal Code");

    await user.type(taxIdInput, "11144477735");
    await user.type(addressInput, "Av. Paulista 1000");
    await user.type(cityInput, "Sao Paulo");
    await user.type(stateInput, "SP");
    await user.type(postalInput, "01310100");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    // --- Step 3: Identity Verification ---
    expect(await screen.findByText("Step 3 of 4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Upload Selfie Photo" }));
    await user.click(screen.getByRole("button", { name: "Upload Document Front Side" }));
    await user.click(screen.getByRole("button", { name: "Upload Document Back Side" }));

    await user.click(screen.getByRole("button", { name: "Continue" }));

    // --- Step 4: Review & Submit ---
    expect(await screen.findByText("Step 4 of 4")).toBeInTheDocument();
    expect(screen.getByText("Review & Submit")).toBeInTheDocument();
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("Av. Paulista 1000, Sao Paulo, SP")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit Verification" }));

    await waitFor(() => {
      expect(mockSubmitKyc).toHaveBeenCalledWith(
        "mock-jwt-token",
        expect.objectContaining({
          firstName: "Maria",
          lastName: "Silva",
          country: "BR",
          taxId: "111.444.777-35",
        })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("allows jumping back to edit a section from the review step", async () => {
    const user = userEvent.setup();
    render(<KycForm />);

    await waitFor(() => expect(mockGetProfile).toHaveBeenCalled());

    // Step 1
    const dobInput = screen.getByLabelText("Date of Birth");
    await user.clear(dobInput);
    await user.type(dobInput, "1992-03-10");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Step 2
    expect(await screen.findByText("Step 2 of 4")).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Tax ID/), "11144477735");
    await user.type(screen.getByLabelText("Street Address"), "Test Street 123");
    await user.type(screen.getByLabelText("City"), "City");
    await user.type(screen.getByLabelText("State / Province"), "State");
    await user.type(screen.getByLabelText("Postal Code"), "01310100");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Step 3
    expect(await screen.findByText("Step 3 of 4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Upload Selfie Photo" }));
    await user.click(screen.getByRole("button", { name: "Upload Document Front Side" }));
    await user.click(screen.getByRole("button", { name: "Upload Document Back Side" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    // Review step
    expect(await screen.findByText("Step 4 of 4")).toBeInTheDocument();

    // Click edit on Address & Tax (Section 2)
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await user.click(editButtons[1]); // Section 2

    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Street 123")).toBeInTheDocument();
  });
});
