"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import {
  NEUMORPHIC_INPUT,
  PRIMARY_BUTTON,
  ACTION_BUTTON_SUBTLE,
  ACTION_BUTTON_DEFAULT,
  NEUMORPHIC_INSET,
} from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { COUNTRY_FLAGS } from "@/components/bank-accounts/BankAccountForm";
import { KycFileUploadField } from "@/components/kyc/KycFileUploadField";
import { useKycForm } from "@/hooks/useKycForm";
import type { KycProfile } from "@/lib/api/kyc";

// ─── Re-exported utilities & constants (used by BankAccountForm and tests) ───

export { cleanLettersOnly, maskTaxId, maskPostalCode, isValidCpf, calculateAge } from "@/hooks/useKycForm";

// Strictly the 4 BlindPay supported payout countries
export const KYC_CORRIDORS = [
  { code: "BR", name: "Brazil", flag: "🇧🇷", tier: "standard", reviewTime: "Instant" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", tier: "standard", reviewTime: "Instant" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", tier: "standard", reviewTime: "Instant" },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    tier: "enhanced",
    reviewTime: "Manual review (up to 1 business day)",
  },
] as const;

export const KYC_COUNTRY_NAMES: Record<string, string> = Object.fromEntries(
  KYC_CORRIDORS.map((c) => [c.code, c.name])
);

// Comprehensive list of countries for ID Document Issuing Country
const GLOBAL_COUNTRIES = [
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "ES", name: "Spain" },
  { code: "GB", name: "United Kingdom" },
  { code: "CL", name: "Chile" },
  { code: "PE", name: "Peru" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "BO", name: "Bolivia" },
  { code: "EC", name: "Ecuador" },
  { code: "VE", name: "Venezuela" },
  { code: "PA", name: "Panama" },
  { code: "CR", name: "Costa Rica" },
  { code: "GT", name: "Guatemala" },
  { code: "HN", name: "Honduras" },
  { code: "SV", name: "El Salvador" },
  { code: "NI", name: "Nicaragua" },
  { code: "DO", name: "Dominican Republic" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "OTHER", name: "Other" },
];

import type { KycIdDocType, ProofOfAddressDocType, SourceOfFundsDocType, PurposeOfTransactions } from "@/lib/api/kyc";

const ID_DOC_TYPES: { value: KycIdDocType; label: string; description: string }[] = [
  { value: "PASSPORT", label: "Passport", description: "International travel document" },
  { value: "ID_CARD", label: "National ID Card", description: "Government issued identity card" },
  { value: "DRIVERS", label: "Driver's License", description: "Official driving credential" },
];

const PROOF_OF_ADDRESS_TYPES: { value: ProofOfAddressDocType; label: string }[] = [
  { value: "UTILITY_BILL", label: "Utility Bill (electricity, water, gas)" },
  { value: "BANK_STATEMENT", label: "Bank Account Statement" },
  { value: "RENTAL_AGREEMENT", label: "Lease / Rental Agreement" },
  { value: "TAX_DOCUMENT", label: "Official Tax Document (DIAN / Tax Return)" },
  { value: "GOVERNMENT_CORRESPONDENCE", label: "Government Correspondence" },
];

const SOURCE_OF_FUNDS_TYPES: { value: SourceOfFundsDocType; label: string }[] = [
  { value: "salary", label: "Salary / Employment Income" },
  { value: "business_income", label: "Business / Professional Services Income" },
  { value: "savings", label: "Personal Savings" },
  { value: "investment_proceeds", label: "Investment Proceeds" },
  { value: "investment_loans", label: "Investment Loans" },
  { value: "pension_retirement", label: "Pension / Retirement" },
  { value: "sale_of_assets_real_estate", label: "Sale of Assets / Real Estate" },
  { value: "gifts", label: "Gifts" },
  { value: "inheritance", label: "Inheritance" },
  { value: "government_benefits", label: "Government Benefits" },
  { value: "gambling_proceeds", label: "Gambling / Lottery Proceeds" },
  { value: "esops", label: "Employee Stock Ownership Plan (ESOP)" },
  { value: "someone_else_funds", label: "Third-party Funds" },
];

const PURPOSE_OF_TRANSACTIONS: { value: PurposeOfTransactions; label: string }[] = [
  { value: "receive_payment_for_freelancing", label: "Receive payment for freelancing services" },
  { value: "receive_salary", label: "Receive recurring salary" },
  { value: "personal_or_living_expenses", label: "Personal or living expenses" },
  { value: "business_transactions", label: "Business commercial transactions" },
  { value: "payments_to_friends_or_family_abroad", label: "Family / remittances abroad" },
  { value: "investment_purposes", label: "Investment purposes" },
  { value: "protect_wealth", label: "Protect wealth & savings" },
  { value: "purchase_good_and_services", label: "Purchase goods and services" },
  { value: "charitable_donations", label: "Charitable donations" },
  { value: "other", label: "Other purpose (requires explanation)" },
];

const SELECT_STYLES = cn(NEUMORPHIC_INPUT, "appearance-none cursor-pointer pr-10");

// ─── Component Props ──────────────────────────────────────────────────────────

export interface KycFormProps {
  existingProfile?: KycProfile | null;
  onSuccess?: (profile: KycProfile) => void;
  onCancel?: () => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KycForm({
  existingProfile,
  onSuccess,
  onCancel,
  className,
}: KycFormProps): React.JSX.Element {
  const formId = useId();

  const {
    fields,
    errors,
    submitError,
    isSubmitting,
    currentStep,
    totalSteps,
    reviewStepIndex,
    stepTitles,
    isEnhanced,
    taxIdPlaceholder,
    postalPlaceholder,
    setField,
    handleNext,
    handleBack,
    goToStep,
    handleSubmit,
  } = useKycForm({ existingProfile, onSuccess });

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)} noValidate>
      {/* --- Stepper Header --- */}
      <div className="border-b border-border/50 pb-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step {currentStep} of {totalSteps}
            </span>
            <h3 className="text-base font-bold text-text-primary">
              {stepTitles[currentStep - 1]}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {stepTitles.map((title, idx) => {
              const stepNum = idx + 1;
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => {
                    if (stepNum < currentStep) goToStep(stepNum);
                  }}
                  disabled={stepNum > currentStep}
                  title={`Step ${stepNum}: ${title}`}
                  className={cn(
                    "w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center",
                    isCurrent && "bg-primary text-white shadow-[0_2px_8px_rgba(20,154,155,0.35)]",
                    isCompleted && "bg-success/15 text-success hover:bg-success/25 cursor-pointer",
                    !isCurrent &&
                      !isCompleted &&
                      "bg-background text-text-secondary opacity-60 cursor-not-allowed"
                  )}
                >
                  {isCompleted ? <Icon path={ICON_PATHS.check} size="sm" /> : stepNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Enhanced KYC notice for Colombia */}
        {fields.country === "CO" && (
          <div className="mt-3.5 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs text-text-primary">
            <Icon
              path={ICON_PATHS.infoCircle}
              size="sm"
              className="text-primary shrink-0 mt-0.5"
            />
            <div>
              <span className="font-semibold text-primary">
                Colombia Enhanced Verification:
              </span>{" "}
              In accordance with BlindPay compliance standards, accounts in Colombia require
              enhanced verification and are reviewed manually by BlindPay (typically within 1
              business day).
            </div>
          </div>
        )}
      </div>

      {/* --- Step 1: Personal Details --- */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-scale-in">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Payout Country (BlindPay Corridors)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {KYC_CORRIDORS.map((corridor) => {
                const isSelected = fields.country === corridor.code;
                return (
                  <button
                    key={corridor.code}
                    type="button"
                    onClick={() => {
                      setField("country", corridor.code);
                      setField("taxId", "");
                      setField("postalCode", "");
                    }}
                    className={cn(
                      "p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                        : "border-transparent bg-white shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff] hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl" aria-hidden="true">
                        {corridor.flag}
                      </span>
                      {isSelected && (
                        <Icon path={ICON_PATHS.check} size="sm" className="text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{corridor.name}</p>
                      <p className="text-[10px] text-text-secondary capitalize">
                        {corridor.tier} tier
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.country && (
              <p className="mt-1.5 text-xs text-error">{errors.country}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`${formId}-firstName`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                First Name
              </label>
              <input
                id={`${formId}-firstName`}
                type="text"
                value={fields.firstName}
                maxLength={100}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="e.g. Maria"
                className={cn(NEUMORPHIC_INPUT, errors.firstName && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.firstName)}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-error">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor={`${formId}-lastName`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Last Name
              </label>
              <input
                id={`${formId}-lastName`}
                type="text"
                value={fields.lastName}
                maxLength={100}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="e.g. Silva"
                className={cn(NEUMORPHIC_INPUT, errors.lastName && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.lastName)}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-error">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor={`${formId}-dateOfBirth`}
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Date of Birth
            </label>
            <input
              id={`${formId}-dateOfBirth`}
              type="date"
              value={fields.dateOfBirth}
              onChange={(e) => setField("dateOfBirth", e.target.value)}
              className={cn(NEUMORPHIC_INPUT, errors.dateOfBirth && "ring-2 ring-error/50")}
              aria-invalid={Boolean(errors.dateOfBirth)}
            />
            <p className="mt-1 text-[11px] text-text-secondary">
              Must be at least 18 years old to use payout corridors.
            </p>
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-error">{errors.dateOfBirth}</p>
            )}
          </div>
        </div>
      )}

      {/* --- Step 2: Address & Tax ID --- */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-scale-in">
          <div>
            <label
              htmlFor={`${formId}-taxId`}
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Tax ID / National Identification ({KYC_COUNTRY_NAMES[fields.country]})
            </label>
            <input
              id={`${formId}-taxId`}
              type="text"
              value={fields.taxId}
              maxLength={64}
              onChange={(e) => setField("taxId", e.target.value)}
              placeholder={taxIdPlaceholder}
              className={cn(NEUMORPHIC_INPUT, errors.taxId && "ring-2 ring-error/50")}
              aria-invalid={Boolean(errors.taxId)}
            />
            {errors.taxId && <p className="mt-1.5 text-xs text-error">{errors.taxId}</p>}
          </div>

          <div>
            <label
              htmlFor={`${formId}-addressLine1`}
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Street Address
            </label>
            <input
              id={`${formId}-addressLine1`}
              type="text"
              value={fields.addressLine1}
              maxLength={200}
              onChange={(e) => setField("addressLine1", e.target.value)}
              placeholder="e.g. Av. Paulista, 1000, Apt 42"
              className={cn(NEUMORPHIC_INPUT, errors.addressLine1 && "ring-2 ring-error/50")}
              aria-invalid={Boolean(errors.addressLine1)}
            />
            {errors.addressLine1 && (
              <p className="mt-1.5 text-xs text-error">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-addressLine2`}
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Address Line 2{" "}
              <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <input
              id={`${formId}-addressLine2`}
              type="text"
              value={fields.addressLine2}
              maxLength={200}
              onChange={(e) => setField("addressLine2", e.target.value)}
              placeholder="Suite, building, floor, etc."
              className={NEUMORPHIC_INPUT}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor={`${formId}-city`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                City
              </label>
              <input
                id={`${formId}-city`}
                type="text"
                value={fields.city}
                maxLength={100}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="e.g. São Paulo"
                className={cn(NEUMORPHIC_INPUT, errors.city && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city && <p className="mt-1.5 text-xs text-error">{errors.city}</p>}
            </div>

            <div>
              <label
                htmlFor={`${formId}-stateProvinceRegion`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                State / Province
              </label>
              <input
                id={`${formId}-stateProvinceRegion`}
                type="text"
                value={fields.stateProvinceRegion}
                maxLength={100}
                onChange={(e) => setField("stateProvinceRegion", e.target.value)}
                placeholder="e.g. SP"
                className={cn(
                  NEUMORPHIC_INPUT,
                  errors.stateProvinceRegion && "ring-2 ring-error/50"
                )}
                aria-invalid={Boolean(errors.stateProvinceRegion)}
              />
              {errors.stateProvinceRegion && (
                <p className="mt-1.5 text-xs text-error">{errors.stateProvinceRegion}</p>
              )}
            </div>

            <div>
              <label
                htmlFor={`${formId}-postalCode`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Postal Code
              </label>
              <input
                id={`${formId}-postalCode`}
                type="text"
                value={fields.postalCode}
                maxLength={20}
                onChange={(e) => setField("postalCode", e.target.value)}
                placeholder={postalPlaceholder}
                className={cn(NEUMORPHIC_INPUT, errors.postalCode && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.postalCode)}
              />
              {errors.postalCode && (
                <p className="mt-1.5 text-xs text-error">{errors.postalCode}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Step 3: Identity Verification --- */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`${formId}-idDocType`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Document Type
              </label>
              <div className="relative">
                <select
                  id={`${formId}-idDocType`}
                  value={fields.idDocType}
                  onChange={(e) => setField("idDocType", e.target.value as KycIdDocType)}
                  className={SELECT_STYLES}
                >
                  {ID_DOC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <Icon
                  path={ICON_PATHS.chevronDown}
                  size="sm"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={`${formId}-idDocCountry`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Document Issuing Country
              </label>
              <div className="relative">
                <select
                  id={`${formId}-idDocCountry`}
                  value={fields.idDocCountry}
                  onChange={(e) => setField("idDocCountry", e.target.value)}
                  className={SELECT_STYLES}
                >
                  {GLOBAL_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Icon
                  path={ICON_PATHS.chevronDown}
                  size="sm"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
              </div>
            </div>
          </div>

          <KycFileUploadField
            label="Selfie Photo"
            value={fields.selfieFileUrl}
            onChange={(url) => setField("selfieFileUrl", url)}
            error={errors.selfieFileUrl}
          />

          <KycFileUploadField
            label="Document Front Side"
            value={fields.idDocFrontFileUrl}
            onChange={(url) => setField("idDocFrontFileUrl", url)}
            error={errors.idDocFrontFileUrl}
          />

          {fields.idDocType !== "PASSPORT" ? (
            <KycFileUploadField
              label="Document Back Side"
              value={fields.idDocBackFileUrl}
              onChange={(url) => setField("idDocBackFileUrl", url)}
              error={errors.idDocBackFileUrl}
            />
          ) : (
            <KycFileUploadField
              label="Document Back Side"
              value={fields.idDocBackFileUrl}
              onChange={(url) => setField("idDocBackFileUrl", url)}
              optional
            />
          )}
        </div>
      )}

      {/* --- Step 4: Enhanced Compliance (CO Only) --- */}
      {isEnhanced && currentStep === 4 && (
        <div className="space-y-4 animate-scale-in">
          <div>
            <label
              htmlFor={`${formId}-proofOfAddressDocType`}
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Proof of Address Document
            </label>
            <div className="relative">
              <select
                id={`${formId}-proofOfAddressDocType`}
                value={fields.proofOfAddressDocType}
                onChange={(e) =>
                  setField("proofOfAddressDocType", e.target.value as ProofOfAddressDocType)
                }
                className={SELECT_STYLES}
              >
                <option value="">Select document type...</option>
                {PROOF_OF_ADDRESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Icon
                path={ICON_PATHS.chevronDown}
                size="sm"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>
            {errors.proofOfAddressDocType && (
              <p className="mt-1.5 text-xs text-error">{errors.proofOfAddressDocType}</p>
            )}
          </div>

          <KycFileUploadField
            label="Upload Proof of Address"
            value={fields.proofOfAddressDocFileUrl}
            onChange={(url) => setField("proofOfAddressDocFileUrl", url)}
            error={errors.proofOfAddressDocFileUrl}
          />

          <div>
            <label
              htmlFor={`${formId}-sourceOfFundsDocType`}
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Primary Source of Funds
            </label>
            <div className="relative">
              <select
                id={`${formId}-sourceOfFundsDocType`}
                value={fields.sourceOfFundsDocType}
                onChange={(e) =>
                  setField("sourceOfFundsDocType", e.target.value as SourceOfFundsDocType)
                }
                className={SELECT_STYLES}
              >
                <option value="">Select source of funds...</option>
                {SOURCE_OF_FUNDS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Icon
                path={ICON_PATHS.chevronDown}
                size="sm"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>
            {errors.sourceOfFundsDocType && (
              <p className="mt-1.5 text-xs text-error">{errors.sourceOfFundsDocType}</p>
            )}
          </div>

          <KycFileUploadField
            label="Upload Source of Funds Documentation"
            value={fields.sourceOfFundsDocFileUrl}
            onChange={(url) => setField("sourceOfFundsDocFileUrl", url)}
            error={errors.sourceOfFundsDocFileUrl}
          />

          <div>
            <label
              htmlFor={`${formId}-purposeOfTransactions`}
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Purpose of Transactions
            </label>
            <div className="relative">
              <select
                id={`${formId}-purposeOfTransactions`}
                value={fields.purposeOfTransactions}
                onChange={(e) =>
                  setField("purposeOfTransactions", e.target.value as PurposeOfTransactions)
                }
                className={SELECT_STYLES}
              >
                <option value="">Select primary purpose...</option>
                {PURPOSE_OF_TRANSACTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Icon
                path={ICON_PATHS.chevronDown}
                size="sm"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
            </div>
            {errors.purposeOfTransactions && (
              <p className="mt-1.5 text-xs text-error">{errors.purposeOfTransactions}</p>
            )}
          </div>

          {fields.purposeOfTransactions === "other" && (
            <div className="transition-all duration-300 animate-scale-in">
              <label
                htmlFor={`${formId}-explanation`}
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Explain Transaction Purpose
              </label>
              <textarea
                id={`${formId}-explanation`}
                rows={3}
                maxLength={500}
                value={fields.purposeOfTransactionsExplanation}
                onChange={(e) =>
                  setField("purposeOfTransactionsExplanation", e.target.value)
                }
                placeholder="Detail why you are using this payout corridor..."
                className={cn(
                  NEUMORPHIC_INPUT,
                  "resize-none",
                  errors.purposeOfTransactionsExplanation && "ring-2 ring-error/50"
                )}
              />
              {errors.purposeOfTransactionsExplanation && (
                <p className="mt-1.5 text-xs text-error">
                  {errors.purposeOfTransactionsExplanation}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Step Final: Review & Submit --- */}
      {currentStep === reviewStepIndex && (
        <div className="space-y-4 animate-scale-in">
          <p className="text-xs text-text-secondary">
            Please review your information carefully before submitting. You can click{" "}
            <strong>Edit</strong> on any section to make adjustments.
          </p>

          {/* Section 1: Personal Details */}
          <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4")}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                1. Personal Details
              </h4>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className={cn(ACTION_BUTTON_SUBTLE, "w-auto text-xs px-2.5 py-1")}
              >
                <Icon path={ICON_PATHS.edit} size="sm" />
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
              <div>
                <span className="text-text-primary font-medium">Name:</span>{" "}
                {fields.firstName} {fields.lastName}
              </div>
              <div>
                <span className="text-text-primary font-medium">Birth Date:</span>{" "}
                {fields.dateOfBirth}
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <span className="text-text-primary font-medium">Corridor:</span>{" "}
                <span>
                  {COUNTRY_FLAGS[fields.country]} {KYC_COUNTRY_NAMES[fields.country]}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-semibold">
                  {isEnhanced ? "Enhanced Tier" : "Standard Tier"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Address & Tax */}
          <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4")}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                2. Address & Tax Identification
              </h4>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className={cn(ACTION_BUTTON_SUBTLE, "w-auto text-xs px-2.5 py-1")}
              >
                <Icon path={ICON_PATHS.edit} size="sm" />
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
              <div>
                <span className="text-text-primary font-medium">Tax ID:</span>{" "}
                {fields.taxId}
              </div>
              <div>
                <span className="text-text-primary font-medium">Postal Code:</span>{" "}
                {fields.postalCode}
              </div>
              <div className="col-span-2">
                <span className="text-text-primary font-medium">Address:</span>{" "}
                {fields.addressLine1}
                {fields.addressLine2 ? `, ${fields.addressLine2}` : ""}, {fields.city},{" "}
                {fields.stateProvinceRegion}
              </div>
            </div>
          </div>

          {/* Section 3: Identity Documents */}
          <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4")}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                3. Identity Documents
              </h4>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className={cn(ACTION_BUTTON_SUBTLE, "w-auto text-xs px-2.5 py-1")}
              >
                <Icon path={ICON_PATHS.edit} size="sm" />
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary mb-3">
              <div>
                <span className="text-text-primary font-medium">Type:</span>{" "}
                {fields.idDocType}
              </div>
              <div>
                <span className="text-text-primary font-medium">Country:</span>{" "}
                {fields.idDocCountry}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {fields.selfieFileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-border/40">
                  <img
                    src={fields.selfieFileUrl}
                    alt="Selfie"
                    className="w-9 h-9 rounded object-cover"
                  />
                  <span className="text-[11px] font-medium text-text-primary">Selfie</span>
                </div>
              )}
              {fields.idDocFrontFileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-border/40">
                  <img
                    src={fields.idDocFrontFileUrl}
                    alt="Doc Front"
                    className="w-9 h-9 rounded object-cover"
                  />
                  <span className="text-[11px] font-medium text-text-primary">Doc Front</span>
                </div>
              )}
              {fields.idDocBackFileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-border/40">
                  <img
                    src={fields.idDocBackFileUrl}
                    alt="Doc Back"
                    className="w-9 h-9 rounded object-cover"
                  />
                  <span className="text-[11px] font-medium text-text-primary">Doc Back</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Enhanced Compliance (if CO) */}
          {isEnhanced && (
            <div className={cn(NEUMORPHIC_INSET, "rounded-xl p-4")}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  4. Enhanced Compliance
                </h4>
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className={cn(ACTION_BUTTON_SUBTLE, "w-auto text-xs px-2.5 py-1")}
                >
                  <Icon path={ICON_PATHS.edit} size="sm" />
                  Edit
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-text-secondary">
                <div>
                  <span className="text-text-primary font-medium">Proof of Address:</span>{" "}
                  {fields.proofOfAddressDocType}
                </div>
                <div>
                  <span className="text-text-primary font-medium">Source of Funds:</span>{" "}
                  {fields.sourceOfFundsDocType}
                </div>
                <div>
                  <span className="text-text-primary font-medium">Purpose:</span>{" "}
                  {fields.purposeOfTransactions}
                </div>
                {fields.purposeOfTransactionsExplanation && (
                  <div>
                    <span className="text-text-primary font-medium">Explanation:</span>{" "}
                    {fields.purposeOfTransactionsExplanation}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Error Display --- */}
      {submitError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error"
        >
          <Icon path={ICON_PATHS.alertCircle} size="sm" className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* --- Wizard Navigation Buttons --- */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/30">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
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

        <div className="flex items-center gap-2">
          {currentStep < reviewStepIndex ? (
            <button
              type="button"
              onClick={handleNext}
              className={cn(PRIMARY_BUTTON, "py-2.5 px-6 text-xs justify-center")}
            >
              Continue
              <Icon path={ICON_PATHS.chevronRight} size="sm" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(PRIMARY_BUTTON, "py-2.5 px-8 text-xs justify-center font-bold")}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting verification...
                </>
              ) : (
                <>
                  <Icon path={ICON_PATHS.shield} size="sm" />
                  {existingProfile ? "Update Verification" : "Submit Verification"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
