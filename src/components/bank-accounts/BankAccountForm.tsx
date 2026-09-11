"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  NEUMORPHIC_INPUT,
  PRIMARY_BUTTON,
  ACTION_BUTTON_SUBTLE,
  ACTION_BUTTON_DEFAULT,
  NEUMORPHIC_INSET,
} from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/auth-store";
import {
  addBankAccount,
  SUPPORTED_CORRIDORS,
  SUPPORTED_CORRIDORS_REQUIRED_DETAILS,
  type AddBankAccountData,
  type BankAccount,
} from "@/lib/api/bank-accounts";
import { cleanLettersOnly } from "@/components/kyc/KycForm";

/** Emoji flag for each corridor country */
export const COUNTRY_FLAGS: Record<string, string> = {
  BR: "🇧🇷",
  MX: "🇲🇽",
  AR: "🇦🇷",
  CO: "🇨🇴",
};

export const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CO: "Colombia",
};

const CORRIDOR_COUNTRIES = ["BR", "MX", "AR", "CO"] as const;

// Real-world examples for each rail
const RAIL_DESCRIPTIONS: Record<string, { label: string; currency: string; hint: string }> = {
  PIX: { label: "Pix Instant", currency: "BRL", hint: "Instant 24/7 transfers using your registered Pix key" },
  PIX_SAFE: { label: "Pix Safe", currency: "BRL", hint: "Verified bank transfer through Central Bank of Brazil" },
  TED: { label: "TED Wire", currency: "BRL", hint: "Same-day Brazilian interbank electronic transfer" },
  SPEI_BITSO: { label: "SPEI (Bitso)", currency: "MXN", hint: "Mexican interbank system via 18-digit CLABE" },
  TRANSFERS_BITSO: { label: "Transfers 3.0", currency: "ARS", hint: "Instant Argentine transfers via 22-digit CBU or CVU" },
  ACH_COP_BITSO: { label: "ACH Colombia", currency: "COP", hint: "Automated Clearing House Colombian banking transfer" },
};

function maskCpfOrCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  // CNPJ: 00.000.000/0000-00
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function maskAccountNumberByRail(value: string, rail: string): string {
  if (rail === "SPEI_BITSO") {
    // 18 digits CLABE
    return value.replace(/\D/g, "").slice(0, 18);
  }
  if (rail === "TRANSFERS_BITSO") {
    // 22 digits CBU / CVU
    return value.replace(/\D/g, "").slice(0, 22);
  }
  if (rail === "PIX") {
    // Pix key: can be email, phone, CPF, or UUID
    return value.trim().slice(0, 77);
  }
  return value.slice(0, 64);
}

function humanizeDetailKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const SELECT_STYLES = cn(NEUMORPHIC_INPUT, "appearance-none cursor-pointer pr-10");

export interface BankAccountFormProps {
  onSuccess?: (account: BankAccount) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormErrors {
  country?: string;
  rail?: string;
  accountNumber?: string;
  bankName?: string;
  holderName?: string;
  details?: Record<string, string | undefined>;
}

export function BankAccountForm({ onSuccess, onCancel, className }: BankAccountFormProps): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const formId = useId();

  const [step, setStep] = useState<1 | 2>(1);
  const [country, setCountry] = useState<string>("BR");

  const railsForCountry = useMemo(
    () => SUPPORTED_CORRIDORS.filter((corridor) => corridor.country === country),
    [country]
  );

  const [rail, setRail] = useState<string>("PIX");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [holderName, setHolderName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiredDetailKeys = SUPPORTED_CORRIDORS_REQUIRED_DETAILS[rail] ?? [];
  const isSingleRail = railsForCountry.length === 1;

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
    setErrors((prev) => ({ ...prev, rail: undefined, accountNumber: undefined, details: undefined }));
  }

  function handleDetailChange(key: string, value: string) {
    let formatted = value;
    if (key.includes("cpf_cnpj")) {
      formatted = maskCpfOrCnpj(value);
    }
    setDetails((prev) => ({ ...prev, [key]: formatted }));
    setErrors((prev) => {
      if (!prev.details?.[key]) return prev;
      const nextDetailErrors = { ...prev.details, [key]: undefined };
      return { ...prev, details: nextDetailErrors };
    });
  }

  function validateStep1(): boolean {
    const next: FormErrors = {};
    if (!country) next.country = "Select a country";
    if (!rail) next.rail = "Select a payout method";
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  }

  function validateStep2(): boolean {
    const nextErrors: FormErrors = {};
    const isPix = rail === "PIX";

    if (!accountNumber.trim()) {
      nextErrors.accountNumber = isPix
        ? "Enter your Pix key"
        : rail === "SPEI_BITSO"
        ? "Enter the 18-digit CLABE"
        : rail === "TRANSFERS_BITSO"
        ? "Enter the 22-digit CBU/CVU"
        : "Enter the account number";
    } else if (rail === "SPEI_BITSO" && accountNumber.replace(/\D/g, "").length !== 18) {
      nextErrors.accountNumber = "CLABE must be exactly 18 digits";
    } else if (rail === "TRANSFERS_BITSO" && accountNumber.replace(/\D/g, "").length !== 22) {
      nextErrors.accountNumber = "CBU / CVU must be exactly 22 digits";
    }

    if (!bankName.trim()) nextErrors.bankName = "Enter the bank name";
    if (!holderName.trim()) nextErrors.holderName = "Enter the account holder's name";

    const detailErrors: Record<string, string> = {};
    for (const key of requiredDetailKeys) {
      if (key === "pix_key") continue; // Handled via accountNumber
      const val = details[key] ?? (key === "spei_protocol" ? "clabe" : key === "transfers_type" ? "cbu" : "");
      if (!val.trim()) {
        detailErrors[key] = `Enter ${humanizeDetailKey(key).toLowerCase()}`;
      }
    }
    if (Object.keys(detailErrors).length > 0) nextErrors.details = detailErrors;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleContinue() {
    setSubmitError(null);
    if (validateStep1()) {
      setStep(2);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Guards against submitting mid-transition: the step-1/step-2 footer
    // buttons occupy the same JSX slot (button vs. submit), so without a
    // `key` telling React to treat them as distinct elements, it would
    // reuse the DOM node and flip its `type` attribute in place — a stray
    // submit could then fire against a still-empty step 2 before the user
    // ever saw it. The `key`s above fix the reuse; this is the second,
    // cheap line of defense.
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
              (key === "spei_protocol" ? "clabe" : key === "transfers_type" ? "cbu" : ""),
          ])
        ),
      };

      // For PIX, mirror the key into details.pix_key as required by BlindPay
      if (rail === "PIX") {
        finalDetails.pix_key = finalAccountNumber;
      }

      const payload: AddBankAccountData = {
        country,
        rail,
        accountNumber: finalAccountNumber,
        bankName: bankName.trim(),
        holderName: holderName.trim(),
        isDefault,
        ...(requiredDetailKeys.length > 0 ? { details: finalDetails } : {}),
      };

      const account = await addBankAccount(token, payload);
      onSuccess?.(account);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not add this bank account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const countryId = `${formId}-country`;
  const railId = `${formId}-rail`;
  const accountNumberId = `${formId}-account-number`;
  const bankNameId = `${formId}-bank-name`;
  const holderNameId = `${formId}-holder-name`;
  const isDefaultId = `${formId}-is-default`;

  const isPix = rail === "PIX";

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)} noValidate>
      {/* --- Stepper Navigation --- */}
      <div className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Step {step} of 2
            </span>
            <h3 className="text-base font-bold text-text-primary">
              {step === 1 ? "Payout Destination & Rail" : "Account & Beneficiary Details"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={cn(
                "w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center",
                step === 1
                  ? "bg-primary text-white shadow-[0_2px_8px_rgba(20,154,155,0.35)]"
                  : "bg-success/15 text-success hover:bg-success/25 cursor-pointer"
              )}
            >
              {step === 2 ? <Icon path={ICON_PATHS.check} size="sm" /> : "1"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className={cn(
                "w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center",
                step === 2
                  ? "bg-primary text-white shadow-[0_2px_8px_rgba(20,154,155,0.35)]"
                  : "bg-background text-text-secondary opacity-60"
              )}
            >
              2
            </button>
          </div>
        </div>

        <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* --- Step 1: Destination & Rail --- */}
      {step === 1 && (
        <div className="space-y-4 animate-scale-in">
          <div>
            <label htmlFor={countryId} className="block text-sm font-medium text-text-primary mb-2">
              Country
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2">
              {CORRIDOR_COUNTRIES.map((code) => {
                const isSelected = country === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleCountryChange(code)}
                    className={cn(
                      "p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                        : "border-transparent bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl" aria-hidden="true">
                        {COUNTRY_FLAGS[code]}
                      </span>
                      {isSelected && (
                        <Icon path={ICON_PATHS.check} size="sm" className="text-primary" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{COUNTRY_NAMES[code]}</p>
                  </button>
                );
              })}
            </div>

            {/* Hidden native select to guarantee full accessibility and test compatibility */}
            <select
              id={countryId}
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="sr-only"
              aria-label="Country"
            >
              {CORRIDOR_COUNTRIES.map((code) => (
                <option key={code} value={code}>
                  {COUNTRY_FLAGS[code]} {COUNTRY_NAMES[code]}
                </option>
              ))}
            </select>

            {errors.country && (
              <p className="mt-1 text-xs text-error">{errors.country}</p>
            )}
          </div>

          <div>
            <label htmlFor={railId} className="block text-sm font-medium text-text-primary mb-2">
              Payout method
            </label>

            {isSingleRail ? (
              <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-3.5 flex items-center justify-between gap-3")}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">
                      {RAIL_DESCRIPTIONS[rail]?.label ?? rail}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                      {RAIL_DESCRIPTIONS[rail]?.currency ?? "FIAT"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {RAIL_DESCRIPTIONS[rail]?.hint ?? "Default rail for this country"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-success shrink-0">
                  <Icon path={ICON_PATHS.check} size="sm" />
                  Auto-selected
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {railsForCountry.map((corridor) => {
                  const isSelected = rail === corridor.rail;
                  const desc = RAIL_DESCRIPTIONS[corridor.rail];
                  return (
                    <button
                      key={corridor.rail}
                      type="button"
                      onClick={() => handleRailChange(corridor.rail)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left border transition-all duration-200 flex items-center justify-between gap-3",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                          : "border-transparent bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:border-border"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-text-primary">{desc?.label ?? corridor.label}</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                            {desc?.currency}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5">{desc?.hint}</p>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                          isSelected ? "border-primary bg-primary" : "border-border"
                        )}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Native select to ensure test query support */}
            <select
              id={railId}
              value={rail}
              onChange={(e) => handleRailChange(e.target.value)}
              className="sr-only"
              aria-label="Payout method"
            >
              {railsForCountry.map((corridor) => (
                <option key={corridor.rail} value={corridor.rail}>
                  {corridor.label}
                </option>
              ))}
            </select>

            {errors.rail && (
              <p className="mt-1 text-xs text-error">{errors.rail}</p>
            )}
          </div>
        </div>
      )}

      {/* --- Step 2: Account Details & Rail Extras --- */}
      {step === 2 && (
        <div className="space-y-4 animate-scale-in">
          {/* Selected Corridor Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none" aria-hidden="true">
                {COUNTRY_FLAGS[country]}
              </span>
              <span className="font-semibold text-text-primary">{COUNTRY_NAMES[country]}</span>
              <span className="text-text-secondary">·</span>
              <span className="text-primary font-medium">{RAIL_DESCRIPTIONS[rail]?.label ?? rail}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-primary font-semibold text-xs hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Account Number / Pix Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={accountNumberId} className="block text-sm font-medium text-text-primary">
                {isPix
                  ? "Pix Key"
                  : rail === "SPEI_BITSO"
                  ? "CLABE"
                  : rail === "TRANSFERS_BITSO"
                  ? "CBU / CVU"
                  : "Account number"}
              </label>
              {isPix && (
                <span className="text-[11px] text-text-secondary">
                  CPF/CNPJ, email, phone, or random key
                </span>
              )}
            </div>

            <input
              id={accountNumberId}
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(maskAccountNumberByRail(e.target.value, rail))}
              placeholder={
                isPix
                  ? "e.g. user@email.com or 123.456.789-00"
                  : rail === "SPEI_BITSO"
                  ? "18-digit CLABE number"
                  : rail === "TRANSFERS_BITSO"
                  ? "22-digit CBU or CVU"
                  : "Bank account number"
              }
              className={cn(NEUMORPHIC_INPUT, errors.accountNumber && "ring-2 ring-error/50")}
              aria-invalid={Boolean(errors.accountNumber)}
              aria-label={isPix ? "Pix Key" : rail === "SPEI_BITSO" ? "CLABE" : "Account number"}
            />
            {errors.accountNumber && (
              <p className="mt-1.5 text-xs text-error">{errors.accountNumber}</p>
            )}
          </div>

          {/* Bank Name & Holder Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor={bankNameId} className="block text-sm font-medium text-text-primary mb-2">
                Bank name
              </label>
              <input
                id={bankNameId}
                type="text"
                value={bankName}
                maxLength={120}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={
                  country === "BR"
                    ? "e.g. Nubank / Itaú"
                    : country === "MX"
                    ? "e.g. BBVA / Banorte"
                    : country === "AR"
                    ? "e.g. Banco Galicia"
                    : "e.g. Bancolombia"
                }
                className={cn(NEUMORPHIC_INPUT, errors.bankName && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.bankName)}
              />
              {errors.bankName && (
                <p className="mt-1.5 text-xs text-error">{errors.bankName}</p>
              )}
            </div>

            <div>
              <label htmlFor={holderNameId} className="block text-sm font-medium text-text-primary mb-2">
                Account holder name
              </label>
              <input
                id={holderNameId}
                type="text"
                value={holderName}
                maxLength={120}
                onChange={(e) => setHolderName(cleanLettersOnly(e.target.value))}
                placeholder="Full legal name of recipient"
                className={cn(NEUMORPHIC_INPUT, errors.holderName && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.holderName)}
              />
              {errors.holderName && (
                <p className="mt-1.5 text-xs text-error">{errors.holderName}</p>
              )}
            </div>
          </div>

          {/* Rail-Specific Details */}
          {requiredDetailKeys.filter((k) => k !== "pix_key").length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {requiredDetailKeys
                .filter((k) => k !== "pix_key")
                .map((key) => {
                  const detailId = `${formId}-detail-${key}`;
                  const detailError = errors.details?.[key];
                  const humanLabel = humanizeDetailKey(key);

                  if (key === "account_type") {
                    return (
                      <div key={key}>
                        <label htmlFor={detailId} className="block text-sm font-medium text-text-primary mb-2">
                          Account Type
                        </label>
                        <div className="relative">
                          <select
                            id={detailId}
                            value={details[key] ?? ""}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            className={cn(SELECT_STYLES, detailError && "ring-2 ring-error/50")}
                            aria-invalid={Boolean(detailError)}
                          >
                            <option value="">Select account type...</option>
                            <option value="checking">Checking (Corriente)</option>
                            <option value="savings">Savings (Ahorros)</option>
                          </select>
                          <Icon
                            path={ICON_PATHS.chevronDown}
                            size="sm"
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                          />
                        </div>
                        {detailError && (
                          <p className="mt-1.5 text-xs text-error">{detailError}</p>
                        )}
                      </div>
                    );
                  }

                  if (key === "spei_protocol") {
                    return (
                      <div key={key}>
                        <label htmlFor={detailId} className="block text-sm font-medium text-text-primary mb-2">
                          Spei Protocol
                        </label>
                        <div className="relative">
                          <select
                            id={detailId}
                            value={details[key] ?? "clabe"}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            className={cn(SELECT_STYLES, detailError && "ring-2 ring-error/50")}
                          >
                            <option value="clabe">CLABE (Standard)</option>
                            <option value="debit_card">Debit Card</option>
                            <option value="phone">Phone</option>
                          </select>
                          <Icon
                            path={ICON_PATHS.chevronDown}
                            size="sm"
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                          />
                        </div>
                      </div>
                    );
                  }

                  if (key === "transfers_type") {
                    return (
                      <div key={key}>
                        <label htmlFor={detailId} className="block text-sm font-medium text-text-primary mb-2">
                          Transfers Type
                        </label>
                        <div className="relative">
                          <select
                            id={detailId}
                            value={details[key] ?? "cbu"}
                            onChange={(e) => handleDetailChange(key, e.target.value)}
                            className={cn(SELECT_STYLES, detailError && "ring-2 ring-error/50")}
                          >
                            <option value="cbu">CBU (Bancaria)</option>
                            <option value="cvu">CVU (Virtual / Fintech)</option>
                          </select>
                          <Icon
                            path={ICON_PATHS.chevronDown}
                            size="sm"
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key}>
                      <label htmlFor={detailId} className="block text-sm font-medium text-text-primary mb-2">
                        {humanLabel}
                      </label>
                      <input
                        id={detailId}
                        type="text"
                        value={details[key] ?? ""}
                        onChange={(e) => handleDetailChange(key, e.target.value)}
                        placeholder={
                          key.includes("cpf_cnpj")
                            ? "000.000.000-00 or CNPJ"
                            : `Enter ${humanLabel.toLowerCase()}`
                        }
                        className={cn(NEUMORPHIC_INPUT, detailError && "ring-2 ring-error/50")}
                        aria-invalid={Boolean(detailError)}
                      />
                      {detailError && (
                        <p className="mt-1.5 text-xs text-error">{detailError}</p>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Default Toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id={isDefaultId}
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded accent-primary cursor-pointer"
            />
            <label htmlFor={isDefaultId} className="text-sm text-text-primary cursor-pointer font-medium">
              Set as default payout account
            </label>
          </div>
        </div>
      )}

      {submitError && (
        <div role="alert" className="p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error">
          <Icon path={ICON_PATHS.alertCircle} size="sm" className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* --- Footer Action Buttons --- */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/30">
        <div>
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2.5 text-xs")}
            >
              <Icon path={ICON_PATHS.chevronLeft} size="sm" />
              Previous
            </button>
          ) : onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cn(ACTION_BUTTON_SUBTLE, "w-auto text-xs px-4 py-2.5")}
            >
              Cancel
            </button>
          ) : null}
        </div>

        <div>
          {step === 1 ? (
            <button
              key="continue-button"
              type="button"
              onClick={handleContinue}
              className={cn(PRIMARY_BUTTON, "py-2.5 px-6 text-xs justify-center")}
            >
              Continue to Details
              <Icon path={ICON_PATHS.chevronRight} size="sm" />
            </button>
          ) : (
            <button
              key="submit-button"
              type="submit"
              disabled={isSubmitting}
              className={cn(PRIMARY_BUTTON, "py-2.5 px-6 text-xs justify-center font-bold")}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Adding account...
                </>
              ) : (
                <>
                  <Icon path={ICON_PATHS.plus} size="sm" />
                  Add bank account
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
