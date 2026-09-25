"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  addBankAccount,
  SUPPORTED_CORRIDORS,
  SUPPORTED_CORRIDORS_REQUIRED_DETAILS,
  type AddBankAccountData,
  type BankAccount,
} from "@/lib/api/bank-accounts";
import { cleanLettersOnly } from "@/hooks/useKycForm";

// ─── Masking helpers ──────────────────────────────────────────────────────────

export function maskCpfOrCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function maskAccountNumberByRail(value: string, rail: string): string {
  if (rail === "SPEI_BITSO") return value.replace(/\D/g, "").slice(0, 18);
  if (rail === "TRANSFERS_BITSO") return value.replace(/\D/g, "").slice(0, 22);
  if (rail === "PIX") return value.trim().slice(0, 77);
  return value.slice(0, 64);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BankAccountFormErrors {
  country?: string;
  rail?: string;
  accountNumber?: string;
  bankName?: string;
  holderName?: string;
  details?: Record<string, string | undefined>;
}

export interface UseBankAccountFormOptions {
  onSuccess?: (account: BankAccount) => void;
}

export interface UseBankAccountFormReturn {
  // State
  step: 1 | 2;
  country: string;
  rail: string;
  accountNumber: string;
  bankName: string;
  holderName: string;
  isDefault: boolean;
  details: Record<string, string>;
  errors: BankAccountFormErrors;
  submitError: string | null;
  isSubmitting: boolean;
  // Derived
  railsForCountry: typeof SUPPORTED_CORRIDORS;
  requiredDetailKeys: readonly string[];
  isSingleRail: boolean;
  isPix: boolean;
  // Setters
  setAccountNumber: (value: string) => void;
  setBankName: (value: string) => void;
  setHolderName: (value: string) => void;
  setIsDefault: (value: boolean) => void;
  handleCountryChange: (nextCountry: string) => void;
  handleRailChange: (nextRail: string) => void;
  handleDetailChange: (key: string, value: string) => void;
  // Navigation & submit
  handleContinue: () => void;
  handleBack: () => void;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBankAccountForm({
  onSuccess,
}: UseBankAccountFormOptions = {}): UseBankAccountFormReturn {
  const token = useAuthStore((state) => state.token);

  const [step, setStep] = useState<1 | 2>(1);
  const [country, setCountry] = useState<string>("BR");
  const [rail, setRail] = useState<string>("PIX");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<BankAccountFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const railsForCountry = useMemo(
    () => SUPPORTED_CORRIDORS.filter((corridor) => corridor.country === country),
    [country]
  );

  const requiredDetailKeys = SUPPORTED_CORRIDORS_REQUIRED_DETAILS[rail] ?? [];
  const isSingleRail = railsForCountry.length === 1;
  const isPix = rail === "PIX";

  // ── Field handlers ──────────────────────────────────────────────────────────
  function handleCountryChange(nextCountry: string) {
    setCountry(nextCountry);
    const available = SUPPORTED_CORRIDORS.filter((c) => c.country === nextCountry);
    const firstRail = available[0]?.rail ?? "";
    setRail(firstRail);
    setAccountNumber("");
    setDetails({});
    setErrors({});
  }

  function handleRailChange(nextRail: string) {
    setRail(nextRail);
    setAccountNumber("");
    setDetails({});
    setErrors((prev) => ({
      ...prev,
      rail: undefined,
      accountNumber: undefined,
      details: undefined,
    }));
  }

  function handleDetailChange(key: string, value: string) {
    let formatted = value;
    if (key.includes("cpf_cnpj")) {
      formatted = maskCpfOrCnpj(value);
    }
    setDetails((prev) => ({ ...prev, [key]: formatted }));
    setErrors((prev) => {
      if (!prev.details?.[key]) return prev;
      return { ...prev, details: { ...prev.details, [key]: undefined } };
    });
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  function validateStep1(): boolean {
    const next: BankAccountFormErrors = {};
    if (!country) next.country = "Select a country";
    if (!rail) next.rail = "Select a payout method";
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  }

  function humanizeDetailKey(key: string): string {
    const LABELS: Record<string, string> = {
      ach_cop_beneficiary_first_name: "Beneficiary first name",
      ach_cop_beneficiary_last_name: "Beneficiary last name",
      ach_cop_document_id: "Document number",
      ach_cop_email: "Beneficiary email",
      ach_cop_bank_code: "Bank code",
    };
    if (LABELS[key]) return LABELS[key];
    return key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function validateStep2(): boolean {
    const nextErrors: BankAccountFormErrors = {};

    if (!accountNumber.trim()) {
      nextErrors.accountNumber = isPix
        ? "Enter your Pix key"
        : rail === "SPEI_BITSO"
          ? "Enter the 18-digit CLABE"
          : rail === "TRANSFERS_BITSO"
            ? "Enter the 22-digit CBU/CVU"
            : "Enter the account number";
    } else if (
      rail === "SPEI_BITSO" &&
      accountNumber.replace(/\D/g, "").length !== 18
    ) {
      nextErrors.accountNumber = "CLABE must be exactly 18 digits";
    } else if (
      rail === "TRANSFERS_BITSO" &&
      accountNumber.replace(/\D/g, "").length !== 22
    ) {
      nextErrors.accountNumber = "CBU / CVU must be exactly 22 digits";
    }

    if (!bankName.trim()) nextErrors.bankName = "Enter the bank name";
    if (!holderName.trim()) nextErrors.holderName = "Enter the account holder's name";

    const detailErrors: Record<string, string> = {};
    for (const key of requiredDetailKeys) {
      if (key === "pix_key") continue;
      const val =
        details[key] ??
        (key === "spei_protocol" ? "clabe" : key === "transfers_type" ? "CBU" : "");
      if (!val.trim()) {
        detailErrors[key] = `Enter ${humanizeDetailKey(key).toLowerCase()}`;
      }
    }
    if (Object.keys(detailErrors).length > 0) nextErrors.details = detailErrors;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  function handleContinue() {
    setSubmitError(null);
    if (validateStep1()) {
      setStep(2);
    }
  }

  function handleBack() {
    setStep(1);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (step !== 2) return;
    setSubmitError(null);

    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }
    if (!token) {
      setSubmitError("Your session has expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAccountNumber = accountNumber.trim();
      const finalDetails: Record<string, unknown> = {
        ...Object.fromEntries(
          requiredDetailKeys.map((key) => [
            key,
            details[key]?.trim() ||
              (key === "spei_protocol"
                ? "clabe"
                : key === "transfers_type"
                  ? "CBU"
                  : ""),
          ])
        ),
      };

      if (rail === "PIX") {
        finalDetails.pix_key = finalAccountNumber;
      }

      const payload: AddBankAccountData = {
        country,
        rail,
        accountNumber: finalAccountNumber,
        bankName: bankName.trim(),
        holderName: cleanLettersOnly(holderName.trim()),
        isDefault,
        ...(requiredDetailKeys.length > 0 ? { details: finalDetails } : {}),
      };

      const account = await addBankAccount(token, payload);
      onSuccess?.(account);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not add this bank account."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    step,
    country,
    rail,
    accountNumber,
    bankName,
    holderName,
    isDefault,
    details,
    errors,
    submitError,
    isSubmitting,
    railsForCountry,
    requiredDetailKeys,
    isSingleRail,
    isPix,
    setAccountNumber: (v) =>
      setAccountNumber(maskAccountNumberByRail(v, rail)),
    setBankName,
    setHolderName: (v) => setHolderName(v),
    setIsDefault,
    handleCountryChange,
    handleRailChange,
    handleDetailChange,
    handleContinue,
    handleBack,
    handleSubmit,
  };
}
