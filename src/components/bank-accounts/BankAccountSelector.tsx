"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ACTION_BUTTON_DEFAULT,
  ACTION_BUTTON_DANGER,
} from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  listBankAccounts,
  setDefaultBankAccount,
  deleteBankAccount,
  SUPPORTED_CORRIDORS,
  type BankAccount,
} from "@/lib/api/bank-accounts";
import { getMyKyc, type KycProfile } from "@/lib/api/kyc";
import { BankAccountForm, COUNTRY_FLAGS } from "@/components/bank-accounts/BankAccountForm";

const RAIL_LABELS: Record<string, string> = Object.fromEntries(
  SUPPORTED_CORRIDORS.map((corridor) => [corridor.rail, corridor.label])
);

function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4);
  return last4.length === accountNumber.length ? last4 : `•••• ${last4}`;
}

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (account: BankAccount) => void;
}

function AddBankAccountModal({ isOpen, onClose, onAdded }: AddBankAccountModalProps): React.JSX.Element | null {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <button
        type="button"
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          NEUMORPHIC_CARD,
          "relative w-full max-w-xl my-8 outline-none bg-white animate-scale-in"
        )}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Icon path={ICON_PATHS.creditCard} size="sm" />
            </div>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-text-primary">
                Add Payout Bank Account
              </h2>
              <p className="text-xs text-text-secondary">
                Configure your destination bank details for off-ramping USDC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ml-3",
              "text-text-secondary bg-white",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "hover:text-text-primary",
              "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "transition-all duration-150"
            )}
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        </div>

        <BankAccountForm onSuccess={onAdded} onCancel={onClose} />
      </div>
    </div>,
    document.body
  );
}

interface BankAccountRowProps {
  account: BankAccount;
  isSelected: boolean;
  busy: boolean;
  onSelect?: (account: BankAccount) => void;
  onSetDefault: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}

function BankAccountRow({
  account,
  isSelected,
  busy,
  onSelect,
  onSetDefault,
  onDelete,
}: BankAccountRowProps): React.JSX.Element {
  const railLabel = RAIL_LABELS[account.rail] ?? account.rail;
  const flag = COUNTRY_FLAGS[account.country] ?? "";

  const content = (
    <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl leading-none" aria-hidden="true">
            {flag}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{account.bankName}</p>
            <p className="text-xs text-text-secondary truncate">
              {railLabel} · {maskAccountNumber(account.accountNumber)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {account.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Icon path={ICON_PATHS.star} size="sm" />
              Default
            </span>
          )}
          {isSelected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <Icon path={ICON_PATHS.check} size="sm" />
              Selected
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {onSelect && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSelect(account)}
            aria-pressed={isSelected}
            className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed")}
          >
            {isSelected ? "Selected" : "Use this account"}
          </button>
        )}
        {!account.isDefault && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetDefault(account)}
            className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed")}
          >
            Set as default
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(account)}
          aria-label={`Delete ${account.bankName} account`}
          className={cn(ACTION_BUTTON_DANGER, "w-auto px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed")}
        >
          {busy ? <LoadingSpinner size="sm" /> : "Delete"}
        </button>
      </div>
    </div>
  );

  return content;
}

export interface BankAccountSelectorProps {
  /** The id of the account currently chosen for this payout; omit outside a picker context. */
  selectedId?: string | null;
  /** Present only in picker contexts (e.g. order completion) — omit to use this purely for management. */
  onSelect?: (account: BankAccount) => void;
  /** Card heading — callers embedding this in a named section override the generic default. */
  title?: string;
  className?: string;
  /** Optional pre-loaded KYC profile to evaluate gate condition */
  kycProfile?: KycProfile | null;
  /** Explicit override for KYC approval status */
  isKycApproved?: boolean;
  /** Callback triggered when user clicks to start KYC from the gate */
  onStartKyc?: () => void;
}

export function BankAccountSelector({
  selectedId,
  onSelect,
  title = "Bank accounts",
  className,
  kycProfile: propKycProfile,
  isKycApproved: propIsKycApproved,
  onStartKyc,
}: BankAccountSelectorProps): React.JSX.Element {
  const token = useAuthStore((state) => state.token);

  const [accounts, setAccounts] = useState<BankAccount[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BankAccount | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // KYC compliance gate state
  const [kycProfile, setKycProfile] = useState<KycProfile | null | undefined>(propKycProfile);
  const [isCheckingKyc, setIsCheckingKyc] = useState<boolean>(propKycProfile === undefined && propIsKycApproved === undefined);

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
          // If unmocked in test or offline, set to null
          setKycProfile(null);
          setIsCheckingKyc(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, propKycProfile, propIsKycApproved]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listBankAccounts(token)
      .then((result) => {
        if (!cancelled) setAccounts(result);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Could not load your bank accounts.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleAdded(account: BankAccount) {
    setAccounts((prev) => {
      const withoutDuplicates = (prev ?? []).filter((existing) => existing.id !== account.id);
      const next = account.isDefault
        ? withoutDuplicates.map((existing) => ({ ...existing, isDefault: false }))
        : withoutDuplicates;
      return [account, ...next];
    });
    setIsAddModalOpen(false);
    setToast({ type: "success", message: "Bank account added" });
  }

  async function handleSetDefault(account: BankAccount) {
    if (!token) return;
    setActionError(null);
    setBusyId(account.id);
    try {
      const updated = await setDefaultBankAccount(token, account.id);
      setAccounts((prev) =>
        (prev ?? []).map((existing) => ({ ...existing, isDefault: existing.id === updated.id }))
      );
      setToast({ type: "success", message: "Default payout account updated" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not set this account as default.";
      setActionError(message);
      setToast({ type: "error", message });
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!token || !pendingDelete) return;
    const account = pendingDelete;
    setActionError(null);
    setBusyId(account.id);
    try {
      await deleteBankAccount(token, account.id);
      setAccounts((prev) => (prev ?? []).filter((existing) => existing.id !== account.id));
      setPendingDelete(null);
      setToast({ type: "success", message: "Bank account deleted" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete this account.";
      setActionError(message);
      setToast({ type: "error", message });
    } finally {
      setBusyId(null);
    }
  }

  // --- KYC Gate Evaluation ---
  // A user is verified when they have completed KYC and accepted BlindPay ToS (blindpayTosId set)
  const isKycApproved =
    propIsKycApproved !== undefined
      ? propIsKycApproved
      : Boolean(kycProfile?.blindpayTosId);

  const isKycSubmitted = Boolean(kycProfile);
  const isKycPending = isKycSubmitted && !isKycApproved;

  return (
    <div className={cn(NEUMORPHIC_CARD, className)}>
      <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon path={ICON_PATHS.creditCard} size="md" className="text-primary" />
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {isKycApproved ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
              <Icon path={ICON_PATHS.check} size="sm" />
              Verified
            </span>
          ) : isKycPending ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
              <Icon path={ICON_PATHS.clock} size="sm" />
              In Review
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">
              <Icon path={ICON_PATHS.lock} size="sm" />
              KYC Required
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!isKycApproved}
          onClick={() => setIsAddModalOpen(true)}
          title={!isKycApproved ? "Complete identity verification first" : "Add bank account"}
          className={cn(
            ACTION_BUTTON_DEFAULT,
            "w-auto px-4 py-2 text-xs transition-all duration-200",
            !isKycApproved && "opacity-50 cursor-not-allowed hover:shadow-none pointer-events-auto"
          )}
        >
          <Icon path={isKycApproved ? ICON_PATHS.plus : ICON_PATHS.lock} size="sm" />
          Add new account
        </button>
      </div>

      <p className="text-sm text-text-secondary mb-5">
        Where your USDC settles as local fiat currency via BlindPay.
      </p>

      {/* --- KYC Gate Notice when not approved --- */}
      {isCheckingKyc ? (
        <div role="status" className="flex items-center justify-center gap-2.5 py-8 text-sm text-text-secondary">
          <LoadingSpinner size="sm" />
          Checking compliance status...
        </div>
      ) : !isKycApproved ? (
        <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-6 text-center animate-scale-in")}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]">
            <Icon
              path={isKycPending ? ICON_PATHS.clock : ICON_PATHS.shield}
              size="lg"
              className={isKycPending ? "text-warning" : "text-primary"}
            />
          </div>

          <h3 className="text-base font-bold text-text-primary mb-1">
            {isKycPending
              ? "Identity verification in review"
              : "Identity verification required"}
          </h3>

          <p className="text-sm text-text-secondary max-w-md mx-auto mb-4">
            {isKycPending
              ? "Your KYC documents have been submitted to BlindPay and are under review. Bank accounts can be linked as soon as your customer profile is approved."
              : "Before registering a payout account, BlindPay requires you to complete your identity verification (KYC) to create your compliance profile."}
          </p>

          {!isKycPending && onStartKyc && (
            <button
              type="button"
              onClick={onStartKyc}
              className={cn(ACTION_BUTTON_DEFAULT, "w-auto mx-auto px-4 py-2 text-xs")}
            >
              <Icon path={ICON_PATHS.shield} size="sm" />
              Complete Identity Verification
            </button>
          )}
        </div>
      ) : loadError !== null ? (
        <p role="alert" className="text-sm text-error">
          {loadError}
        </p>
      ) : accounts === null ? (
        <div role="status" className="flex items-center justify-center gap-2.5 py-8 text-sm text-text-secondary">
          <LoadingSpinner size="sm" />
          Loading bank accounts...
        </div>
      ) : accounts.length === 0 ? (
        <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-6 text-center animate-scale-in")}>
          <Icon path={ICON_PATHS.creditCard} size="lg" className="mx-auto mb-2 text-text-secondary" />
          <p className="text-sm font-medium text-text-primary">No bank accounts yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Add a bank account so you can receive your payouts once a client releases funds.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-scale-in">
          {accounts.map((account) => (
            <BankAccountRow
              key={account.id}
              account={account}
              isSelected={selectedId != null ? selectedId === account.id : account.isDefault}
              busy={busyId === account.id}
              onSelect={onSelect}
              onSetDefault={handleSetDefault}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {actionError !== null && (
        <p role="alert" className="mt-3 text-sm text-error">
          {actionError}
        </p>
      )}

      <AddBankAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={handleAdded}
      />

      <ConfirmationModal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this bank account?"
        message={
          pendingDelete
            ? `This removes ${pendingDelete.bankName} (${maskAccountNumber(pendingDelete.accountNumber)}) from your payout accounts.`
            : ""
        }
        confirmText="Delete account"
        variant="danger"
        isLoading={pendingDelete !== null && busyId === pendingDelete.id}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
