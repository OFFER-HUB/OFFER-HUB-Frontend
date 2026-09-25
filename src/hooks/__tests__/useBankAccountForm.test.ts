import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBankAccountForm, maskCpfOrCnpj, maskAccountNumberByRail } from "@/hooks/useBankAccountForm";

const mockAddBankAccount = vi.fn();

vi.mock("@/lib/api/bank-accounts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/bank-accounts")>();
  return {
    ...actual,
    addBankAccount: (...args: unknown[]) => mockAddBankAccount(...args),
  };
});

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) =>
    selector({ token: "mock-token" }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Pure masking utilities ───────────────────────────────────────────────────

describe("useBankAccountForm — pure masking exports", () => {
  it("maskCpfOrCnpj formats an 11-digit CPF as 000.000.000-00", () => {
    expect(maskCpfOrCnpj("11144477735")).toBe("111.444.777-35");
  });

  it("maskCpfOrCnpj formats a 14-digit CNPJ as 00.000.000/0000-00", () => {
    expect(maskCpfOrCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("maskCpfOrCnpj strips non-digits", () => {
    expect(maskCpfOrCnpj("111.444.777-35")).toBe("111.444.777-35");
  });

  it("maskAccountNumberByRail limits CLABE to 18 digits", () => {
    expect(maskAccountNumberByRail("032180000118359719abc", "SPEI_BITSO")).toBe("032180000118359719");
  });

  it("maskAccountNumberByRail limits CBU/CVU to 22 digits", () => {
    const input = "01700992200000677975371234";
    expect(maskAccountNumberByRail(input, "TRANSFERS_BITSO")).toBe("0170099220000067797537");
  });

  it("maskAccountNumberByRail limits Pix key to 77 chars", () => {
    const longKey = "a".repeat(100);
    expect(maskAccountNumberByRail(longKey, "PIX").length).toBe(77);
  });
});

// ─── Initial state ────────────────────────────────────────────────────────────

describe("useBankAccountForm — initial state", () => {
  it("starts at step 1 with BR country and PIX rail", () => {
    const { result } = renderHook(() => useBankAccountForm());
    expect(result.current.step).toBe(1);
    expect(result.current.country).toBe("BR");
    expect(result.current.rail).toBe("PIX");
  });

  it("has no errors, no submitError, and isSubmitting=false on mount", () => {
    const { result } = renderHook(() => useBankAccountForm());
    expect(result.current.errors).toEqual({});
    expect(result.current.submitError).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("identifies PIX as isSingleRail=false for BR (multiple rails available)", () => {
    const { result } = renderHook(() => useBankAccountForm());
    // BR has PIX, PIX_SAFE, TED — not a single rail
    expect(result.current.isSingleRail).toBe(false);
    expect(result.current.isPix).toBe(true);
  });

  it("MX has only SPEI_BITSO — isSingleRail=true", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleCountryChange("MX");
    });
    expect(result.current.isSingleRail).toBe(true);
    expect(result.current.rail).toBe("SPEI_BITSO");
  });
});

// ─── Country / rail change ────────────────────────────────────────────────────

describe("useBankAccountForm — handleCountryChange", () => {
  it("resets rail to the first available rail for the new country", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleCountryChange("AR");
    });
    expect(result.current.country).toBe("AR");
    expect(result.current.rail).toBe("TRANSFERS_BITSO");
  });

  it("clears accountNumber and details on country change", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.setAccountNumber("some-key");
      result.current.handleCountryChange("MX");
    });
    expect(result.current.accountNumber).toBe("");
    expect(result.current.details).toEqual({});
  });

  it("clears errors on country change", () => {
    const { result } = renderHook(() => useBankAccountForm());
    // Trigger step-1 validation to produce errors
    act(() => {
      result.current.handleContinue();
    });
    // Then change country — errors should clear
    act(() => {
      result.current.handleCountryChange("MX");
    });
    expect(result.current.errors).toEqual({});
  });
});

describe("useBankAccountForm — handleRailChange", () => {
  it("updates the active rail and clears details", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleRailChange("TED");
    });
    expect(result.current.rail).toBe("TED");
    expect(result.current.details).toEqual({});
  });
});

// ─── Step navigation ──────────────────────────────────────────────────────────

describe("useBankAccountForm — step navigation", () => {
  it("advances to step 2 when country and rail are set", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleContinue();
    });
    expect(result.current.step).toBe(2);
  });

  it("handleBack returns to step 1 from step 2", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleContinue();
    });
    expect(result.current.step).toBe(2);
    act(() => {
      result.current.handleBack();
    });
    expect(result.current.step).toBe(1);
  });
});

// ─── Step-2 validation ────────────────────────────────────────────────────────

describe("useBankAccountForm — step 2 validation", () => {
  function advanceToStep2(result: ReturnType<typeof useBankAccountForm>) {
    result.handleContinue();
  }

  it("blocks submit when accountNumber, bankName, and holderName are empty", async () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => advanceToStep2(result.current));

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.errors.accountNumber).toBeTruthy();
    expect(result.current.errors.bankName).toBeTruthy();
    expect(result.current.errors.holderName).toBeTruthy();
    expect(mockAddBankAccount).not.toHaveBeenCalled();
  });

  it("blocks submit for MX when CLABE is not exactly 18 digits", async () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleCountryChange("MX");
      advanceToStep2(result.current);
      result.current.setAccountNumber("12345"); // too short
      result.current.setBankName("BBVA");
      result.current.setHolderName("Jane Doe");
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });
    expect(result.current.errors.accountNumber).toMatch(/18/);
  });

  it("blocks submit for AR when CBU/CVU is not exactly 22 digits", async () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleCountryChange("AR");
      advanceToStep2(result.current);
      result.current.setAccountNumber("123"); // too short
      result.current.setBankName("Galicia");
      result.current.setHolderName("Juan Perez");
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });
    expect(result.current.errors.accountNumber).toMatch(/22/);
  });
});

// ─── handleDetailChange ───────────────────────────────────────────────────────

describe("useBankAccountForm — handleDetailChange", () => {
  it("stores the value for a given detail key", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleDetailChange("ach_cop_bank_code", "007");
    });
    expect(result.current.details["ach_cop_bank_code"]).toBe("007");
  });

  it("applies CPF/CNPJ masking for keys containing cpf_cnpj", () => {
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleDetailChange("pix_safe_cpf_cnpj", "11144477735");
    });
    expect(result.current.details["pix_safe_cpf_cnpj"]).toBe("111.444.777-35");
  });
});

// ─── Successful submit ────────────────────────────────────────────────────────

describe("useBankAccountForm — successful submit", () => {
  it("calls addBankAccount with correct payload and invokes onSuccess", async () => {
    const newAccount = {
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
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    mockAddBankAccount.mockResolvedValue(newAccount);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useBankAccountForm({ onSuccess }));
    act(() => {
      result.current.handleCountryChange("MX");
      result.current.handleContinue();
      result.current.setAccountNumber("032180000118359719");
      result.current.setBankName("BBVA");
      result.current.setHolderName("Jane Doe");
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(mockAddBankAccount).toHaveBeenCalledWith(
      "mock-token",
      expect.objectContaining({
        country: "MX",
        rail: "SPEI_BITSO",
        accountNumber: "032180000118359719",
        bankName: "BBVA",
      })
    );
    expect(onSuccess).toHaveBeenCalledWith(newAccount);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("sets submitError when addBankAccount rejects", async () => {
    mockAddBankAccount.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useBankAccountForm());
    act(() => {
      result.current.handleCountryChange("MX");
      result.current.handleContinue();
      result.current.setAccountNumber("032180000118359719");
      result.current.setBankName("BBVA");
      result.current.setHolderName("Jane Doe");
    });

    const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.submitError).toBe("Network error");
    expect(result.current.isSubmitting).toBe(false);
  });
});
