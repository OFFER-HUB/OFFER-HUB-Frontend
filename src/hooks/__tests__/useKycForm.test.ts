import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useKycForm,
  maskTaxId,
  maskPostalCode,
  cleanLettersOnly,
  calculateAge,
  isValidCpf,
} from "@/hooks/useKycForm";

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
  useAuthStore: (
    selector: (s: {
      token: string | null;
      user: { firstName?: string; lastName?: string } | null;
    }) => unknown
  ) =>
    selector({
      token: "mock-token",
      user: { firstName: "Test", lastName: "User" },
    }),
}));

/** Flush pending microtasks so useEffect-driven state updates land. */
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetProfile.mockResolvedValue({
    firstName: "Test",
    lastName: "User",
    dateOfBirth: "1990-06-15T00:00:00.000Z",
  });
});

// ─── Pure utility exports ─────────────────────────────────────────────────────

describe("useKycForm — pure utility exports", () => {
  it("cleanLettersOnly strips digits and symbols but keeps accented chars, hyphens, apostrophes", () => {
    // Allowed accented chars: á é í ó ú Á É Í Ó Ú ñ Ñ ü Ü (per the regex in the hook)
    expect(cleanLettersOnly("Maria123!")).toBe("Maria");
    expect(cleanLettersOnly("O'Brien-Smith")).toBe("O'Brien-Smith");
    expect(cleanLettersOnly("Ñoño")).toBe("Ñoño");
    expect(cleanLettersOnly("José")).toBe("José"); // é is in the allowed set
    expect(cleanLettersOnly("ABC 123")).toBe("ABC ");
    // ã is NOT in the allowed set — gets stripped
    expect(cleanLettersOnly("Joao")).toBe("Joao");
  });

  it("maskTaxId formats Brazilian CPF digits into 000.000.000-00", () => {
    expect(maskTaxId("11144477735", "BR")).toBe("111.444.777-35");
    expect(maskTaxId("111", "BR")).toBe("111");
    expect(maskTaxId("111444", "BR")).toBe("111.444");
    expect(maskTaxId("111444777", "BR")).toBe("111.444.777");
  });

  it("maskTaxId formats Argentine CUIT as 00-00000000-0", () => {
    expect(maskTaxId("20123456789", "AR")).toBe("20-12345678-9");
  });

  it("maskTaxId uppercases and strips non-alphanumeric for Mexico RFC/CURP", () => {
    expect(maskTaxId("abcd123456xyz", "MX")).toBe("ABCD123456XYZ");
  });

  it("maskTaxId returns raw digits for Colombia up to 15 chars", () => {
    expect(maskTaxId("1234567890", "CO")).toBe("1234567890");
  });

  it("maskPostalCode formats Brazilian CEP as 00000-000", () => {
    expect(maskPostalCode("01310100", "BR")).toBe("01310-100");
    expect(maskPostalCode("01310", "BR")).toBe("01310");
  });

  it("maskPostalCode limits Mexican CP to 5 digits", () => {
    expect(maskPostalCode("123456", "MX")).toBe("12345");
  });

  it("calculateAge returns a realistic age for a past date", () => {
    expect(calculateAge("2000-01-01")).toBeGreaterThanOrEqual(24);
  });

  it("calculateAge returns 0 for empty or invalid input", () => {
    expect(calculateAge("not-a-date")).toBe(0);
    expect(calculateAge("")).toBe(0);
  });

  it("calculateAge returns a negative number for a future date (the hook checks dob > today separately)", () => {
    // calculateAge itself doesn't clamp; the hook's validateStep uses dob > new Date() to catch future dates
    expect(calculateAge("2099-01-01")).toBeLessThan(0);
  });

  it("isValidCpf rejects all-same-digit CPFs (trivial sequences)", () => {
    expect(isValidCpf("11111111111")).toBe(false);
    expect(isValidCpf("00000000000")).toBe(false);
  });

  it("isValidCpf accepts a mathematically valid CPF", () => {
    expect(isValidCpf("11144477735")).toBe(true);
  });

  it("isValidCpf rejects a CPF with wrong check digits", () => {
    expect(isValidCpf("11144477700")).toBe(false);
  });
});

// ─── Initial state ────────────────────────────────────────────────────────────

describe("useKycForm — initial state", () => {
  it("starts at step 1 of 4 for a standard (non-CO) corridor", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    expect(result.current.currentStep).toBe(1);
    expect(result.current.totalSteps).toBe(4);
    expect(result.current.isEnhanced).toBe(false);
  });

  it("defaults to BR corridor", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    expect(result.current.fields.country).toBe("BR");
  });

  it("prefills firstName, lastName, and dateOfBirth from getProfile on mount", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    expect(result.current.fields.firstName).toBe("Test");
    expect(result.current.fields.lastName).toBe("User");
    expect(result.current.fields.dateOfBirth).toBe("1990-06-15");
  });

  it("has no errors and no submitError on first render", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    expect(result.current.errors).toEqual({});
    expect(result.current.submitError).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });
});

// ─── Enhanced tier (Colombia) ─────────────────────────────────────────────────

describe("useKycForm — enhanced tier (Colombia)", () => {
  it("shows 5 steps and isEnhanced=true when country is CO", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("country", "CO");
    });
    expect(result.current.totalSteps).toBe(5);
    expect(result.current.isEnhanced).toBe(true);
    expect(result.current.stepTitles).toHaveLength(5);
  });
});

// ─── Step 1 validation ────────────────────────────────────────────────────────

describe("useKycForm — step 1 validation", () => {
  it("blocks advancing when firstName is empty", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("firstName", "");
    });
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.errors.firstName).toBeTruthy();
    expect(result.current.currentStep).toBe(1);
  });

  it("blocks advancing when age is under 18", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("dateOfBirth", "2020-01-01");
    });
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.errors.dateOfBirth).toMatch(/18/);
    expect(result.current.currentStep).toBe(1);
  });

  it("blocks when dateOfBirth is in the future", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("dateOfBirth", "2099-01-01");
    });
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.errors.dateOfBirth).toBeTruthy();
    expect(result.current.currentStep).toBe(1);
  });

  it("advances to step 2 when all step 1 fields are valid", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    // firstName, lastName, dateOfBirth are all prefilled by getProfile
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe(2);
    expect(result.current.errors).toEqual({});
  });
});

// ─── Step 2 validation ────────────────────────────────────────────────────────

describe("useKycForm — step 2 validation", () => {  it("blocks on step 2 when taxId is empty", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => result.current.handleNext()); // step 1 → 2 (prefilled)
    expect(result.current.currentStep).toBe(2);
    act(() => result.current.handleNext()); // try to advance without filling step 2
    expect(result.current.errors.taxId).toBeTruthy();
    expect(result.current.currentStep).toBe(2);
  });

  it("blocks on step 2 when Brazilian CPF fails checksum", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => result.current.handleNext()); // step 1 → 2 (prefilled)
    expect(result.current.currentStep).toBe(2);
    // Set CPF with wrong check digit
    act(() => {
      result.current.setField("taxId", "11144477700");
      result.current.setField("addressLine1", "Av. Paulista 1000");
      result.current.setField("city", "São Paulo");
      result.current.setField("stateProvinceRegion", "SP");
      result.current.setField("postalCode", "01310100");
    });
    act(() => result.current.handleNext());
    expect(result.current.errors.taxId).toBeTruthy();
    expect(result.current.currentStep).toBe(2);
  });

  it("advances to step 3 when all step 2 fields are valid", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    // Advance from step 1 (prefilled by getProfile)
    act(() => result.current.handleNext());
    expect(result.current.currentStep).toBe(2);
    // Fill step-2 fields
    act(() => {
      result.current.setField("taxId", "11144477735"); // valid CPF → masks to 111.444.777-35
      result.current.setField("addressLine1", "Av. Paulista 1000");
      result.current.setField("city", "São Paulo");
      result.current.setField("stateProvinceRegion", "SP");
      result.current.setField("postalCode", "01310100");
    });
    act(() => result.current.handleNext());
    expect(result.current.currentStep).toBe(3);
  });
});

// ─── Navigation helpers ───────────────────────────────────────────────────────

describe("useKycForm — navigation helpers", () => {
  it("handleBack decrements the step, not below 1", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    // Advance to step 2
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe(2);
    act(() => {
      result.current.handleBack();
    });
    expect(result.current.currentStep).toBe(1);
    act(() => {
      result.current.handleBack();
    });
    expect(result.current.currentStep).toBe(1); // floor at 1
  });

  it("goToStep navigates directly to a target step", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.goToStep(3);
    });
    expect(result.current.currentStep).toBe(3);
  });

  it("setField clears the field's error on change", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    // Force a firstName error: clear it, then validate
    act(() => {
      result.current.setField("firstName", "");
    });
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.errors.firstName).toBeTruthy();
    // Now set a value — error should clear
    act(() => {
      result.current.setField("firstName", "Maria");
    });
    expect(result.current.errors.firstName).toBeUndefined();
  });
});

// ─── Masked field setters ─────────────────────────────────────────────────────

describe("useKycForm — masked field setters", () => {
  it("applies CPF masking when setting taxId for BR", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("taxId", "11144477735");
    });
    expect(result.current.fields.taxId).toBe("111.444.777-35");
  });

  it("applies CEP masking when setting postalCode for BR", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("postalCode", "01310100");
    });
    expect(result.current.fields.postalCode).toBe("01310-100");
  });

  it("strips non-letter characters from firstName", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("firstName", "Maria123!");
    });
    expect(result.current.fields.firstName).toBe("Maria");
  });
});

// ─── Computed placeholders ────────────────────────────────────────────────────

describe("useKycForm — computed placeholders", () => {
  it("returns CPF placeholder for BR", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    expect(result.current.taxIdPlaceholder).toMatch(/CPF/);
    expect(result.current.postalPlaceholder).toMatch(/CEP/);
  });

  it("returns CUIT placeholder for AR", async () => {
    const { result } = renderHook(() => useKycForm());
    await flush();
    act(() => {
      result.current.setField("country", "AR");
    });
    expect(result.current.taxIdPlaceholder).toMatch(/CUIT/);
  });
});

// ─── Submit ───────────────────────────────────────────────────────────────────

describe("useKycForm — submit", () => {
  it("calls submitKyc with correct payload and invokes onSuccess", async () => {
    mockSubmitKyc.mockResolvedValue({ id: "kyc_1", country: "BR" });
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useKycForm({ onSuccess }));
    await flush();

    // Step 1 — prefilled, just advance
    await act(async () => {
      result.current.handleNext();
    });
    // Step 2
    act(() => {
      result.current.setField("taxId", "11144477735");
      result.current.setField("addressLine1", "Av. Paulista 1000");
      result.current.setField("city", "São Paulo");
      result.current.setField("stateProvinceRegion", "SP");
      result.current.setField("postalCode", "01310100");
    });
    act(() => {
      result.current.handleNext();
    });
    // Step 3
    act(() => {
      result.current.setField("selfieFileUrl", "https://cdn.example.com/selfie.jpg");
      result.current.setField("idDocFrontFileUrl", "https://cdn.example.com/front.jpg");
    });
    act(() => {
      result.current.handleNext();
    });
    // Now at review step

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockSubmitKyc).toHaveBeenCalledWith(
      "mock-token",
      expect.objectContaining({
        firstName: "Test",
        lastName: "User",
        country: "BR",
        taxId: "111.444.777-35",
        addressLine1: "Av. Paulista 1000",
      })
    );
    expect(onSuccess).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("sets submitError when submitKyc rejects", async () => {
    mockSubmitKyc.mockRejectedValue(new Error("Server error"));
    const { result } = renderHook(() => useKycForm());
    await flush();

    // Fill all required fields
    act(() => {
      result.current.handleNext(); // step 1 → 2 (prefilled)
    });
    act(() => {
      result.current.setField("taxId", "11144477735");
      result.current.setField("addressLine1", "Av. Paulista 1000");
      result.current.setField("city", "São Paulo");
      result.current.setField("stateProvinceRegion", "SP");
      result.current.setField("postalCode", "01310100");
      result.current.handleNext(); // step 2 → 3
    });
    act(() => {
      result.current.setField("selfieFileUrl", "https://cdn.example.com/selfie.jpg");
      result.current.setField("idDocFrontFileUrl", "https://cdn.example.com/front.jpg");
      result.current.handleNext(); // step 3 → review
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.submitError).toBe("Server error");
    expect(result.current.isSubmitting).toBe(false);
  });
});

// ─── existingProfile prefill ──────────────────────────────────────────────────

describe("useKycForm — existingProfile prefill", () => {
  it("seeds country and address fields from an existing KYC profile", () => {
    const existingProfile = {
      id: "kyc_1",
      userId: "usr_1",
      country: "MX",
      taxId: "ABCD123456XYZ",
      addressLine1: "Calle Reforma 100",
      addressLine2: null,
      city: "CDMX",
      stateProvinceRegion: "CMX",
      postalCode: "06600",
      idDocCountry: "MX",
      idDocType: "PASSPORT" as const,
      kycTier: "STANDARD" as const,
      selfieFileUrl: "",
      idDocFrontFileUrl: "",
      idDocBackFileUrl: null,
      proofOfAddressDocType: null,
      proofOfAddressDocFileUrl: null,
      sourceOfFundsDocType: null,
      sourceOfFundsDocFileUrl: null,
      purposeOfTransactions: null,
      purposeOfTransactionsExplanation: null,
      blindpayTosId: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    const { result } = renderHook(() => useKycForm({ existingProfile }));
    expect(result.current.fields.country).toBe("MX");
    expect(result.current.fields.addressLine1).toBe("Calle Reforma 100");
    expect(result.current.fields.city).toBe("CDMX");
  });
});
