import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBankAccounts } from "@/hooks/useBankAccounts";
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
  useAuthStore: (selector: (s: { token: string | null }) => unknown) =>
    selector({ token: "mock-token" }),
}));

/** Flush pending microtasks (resolved-promise chains from useEffect fetches). */
async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

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
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const SECONDARY_ACCOUNT: BankAccount = {
  id: "ba_secondary",
  userId: "usr_1",
  country: "BR",
  rail: "PIX",
  accountNumber: "00012345-6",
  bankName: "Nubank",
  holderName: "Jane Doe",
  blindpayBankAccountId: "bp_2",
  isDefault: false,
  details: { pix_key: "jane@example.com" },
  createdAt: "2026-01-02T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetMyKyc.mockResolvedValue({
    id: "kyc_1",
    country: "MX",
    blindpayTosId: "tos_approved",
  });
  mockListBankAccounts.mockResolvedValue([]);
});

// ─── KYC gate ─────────────────────────────────────────────────────────────────

describe("useBankAccounts — KYC gate", () => {
  it("isKycApproved=false and isCheckingKyc=true on initial render when no props passed", () => {
    const { result } = renderHook(() => useBankAccounts());
    expect(result.current.isCheckingKyc).toBe(true);
    expect(result.current.isKycApproved).toBe(false);
  });

  it("resolves isKycApproved=true once KYC profile with blindpayTosId loads", async () => {
    const { result } = renderHook(() => useBankAccounts());
    await flush();
    expect(result.current.isCheckingKyc).toBe(false);
    expect(result.current.isKycApproved).toBe(true);
  });

  it("resolves isKycApproved=false and isKycPending=true when blindpayTosId is null", async () => {
    mockGetMyKyc.mockResolvedValue({ id: "kyc_co", country: "CO", blindpayTosId: null });
    const { result } = renderHook(() => useBankAccounts());
    await flush();
    expect(result.current.isKycApproved).toBe(false);
    expect(result.current.isKycPending).toBe(true);
  });

  it("resolves isKycApproved=false when getMyKyc returns null (no KYC submitted)", async () => {
    mockGetMyKyc.mockResolvedValue(null);
    const { result } = renderHook(() => useBankAccounts());
    await flush();
    expect(result.current.isKycApproved).toBe(false);
    expect(result.current.isKycPending).toBe(false);
  });

  it("uses the propIsKycApproved override without fetching KYC", async () => {
    const { result } = renderHook(() =>
      useBankAccounts({ isKycApproved: true })
    );
    // Should not call getMyKyc at all
    expect(mockGetMyKyc).not.toHaveBeenCalled();
    expect(result.current.isKycApproved).toBe(true);
    expect(result.current.isCheckingKyc).toBe(false);
  });

  it("uses the propKycProfile without fetching KYC", async () => {
    const profile = { id: "kyc_1", blindpayTosId: "tos_123" } as import("@/lib/api/kyc").KycProfile;
    const { result } = renderHook(() =>
      useBankAccounts({ kycProfile: profile })
    );
    expect(mockGetMyKyc).not.toHaveBeenCalled();
    expect(result.current.isKycApproved).toBe(true);
  });
});

// ─── Account list fetching ────────────────────────────────────────────────────

describe("useBankAccounts — account list", () => {
  it("accounts is null before the fetch resolves", () => {
    const { result } = renderHook(() => useBankAccounts());
    expect(result.current.accounts).toBeNull();
  });

  it("populates accounts after the list fetch resolves", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT, SECONDARY_ACCOUNT]);
    const { result } = renderHook(() => useBankAccounts());
    await flush();
    expect(result.current.accounts).toHaveLength(2);
    expect(result.current.accounts?.[0].id).toBe("ba_default");
  });

  it("sets loadError when listBankAccounts rejects", async () => {
    mockListBankAccounts.mockRejectedValue(new Error("Network failure"));
    const { result } = renderHook(() => useBankAccounts());
    await flush();
    expect(result.current.loadError).toBe("Network failure");
  });
});

// ─── Add modal ────────────────────────────────────────────────────────────────

describe("useBankAccounts — add modal", () => {
  it("isAddModalOpen starts false; openAddModal sets it true", () => {
    const { result } = renderHook(() => useBankAccounts());
    expect(result.current.isAddModalOpen).toBe(false);
    act(() => {
      result.current.openAddModal();
    });
    expect(result.current.isAddModalOpen).toBe(true);
  });

  it("closeAddModal sets isAddModalOpen back to false", () => {
    const { result } = renderHook(() => useBankAccounts());
    act(() => {
      result.current.openAddModal();
      result.current.closeAddModal();
    });
    expect(result.current.isAddModalOpen).toBe(false);
  });

  it("handleAdded prepends the new account, closes the modal, and shows a success toast", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT]);
    const { result } = renderHook(() => useBankAccounts());
    await flush();

    act(() => {
      result.current.openAddModal();
    });

    const newAccount: BankAccount = {
      ...SECONDARY_ACCOUNT,
      id: "ba_new",
    };

    act(() => {
      result.current.handleAdded(newAccount);
    });

    expect(result.current.isAddModalOpen).toBe(false);
    expect(result.current.accounts?.[0].id).toBe("ba_new");
    expect(result.current.toast?.type).toBe("success");
  });

  it("handleAdded marks all existing accounts as non-default when new account is default", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT]);
    const { result } = renderHook(() => useBankAccounts());
    await flush();

    const newDefaultAccount: BankAccount = {
      ...SECONDARY_ACCOUNT,
      id: "ba_new_default",
      isDefault: true,
    };

    act(() => {
      result.current.handleAdded(newDefaultAccount);
    });

    const existingAccount = result.current.accounts?.find(
      (a) => a.id === "ba_default"
    );
    expect(existingAccount?.isDefault).toBe(false);
  });
});

// ─── Set default ──────────────────────────────────────────────────────────────

describe("useBankAccounts — handleSetDefault", () => {
  it("calls setDefaultBankAccount, updates the list, shows toast", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT, SECONDARY_ACCOUNT]);
    mockSetDefaultBankAccount.mockResolvedValue({ ...SECONDARY_ACCOUNT, isDefault: true });
    const { result } = renderHook(() => useBankAccounts());
    await flush();

    await act(async () => {
      await result.current.handleSetDefault(SECONDARY_ACCOUNT);
    });

    expect(mockSetDefaultBankAccount).toHaveBeenCalledWith("mock-token", "ba_secondary");
    const secondary = result.current.accounts?.find((a) => a.id === "ba_secondary");
    expect(secondary?.isDefault).toBe(true);
    expect(result.current.toast?.type).toBe("success");
  });

  it("sets actionError and toast on failure", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT, SECONDARY_ACCOUNT]);
    mockSetDefaultBankAccount.mockRejectedValue(new Error("API error"));
    const { result } = renderHook(() => useBankAccounts());
    await flush();

    await act(async () => {
      await result.current.handleSetDefault(SECONDARY_ACCOUNT);
    });

    expect(result.current.actionError).toBe("API error");
    expect(result.current.toast?.type).toBe("error");
    expect(result.current.busyId).toBeNull();
  });
});

// ─── Delete modal ─────────────────────────────────────────────────────────────

describe("useBankAccounts — delete modal", () => {
  it("openDeleteModal sets pendingDelete; closeDeleteModal clears it", () => {
    const { result } = renderHook(() => useBankAccounts());
    act(() => {
      result.current.openDeleteModal(DEFAULT_ACCOUNT);
    });
    expect(result.current.pendingDelete).toBe(DEFAULT_ACCOUNT);

    act(() => {
      result.current.closeDeleteModal();
    });
    expect(result.current.pendingDelete).toBeNull();
  });

  it("handleConfirmDelete removes the account, shows success toast", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT]);
    mockDeleteBankAccount.mockResolvedValue(undefined);
    const { result } = renderHook(() => useBankAccounts());
    await flush();

    act(() => {
      result.current.openDeleteModal(DEFAULT_ACCOUNT);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteBankAccount).toHaveBeenCalledWith("mock-token", "ba_default");
    expect(result.current.accounts).toHaveLength(0);
    expect(result.current.pendingDelete).toBeNull();
    expect(result.current.toast?.type).toBe("success");
  });

  it("sets deleteError with a friendly message for BANK_ACCOUNT_HAS_PAYOUTS — keeps modal open", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT]);
    const blockedError = Object.assign(
      new Error("Bank account ba_default cannot be deleted: 1 payout(s) reference it"),
      { code: "BANK_ACCOUNT_HAS_PAYOUTS" }
    );
    mockDeleteBankAccount.mockRejectedValue(blockedError);
    const { result } = renderHook(() => useBankAccounts());
    await flush();

    act(() => {
      result.current.openDeleteModal(DEFAULT_ACCOUNT);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.deleteError).toMatch(/can't be removed because a payout/i);
    // Modal stays open — pendingDelete is still set
    expect(result.current.pendingDelete).not.toBeNull();
    // Account was NOT removed from the list
    expect(result.current.accounts).toHaveLength(1);
  });
});

// ─── Toast ────────────────────────────────────────────────────────────────────

describe("useBankAccounts — toast", () => {
  it("clearToast sets toast to null", async () => {
    mockListBankAccounts.mockResolvedValue([DEFAULT_ACCOUNT]);
    mockDeleteBankAccount.mockResolvedValue(undefined);
    const { result } = renderHook(() => useBankAccounts());
    await flush();

    act(() => {
      result.current.openDeleteModal(DEFAULT_ACCOUNT);
    });
    await act(async () => {
      await result.current.handleConfirmDelete();
    });
    expect(result.current.toast).not.toBeNull();

    act(() => {
      result.current.clearToast();
    });
    expect(result.current.toast).toBeNull();
  });
});
