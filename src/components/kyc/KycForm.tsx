"use client";

import { useEffect, useId, useMemo, useState } from "react";
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
import { COUNTRY_FLAGS } from "@/components/bank-accounts/BankAccountForm";
import { KycFileUploadField } from "@/components/kyc/KycFileUploadField";
import { getProfile } from "@/lib/api/profile";
import {
  submitKyc,
  requiresEnhancedKyc,
  type KycProfile,
  type SubmitKycData,
  type KycIdDocType,
  type ProofOfAddressDocType,
  type SourceOfFundsDocType,
  type PurposeOfTransactions,
} from "@/lib/api/kyc";

// Strictly the 4 BlindPay supported payout countries
export const KYC_CORRIDORS = [
  { code: "BR", name: "Brazil", flag: "🇧🇷", tier: "standard", reviewTime: "Instant" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", tier: "standard", reviewTime: "Instant" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", tier: "standard", reviewTime: "Instant" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", tier: "enhanced", reviewTime: "Manual review (up to 1 business day)" },
] as const;

export const KYC_COUNTRY_NAMES: Record<string, string> = Object.fromEntries(
  KYC_CORRIDORS.map((c) => [c.code, c.name])
);

// Comprehensive list of countries for ID Document Issuing Country (can be any country)
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

// --- Input Masking & Character Sanitization ---

export function cleanLettersOnly(value: string): string {
  // Allows letters, accents, spaces, hyphens, dots, and apostrophes
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-'.]/g, "");
}

export function maskTaxId(value: string, country: string): string {
  switch (country) {
    case "BR": {
      // CPF: 000.000.000-00
      const digits = value.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    case "AR": {
      // CUIT: 00-00000000-0
      const digits = value.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 2) return digits;
      if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
    }
    case "MX": {
      // RFC: Up to 13 uppercase alphanumeric
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 13);
    }
    case "CO": {
      // NIT / Cédula: Digits, max 15
      return value.replace(/\D/g, "").slice(0, 15);
    }
    default:
      return value.slice(0, 64);
  }
}

export function maskPostalCode(value: string, country: string): string {
  switch (country) {
    case "BR": {
      // CEP: 00000-000
      const digits = value.replace(/\D/g, "").slice(0, 8);
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    case "MX": {
      // CP: 5 digits
      return value.replace(/\D/g, "").slice(0, 5);
    }
    case "CO": {
      // Postal Code: 6 digits
      return value.replace(/\D/g, "").slice(0, 6);
    }
    case "AR": {
      // Postal code: 4-8 alphanumeric
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    }
    default:
      return value.slice(0, 20);
  }
}

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(digits[10], 10)) return false;

  return true;
}

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export interface KycFormProps {
  existingProfile?: KycProfile | null;
  onSuccess?: (profile: KycProfile) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormFields {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  taxId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvinceRegion: string;
  postalCode: string;
  idDocCountry: string;
  idDocType: KycIdDocType;
  selfieFileUrl: string;
  idDocFrontFileUrl: string;
  idDocBackFileUrl: string;
  proofOfAddressDocType: ProofOfAddressDocType | "";
  proofOfAddressDocFileUrl: string;
  sourceOfFundsDocType: SourceOfFundsDocType | "";
  sourceOfFundsDocFileUrl: string;
  purposeOfTransactions: PurposeOfTransactions | "";
  purposeOfTransactionsExplanation: string;
}

interface CurrentUserNames {
  firstName?: string | null;
  lastName?: string | null;
}

function initialFields(existing?: KycProfile | null, currentUser?: CurrentUserNames | null): FormFields {
  return {
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    dateOfBirth: "",
    country: existing?.country ?? KYC_CORRIDORS[0].code,
    taxId: existing?.taxId ?? "",
    addressLine1: existing?.addressLine1 ?? "",
    addressLine2: existing?.addressLine2 ?? "",
    city: existing?.city ?? "",
    stateProvinceRegion: existing?.stateProvinceRegion ?? "",
    postalCode: existing?.postalCode ?? "",
    idDocCountry: existing?.idDocCountry ?? "BR",
    idDocType: existing?.idDocType ?? "PASSPORT",
    selfieFileUrl: existing?.selfieFileUrl ?? "",
    idDocFrontFileUrl: existing?.idDocFrontFileUrl ?? "",
    idDocBackFileUrl: existing?.idDocBackFileUrl ?? "",
    proofOfAddressDocType: existing?.proofOfAddressDocType ?? "",
    proofOfAddressDocFileUrl: existing?.proofOfAddressDocFileUrl ?? "",
    sourceOfFundsDocType: existing?.sourceOfFundsDocType ?? "",
    sourceOfFundsDocFileUrl: existing?.sourceOfFundsDocFileUrl ?? "",
    purposeOfTransactions: existing?.purposeOfTransactions ?? "",
    purposeOfTransactionsExplanation: existing?.purposeOfTransactionsExplanation ?? "",
  };
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

export function KycForm({ existingProfile, onSuccess, onCancel, className }: KycFormProps): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const formId = useId();

  const [fields, setFields] = useState<FormFields>(() => initialFields(existingProfile, currentUser));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Prefill profile names and birth date from account
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    getProfile(token)
      .then((profile) => {
        if (cancelled) return;
        setFields((prev) => ({
          ...prev,
          firstName: prev.firstName || profile.firstName || "",
          lastName: prev.lastName || profile.lastName || "",
          dateOfBirth: prev.dateOfBirth || profile.dateOfBirth?.slice(0, 10) || "",
        }));
      })
      .catch(() => {
        /* best-effort prefill */
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const isEnhanced = requiresEnhancedKyc(fields.country);
  const totalSteps = isEnhanced ? 5 : 4;
  const reviewStepIndex = totalSteps;

  const stepTitles = useMemo(() => {
    if (isEnhanced) {
      return [
        "Personal Details",
        "Address & Tax",
        "Identity Document",
        "Enhanced Compliance",
        "Review & Submit",
      ];
    }
    return [
      "Personal Details",
      "Address & Tax",
      "Identity Document",
      "Review & Submit",
    ];
  }, [isEnhanced]);

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  // --- Step Validation ---
  function validateStep(step: number): boolean {
    const nextErrors: FormErrors = {};

    if (step === 1) {
      if (!fields.firstName.trim()) nextErrors.firstName = "First name is required";
      if (!fields.lastName.trim()) nextErrors.lastName = "Last name is required";
      if (!fields.dateOfBirth) {
        nextErrors.dateOfBirth = "Date of birth is required";
      } else {
        const age = calculateAge(fields.dateOfBirth);
        const dobDate = new Date(fields.dateOfBirth);
        if (dobDate > new Date()) {
          nextErrors.dateOfBirth = "Date of birth cannot be in the future";
        } else if (age < 18) {
          nextErrors.dateOfBirth = "You must be at least 18 years old to complete verification";
        }
      }
      if (!fields.country) nextErrors.country = "Select a payout country";
    }

    if (step === 2) {
      if (!fields.taxId.trim()) {
        nextErrors.taxId = "Tax identification number is required";
      } else if (fields.country === "BR" && !isValidCpf(fields.taxId)) {
        nextErrors.taxId = "Invalid CPF number. Please enter a valid 11-digit Brazilian CPF";
      }
      if (!fields.addressLine1.trim()) nextErrors.addressLine1 = "Street address is required";
      if (!fields.city.trim()) nextErrors.city = "City is required";
      if (!fields.stateProvinceRegion.trim()) nextErrors.stateProvinceRegion = "State / Province is required";
      if (!fields.postalCode.trim()) nextErrors.postalCode = "Postal code is required";
    }

    if (step === 3) {
      if (!fields.idDocType) nextErrors.idDocType = "Select an identity document type";
      if (!fields.idDocCountry) nextErrors.idDocCountry = "Select the issuing country";
      if (!fields.selfieFileUrl) nextErrors.selfieFileUrl = "A clear selfie photo is required";
      if (!fields.idDocFrontFileUrl) nextErrors.idDocFrontFileUrl = "Front side of your ID document is required";
      if (fields.idDocType !== "PASSPORT" && !fields.idDocBackFileUrl) {
        nextErrors.idDocBackFileUrl = "Back side of your ID document is required";
      }
    }

    if (isEnhanced && step === 4) {
      if (!fields.proofOfAddressDocType) nextErrors.proofOfAddressDocType = "Select proof of address type";
      if (!fields.proofOfAddressDocFileUrl) nextErrors.proofOfAddressDocFileUrl = "Upload a proof of address document";
      if (!fields.sourceOfFundsDocType) nextErrors.sourceOfFundsDocType = "Select primary source of funds";
      if (!fields.sourceOfFundsDocFileUrl) nextErrors.sourceOfFundsDocFileUrl = "Upload supporting source of funds document";
      if (!fields.purposeOfTransactions) nextErrors.purposeOfTransactions = "Select expected purpose of transactions";
      if (fields.purposeOfTransactions === "other" && !fields.purposeOfTransactionsExplanation.trim()) {
        nextErrors.purposeOfTransactionsExplanation = "Please explain the purpose of your transactions";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    setSubmitError(null);
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  }

  function handleBack() {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  function goToStep(targetStep: number) {
    setSubmitError(null);
    setCurrentStep(targetStep);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    // Validate all steps prior to submission
    for (let s = 1; s < reviewStepIndex; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    if (!token) {
      setSubmitError("Your session has expired. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SubmitKycData = {
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        dateOfBirth: fields.dateOfBirth,
        country: fields.country,
        taxId: fields.taxId.trim(),
        addressLine1: fields.addressLine1.trim(),
        addressLine2: fields.addressLine2.trim() || undefined,
        city: fields.city.trim(),
        stateProvinceRegion: fields.stateProvinceRegion.trim(),
        postalCode: fields.postalCode.trim(),
        idDocCountry: fields.idDocCountry,
        idDocType: fields.idDocType,
        selfieFileUrl: fields.selfieFileUrl,
        idDocFrontFileUrl: fields.idDocFrontFileUrl,
        idDocBackFileUrl: fields.idDocBackFileUrl || undefined,
        ...(isEnhanced
          ? {
              proofOfAddressDocType: (fields.proofOfAddressDocType as ProofOfAddressDocType) || undefined,
              proofOfAddressDocFileUrl: fields.proofOfAddressDocFileUrl || undefined,
              sourceOfFundsDocType: (fields.sourceOfFundsDocType as SourceOfFundsDocType) || undefined,
              sourceOfFundsDocFileUrl: fields.sourceOfFundsDocFileUrl || undefined,
              purposeOfTransactions: (fields.purposeOfTransactions as PurposeOfTransactions) || undefined,
              purposeOfTransactionsExplanation: fields.purposeOfTransactionsExplanation.trim() || undefined,
            }
          : {}),
      };

      const saved = await submitKyc(token, payload);
      onSuccess?.(saved);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit your verification.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const taxIdPlaceholder = useMemo(() => {
    switch (fields.country) {
      case "BR":
        return "000.000.000-00 (CPF)";
      case "MX":
        return "RFC / CURP (e.g. ABCD123456XYZ)";
      case "AR":
        return "00-00000000-0 (CUIT)";
      case "CO":
        return "NIT / Cédula de Ciudadanía";
      default:
        return "Tax identification number";
    }
  }, [fields.country]);

  const postalPlaceholder = useMemo(() => {
    switch (fields.country) {
      case "BR":
        return "00000-000 (CEP)";
      case "MX":
        return "5-digit Postal Code";
      case "AR":
        return "e.g. C1024 / 1425";
      case "CO":
        return "6-digit Postal Code";
      default:
        return "Postal code";
    }
  }, [fields.country]);

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
                    !isCurrent && !isCompleted && "bg-background text-text-secondary opacity-60 cursor-not-allowed"
                  )}
                >
                  {isCompleted ? <Icon path={ICON_PATHS.check} size="sm" /> : stepNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Enhanced KYC Notice for Colombia */}
        {fields.country === "CO" && (
          <div className="mt-3.5 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs text-text-primary">
            <Icon path={ICON_PATHS.infoCircle} size="sm" className="text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-primary">Colombia Enhanced Verification:</span>{" "}
              In accordance with BlindPay compliance standards, accounts in Colombia require enhanced verification
              and are reviewed manually by BlindPay (typically within 1 business day).
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
                      set("country", corridor.code);
                      set("taxId", "");
                      set("postalCode", "");
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
                      <p className="text-[10px] text-text-secondary capitalize">{corridor.tier} tier</p>
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
              <label htmlFor={`${formId}-firstName`} className="block text-sm font-medium text-text-primary mb-2">
                First Name
              </label>
              <input
                id={`${formId}-firstName`}
                type="text"
                value={fields.firstName}
                maxLength={100}
                onChange={(e) => set("firstName", cleanLettersOnly(e.target.value))}
                placeholder="e.g. Maria"
                className={cn(NEUMORPHIC_INPUT, errors.firstName && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.firstName)}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-error">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor={`${formId}-lastName`} className="block text-sm font-medium text-text-primary mb-2">
                Last Name
              </label>
              <input
                id={`${formId}-lastName`}
                type="text"
                value={fields.lastName}
                maxLength={100}
                onChange={(e) => set("lastName", cleanLettersOnly(e.target.value))}
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
            <label htmlFor={`${formId}-dateOfBirth`} className="block text-sm font-medium text-text-primary mb-2">
              Date of Birth
            </label>
            <input
              id={`${formId}-dateOfBirth`}
              type="date"
              value={fields.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
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
            <label htmlFor={`${formId}-taxId`} className="block text-sm font-medium text-text-primary mb-2">
              Tax ID / National Identification ({KYC_COUNTRY_NAMES[fields.country]})
            </label>
            <input
              id={`${formId}-taxId`}
              type="text"
              value={fields.taxId}
              maxLength={64}
              onChange={(e) => set("taxId", maskTaxId(e.target.value, fields.country))}
              placeholder={taxIdPlaceholder}
              className={cn(NEUMORPHIC_INPUT, errors.taxId && "ring-2 ring-error/50")}
              aria-invalid={Boolean(errors.taxId)}
            />
            {errors.taxId && (
              <p className="mt-1.5 text-xs text-error">{errors.taxId}</p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-addressLine1`} className="block text-sm font-medium text-text-primary mb-2">
              Street Address
            </label>
            <input
              id={`${formId}-addressLine1`}
              type="text"
              value={fields.addressLine1}
              maxLength={200}
              onChange={(e) => set("addressLine1", e.target.value)}
              placeholder="e.g. Av. Paulista, 1000, Apt 42"
              className={cn(NEUMORPHIC_INPUT, errors.addressLine1 && "ring-2 ring-error/50")}
              aria-invalid={Boolean(errors.addressLine1)}
            />
            {errors.addressLine1 && (
              <p className="mt-1.5 text-xs text-error">{errors.addressLine1}</p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-addressLine2`} className="block text-sm font-medium text-text-primary mb-2">
              Address Line 2 <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <input
              id={`${formId}-addressLine2`}
              type="text"
              value={fields.addressLine2}
              maxLength={200}
              onChange={(e) => set("addressLine2", e.target.value)}
              placeholder="Suite, building, floor, etc."
              className={NEUMORPHIC_INPUT}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor={`${formId}-city`} className="block text-sm font-medium text-text-primary mb-2">
                City
              </label>
              <input
                id={`${formId}-city`}
                type="text"
                value={fields.city}
                maxLength={100}
                onChange={(e) => set("city", cleanLettersOnly(e.target.value))}
                placeholder="e.g. São Paulo"
                className={cn(NEUMORPHIC_INPUT, errors.city && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.city)}
              />
              {errors.city && (
                <p className="mt-1.5 text-xs text-error">{errors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor={`${formId}-stateProvinceRegion`} className="block text-sm font-medium text-text-primary mb-2">
                State / Province
              </label>
              <input
                id={`${formId}-stateProvinceRegion`}
                type="text"
                value={fields.stateProvinceRegion}
                maxLength={100}
                onChange={(e) => set("stateProvinceRegion", cleanLettersOnly(e.target.value))}
                placeholder="e.g. SP"
                className={cn(NEUMORPHIC_INPUT, errors.stateProvinceRegion && "ring-2 ring-error/50")}
                aria-invalid={Boolean(errors.stateProvinceRegion)}
              />
              {errors.stateProvinceRegion && (
                <p className="mt-1.5 text-xs text-error">{errors.stateProvinceRegion}</p>
              )}
            </div>

            <div>
              <label htmlFor={`${formId}-postalCode`} className="block text-sm font-medium text-text-primary mb-2">
                Postal Code
              </label>
              <input
                id={`${formId}-postalCode`}
                type="text"
                value={fields.postalCode}
                maxLength={20}
                onChange={(e) => set("postalCode", maskPostalCode(e.target.value, fields.country))}
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
              <label htmlFor={`${formId}-idDocType`} className="block text-sm font-medium text-text-primary mb-2">
                Document Type
              </label>
              <div className="relative">
                <select
                  id={`${formId}-idDocType`}
                  value={fields.idDocType}
                  onChange={(e) => set("idDocType", e.target.value as KycIdDocType)}
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
              <label htmlFor={`${formId}-idDocCountry`} className="block text-sm font-medium text-text-primary mb-2">
                Document Issuing Country
              </label>
              <div className="relative">
                <select
                  id={`${formId}-idDocCountry`}
                  value={fields.idDocCountry}
                  onChange={(e) => set("idDocCountry", e.target.value)}
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
            onChange={(url) => set("selfieFileUrl", url)}
            error={errors.selfieFileUrl}
          />

          <KycFileUploadField
            label="Document Front Side"
            value={fields.idDocFrontFileUrl}
            onChange={(url) => set("idDocFrontFileUrl", url)}
            error={errors.idDocFrontFileUrl}
          />

          {fields.idDocType !== "PASSPORT" ? (
            <KycFileUploadField
              label="Document Back Side"
              value={fields.idDocBackFileUrl}
              onChange={(url) => set("idDocBackFileUrl", url)}
              error={errors.idDocBackFileUrl}
            />
          ) : (
            <KycFileUploadField
              label="Document Back Side"
              value={fields.idDocBackFileUrl}
              onChange={(url) => set("idDocBackFileUrl", url)}
              optional
            />
          )}
        </div>
      )}

      {/* --- Step 4: Enhanced Compliance (CO Only) --- */}
      {isEnhanced && currentStep === 4 && (
        <div className="space-y-4 animate-scale-in">
          <div>
            <label htmlFor={`${formId}-proofOfAddressDocType`} className="block text-sm font-medium text-text-primary mb-2">
              Proof of Address Document
            </label>
            <div className="relative">
              <select
                id={`${formId}-proofOfAddressDocType`}
                value={fields.proofOfAddressDocType}
                onChange={(e) => set("proofOfAddressDocType", e.target.value as ProofOfAddressDocType)}
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
            onChange={(url) => set("proofOfAddressDocFileUrl", url)}
            error={errors.proofOfAddressDocFileUrl}
          />

          <div>
            <label htmlFor={`${formId}-sourceOfFundsDocType`} className="block text-sm font-medium text-text-primary mb-2">
              Primary Source of Funds
            </label>
            <div className="relative">
              <select
                id={`${formId}-sourceOfFundsDocType`}
                value={fields.sourceOfFundsDocType}
                onChange={(e) => set("sourceOfFundsDocType", e.target.value as SourceOfFundsDocType)}
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
            onChange={(url) => set("sourceOfFundsDocFileUrl", url)}
            error={errors.sourceOfFundsDocFileUrl}
          />

          <div>
            <label htmlFor={`${formId}-purposeOfTransactions`} className="block text-sm font-medium text-text-primary mb-2">
              Purpose of Transactions
            </label>
            <div className="relative">
              <select
                id={`${formId}-purposeOfTransactions`}
                value={fields.purposeOfTransactions}
                onChange={(e) => set("purposeOfTransactions", e.target.value as PurposeOfTransactions)}
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
              <label htmlFor={`${formId}-explanation`} className="block text-sm font-medium text-text-primary mb-2">
                Explain Transaction Purpose
              </label>
              <textarea
                id={`${formId}-explanation`}
                rows={3}
                maxLength={500}
                value={fields.purposeOfTransactionsExplanation}
                onChange={(e) => set("purposeOfTransactionsExplanation", e.target.value)}
                placeholder="Detail why you are using this payout corridor..."
                className={cn(NEUMORPHIC_INPUT, "resize-none", errors.purposeOfTransactionsExplanation && "ring-2 ring-error/50")}
              />
              {errors.purposeOfTransactionsExplanation && (
                <p className="mt-1.5 text-xs text-error">{errors.purposeOfTransactionsExplanation}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Step Final: Review & Submit --- */}
      {currentStep === reviewStepIndex && (
        <div className="space-y-4 animate-scale-in">
          <p className="text-xs text-text-secondary">
            Please review your information carefully before submitting. You can click <strong>Edit</strong> on any section to make adjustments.
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
                <span className="text-text-primary font-medium">Name:</span> {fields.firstName} {fields.lastName}
              </div>
              <div>
                <span className="text-text-primary font-medium">Birth Date:</span> {fields.dateOfBirth}
              </div>
              <div className="col-span-2 flex items-center gap-1.5">
                <span className="text-text-primary font-medium">Corridor:</span>{" "}
                <span>{COUNTRY_FLAGS[fields.country]} {KYC_COUNTRY_NAMES[fields.country]}</span>
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
                <span className="text-text-primary font-medium">Tax ID:</span> {fields.taxId}
              </div>
              <div>
                <span className="text-text-primary font-medium">Postal Code:</span> {fields.postalCode}
              </div>
              <div className="col-span-2">
                <span className="text-text-primary font-medium">Address:</span> {fields.addressLine1}
                {fields.addressLine2 ? `, ${fields.addressLine2}` : ""}, {fields.city}, {fields.stateProvinceRegion}
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
                <span className="text-text-primary font-medium">Type:</span> {fields.idDocType}
              </div>
              <div>
                <span className="text-text-primary font-medium">Country:</span> {fields.idDocCountry}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {fields.selfieFileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-border/40">
                  <img src={fields.selfieFileUrl} alt="Selfie" className="w-9 h-9 rounded object-cover" />
                  <span className="text-[11px] font-medium text-text-primary">Selfie</span>
                </div>
              )}
              {fields.idDocFrontFileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-border/40">
                  <img src={fields.idDocFrontFileUrl} alt="Doc Front" className="w-9 h-9 rounded object-cover" />
                  <span className="text-[11px] font-medium text-text-primary">Doc Front</span>
                </div>
              )}
              {fields.idDocBackFileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-border/40">
                  <img src={fields.idDocBackFileUrl} alt="Doc Back" className="w-9 h-9 rounded object-cover" />
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
                  <span className="text-text-primary font-medium">Proof of Address:</span> {fields.proofOfAddressDocType}
                </div>
                <div>
                  <span className="text-text-primary font-medium">Source of Funds:</span> {fields.sourceOfFundsDocType}
                </div>
                <div>
                  <span className="text-text-primary font-medium">Purpose:</span> {fields.purposeOfTransactions}
                </div>
                {fields.purposeOfTransactionsExplanation && (
                  <div>
                    <span className="text-text-primary font-medium">Explanation:</span> {fields.purposeOfTransactionsExplanation}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Error Display --- */}
      {submitError && (
        <div role="alert" className="p-3 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2 text-xs text-error">
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
