"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
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

// ─── Pure utility functions (re-exported from here; KycForm.tsx re-exports them) ─

export function cleanLettersOnly(value: string): string {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-'.]/g, "");
}

export function maskTaxId(value: string, country: string): string {
  switch (country) {
    case "BR": {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9)
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    case "AR": {
      const digits = value.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 2) return digits;
      if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
    }
    case "MX":
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 13);
    case "CO":
      return value.replace(/\D/g, "").slice(0, 15);
    default:
      return value.slice(0, 64);
  }
}

export function maskPostalCode(value: string, country: string): string {
  switch (country) {
    case "BR": {
      const digits = value.replace(/\D/g, "").slice(0, 8);
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    case "MX":
      return value.replace(/\D/g, "").slice(0, 5);
    case "CO":
      return value.replace(/\D/g, "").slice(0, 6);
    case "AR":
      return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    default:
      return value.slice(0, 20);
  }
}

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(digits[9], 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  return rev === parseInt(digits[10], 10);
}

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// KYC_CORRIDORS is defined in KycForm.tsx (it's a UI constant with flag/tier data).
// The hook only needs the first corridor's code as the default country value.
const DEFAULT_CORRIDOR_CODE = "BR";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KycFormFields {
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

export type KycFormErrors = Partial<Record<keyof KycFormFields, string>>;

interface CurrentUserNames {
  firstName?: string | null;
  lastName?: string | null;
}

function initialFields(
  existing?: KycProfile | null,
  currentUser?: CurrentUserNames | null
): KycFormFields {
  return {
    firstName: currentUser?.firstName ?? "",
    lastName: currentUser?.lastName ?? "",
    dateOfBirth: "",
    country: existing?.country ?? DEFAULT_CORRIDOR_CODE,
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

export interface UseKycFormOptions {
  existingProfile?: KycProfile | null;
  onSuccess?: (profile: KycProfile) => void;
}

export interface UseKycFormReturn {
  // State
  fields: KycFormFields;
  errors: KycFormErrors;
  submitError: string | null;
  isSubmitting: boolean;
  currentStep: number;
  totalSteps: number;
  reviewStepIndex: number;
  stepTitles: string[];
  isEnhanced: boolean;
  // Computed placeholders
  taxIdPlaceholder: string;
  postalPlaceholder: string;
  // Field setter
  setField: <K extends keyof KycFormFields>(key: K, value: KycFormFields[K]) => void;
  // Navigation
  handleNext: () => void;
  handleBack: () => void;
  goToStep: (step: number) => void;
  // Submit
  handleSubmit: (event: React.FormEvent) => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useKycForm({
  existingProfile,
  onSuccess,
}: UseKycFormOptions = {}): UseKycFormReturn {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);

  const [fields, setFields] = useState<KycFormFields>(() =>
    initialFields(existingProfile, currentUser)
  );
  const [errors, setErrors] = useState<KycFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Prefill names and birth date from profile on mount
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
        /* best-effort prefill — ignore errors */
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
    return ["Personal Details", "Address & Tax", "Identity Document", "Review & Submit"];
  }, [isEnhanced]);

  // ── Field setter — clears the field's error on change ──────────────────────
  function setField<K extends keyof KycFormFields>(key: K, value: KycFormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  // ── Step validation ────────────────────────────────────────────────────────
  function validateStep(step: number): boolean {
    const nextErrors: KycFormErrors = {};

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
          nextErrors.dateOfBirth =
            "You must be at least 18 years old to complete verification";
        }
      }
      if (!fields.country) nextErrors.country = "Select a payout country";
    }

    if (step === 2) {
      if (!fields.taxId.trim()) {
        nextErrors.taxId = "Tax identification number is required";
      } else if (fields.country === "BR" && !isValidCpf(fields.taxId)) {
        nextErrors.taxId =
          "Invalid CPF number. Please enter a valid 11-digit Brazilian CPF";
      }
      if (!fields.addressLine1.trim())
        nextErrors.addressLine1 = "Street address is required";
      if (!fields.city.trim()) nextErrors.city = "City is required";
      if (!fields.stateProvinceRegion.trim())
        nextErrors.stateProvinceRegion = "State / Province is required";
      if (!fields.postalCode.trim()) nextErrors.postalCode = "Postal code is required";
    }

    if (step === 3) {
      if (!fields.idDocType) nextErrors.idDocType = "Select an identity document type";
      if (!fields.idDocCountry) nextErrors.idDocCountry = "Select the issuing country";
      if (!fields.selfieFileUrl)
        nextErrors.selfieFileUrl = "A clear selfie photo is required";
      if (!fields.idDocFrontFileUrl)
        nextErrors.idDocFrontFileUrl = "Front side of your ID document is required";
      if (fields.idDocType !== "PASSPORT" && !fields.idDocBackFileUrl) {
        nextErrors.idDocBackFileUrl =
          "Back side of your ID document is required";
      }
    }

    if (isEnhanced && step === 4) {
      if (!fields.proofOfAddressDocType)
        nextErrors.proofOfAddressDocType = "Select proof of address type";
      if (!fields.proofOfAddressDocFileUrl)
        nextErrors.proofOfAddressDocFileUrl =
          "Upload a proof of address document";
      if (!fields.sourceOfFundsDocType)
        nextErrors.sourceOfFundsDocType = "Select primary source of funds";
      if (!fields.sourceOfFundsDocFileUrl)
        nextErrors.sourceOfFundsDocFileUrl =
          "Upload supporting source of funds document";
      if (!fields.purposeOfTransactions)
        nextErrors.purposeOfTransactions =
          "Select expected purpose of transactions";
      if (
        fields.purposeOfTransactions === "other" &&
        !fields.purposeOfTransactionsExplanation.trim()
      ) {
        nextErrors.purposeOfTransactionsExplanation =
          "Please explain the purpose of your transactions";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitError(null);

    // Validate all data-entry steps before submitting
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
              proofOfAddressDocType:
                (fields.proofOfAddressDocType as ProofOfAddressDocType) || undefined,
              proofOfAddressDocFileUrl: fields.proofOfAddressDocFileUrl || undefined,
              sourceOfFundsDocType:
                (fields.sourceOfFundsDocType as SourceOfFundsDocType) || undefined,
              sourceOfFundsDocFileUrl: fields.sourceOfFundsDocFileUrl || undefined,
              purposeOfTransactions:
                (fields.purposeOfTransactions as PurposeOfTransactions) || undefined,
              purposeOfTransactionsExplanation:
                fields.purposeOfTransactionsExplanation.trim() || undefined,
            }
          : {}),
      };

      const saved = await submitKyc(token, payload);
      onSuccess?.(saved);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit your verification."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Derived placeholders ───────────────────────────────────────────────────
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

  // Expose a typed setField that also applies masking for country-dependent fields
  function setFieldWithMask<K extends keyof KycFormFields>(
    key: K,
    rawValue: KycFormFields[K]
  ) {
    let value = rawValue;
    if (key === "taxId") {
      value = maskTaxId(rawValue as string, fields.country) as KycFormFields[K];
    } else if (key === "postalCode") {
      value = maskPostalCode(rawValue as string, fields.country) as KycFormFields[K];
    } else if (key === "firstName" || key === "lastName" || key === "city" || key === "stateProvinceRegion") {
      value = cleanLettersOnly(rawValue as string) as KycFormFields[K];
    }
    setField(key, value);
  }

  return {
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
    setField: setFieldWithMask,
    handleNext,
    handleBack,
    goToStep,
    handleSubmit,
  };
}
