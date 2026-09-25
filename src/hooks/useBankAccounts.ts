"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  listBankAccounts,
  setDefaultBankAccount,
  deleteBankAccount,
  type BankAccount,
  type BankAccountApiError,
} from "@/lib/api/bank-accounts";
import { getMyKyc, type KycProfile } from "@/lib/api/kyc";

// ─── Error helpers ────────────────────────────────────────────────────────────

/**
 * The backend's own message for BANK_ACCOUNT_HAS_PAYOUTS is written for logs
 * and API consumers — accurate, but not something to hand a freelancer verbatim.
 */
function friendlyDeleteError(error: unknown): string {
  const code = (error as BankAccountApiError | undefined)?.code;
  if (code === "BANK_ACCOUNT_HAS_PAYOUTS") {
    return "This account can't be removed because a payout already references it — that record needs to stay intact. Add a new account instead and set it as your default.";
  }
  return error instanceof Error ? error.message : "Could not delete this account.";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToastState {
  message: string;
  type: "success" | "error";
}

export interface UseBankAccountsOptions {
  /** Pre-loaded KYC profile; pass `undefined` to have the hook fetch it. */
  kycProfile?: KycProfile | null;
  /** Explicit override for KYC approval status — skips profile fetch when provided. */
  isKycApproved?: boolean;
}

export interface UseBankAccountsReturn {
  // Account list state
  accounts: BankAccount[] | null;
  loadError: string | null;
  // Action state
  actionError: string | null;
  busyId: string | null;
  // Add modal
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
  handleAdded: (account: BankAccount) => void;
  // Delete modal
  pendingDelete: BankAccount | null;
  deleteError: string | null;
  openDeleteModal: (account: BankAccount) => void;
  closeDeleteModal: () => void;
  handleConfirmDelete: () => Promise<void>;
  // Set default
  handleSetDefault: (account: BankAccount) => Promise<void>;
  // KYC gate
  kycProfile: KycProfile | null | undefined;
  isCheckingKyc: boolean;
  isKycApproved: boolean;
  isKycPending: boolean;
  // Toast
  toast: ToastState | null;
  clearToast: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBankAccounts({
  kycProfile: propKycProfile,
  isKycApproved: propIsKycApproved,
}: UseBankAccountsOptions = {}): UseBankAccountsReturn {
  const token = useAuthStore((state) => state.token);

  const [accounts, setAccounts] = useState<BankAccount[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BankAccount | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // KYC gate state
  const [kycProfile, setKycProfile] = useState<KycProfile | null | undefined>(
    propKycProfile
  );
  const [isCheckingKyc, setIsCheckingKyc] = useState<boolean>(
    propKycProfile === undefined && propIsKycApproved === undefined
  );

  // Fetch KYC profile unless caller supplied it or an explicit override
  useEffect(() => {
    if (propKycProfile !== undefined) {
      setKycProfile(propKycProfile);
      setIsCheckingKyc(false);
      return;
    }
    if (propIsKycApproved !== undefined) {
      setIsCheckingKyc(false);
      return;
    }
    if (!token) {
      setIsCheckingKyc(false);
      return;
    }

    let cancelled = false;
    getMyKyc(token)
      .then((profile) => {
        if (!cancelled) {
          setKycProfile(profile);
          setIsCheckingKyc(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setKycProfile(null);
          setIsCheckingKyc(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, propKycProfile, propIsKycApproved]);

  // Fetch bank accounts list
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listBankAccounts(token)
      .then((result) => {
        if (!cancelled) setAccounts(result);
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setLoadError(
            error instanceof Error ? error.message : "Could not load your bank accounts."
          );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ── KYC gate evaluation ────────────────────────────────────────────────────
  // A user is verified when they have completed KYC and accepted BlindPay ToS
  const isKycApproved =
    propIsKycApproved !== undefined
      ? propIsKycApproved
      : Boolean(kycProfile?.blindpayTosId);

  const isKycSubmitted = Boolean(kycProfile);
  const isKycPending = isKycSubmitted && !isKycApproved;

  // ── Add modal handlers ─────────────────────────────────────────────────────
  function openAddModal() {
    setIsAddModalOpen(true);
  }

  function closeAddModal() {
    setIsAddModalOpen(false);
  }

  function handleAdded(account: BankAccount) {
    setAccounts((prev) => {
      const withoutDuplicates = (prev ?? []).filter(
        (existing) => existing.id !== account.id
      );
      const next = account.isDefault
        ? withoutDuplicates.map((existing) => ({ ...existing, isDefault: false }))
        : withoutDuplicates;
      return [account, ...next];
    });
    setIsAddModalOpen(false);
    setToast({ type: "success", message: "Bank account added" });
  }

  // ── Set default handler ────────────────────────────────────────────────────
  async function handleSetDefault(account: BankAccount): Promise<void> {
    if (!token) return;
    setActionError(null);
    setBusyId(account.id);
    try {
      const updated = await setDefaultBankAccount(token, account.id);
      setAccounts((prev) =>
        (prev ?? []).map((existing) => ({
          ...existing,
          isDefault: existing.id === updated.id,
        }))
      );
      setToast({ type: "success", message: "Default payout account updated" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not set this account as default.";
      setActionError(message);
      setToast({ type: "error", message });
    } finally {
      setBusyId(null);
    }
  }

  // ── Delete modal handlers ──────────────────────────────────────────────────
  function openDeleteModal(account: BankAccount) {
    setDeleteError(null);
    setPendingDelete(account);
  }

  function closeDeleteModal() {
    setPendingDelete(null);
    setDeleteError(null);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!token || !pendingDelete) return;
    const account = pendingDelete;
    setDeleteError(null);
    setBusyId(account.id);
    try {
      await deleteBankAccount(token, account.id);
      setAccounts((prev) =>
        (prev ?? []).filter((existing) => existing.id !== account.id)
      );
      setPendingDelete(null);
      setToast({ type: "success", message: "Bank account deleted" });
    } catch (error) {
      // Shown inline in the confirmation modal (kept open) — not a toast
      setDeleteError(friendlyDeleteError(error));
    } finally {
      setBusyId(null);
    }
  }

  return {
    accounts,
    loadError,
    actionError,
    busyId,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    handleAdded,
    pendingDelete,
    deleteError,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDelete,
    handleSetDefault,
    kycProfile,
    isCheckingKyc,
    isKycApproved,
    isKycPending,
    toast,
    clearToast: () => setToast(null),
  };
}
