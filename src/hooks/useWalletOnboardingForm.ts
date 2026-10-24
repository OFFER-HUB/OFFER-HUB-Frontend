"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, ProfileApiError } from "@/lib/api/profile";
import { useAuthStore, type User } from "@/stores/auth-store";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  type OnboardingAccountType,
  type OnboardingStep1Values,
  type OnboardingStep2Values,
} from "@/types/onboarding.types";

export type Step1Errors = Partial<Record<keyof OnboardingStep1Values, string>>;
export type Step2Errors = Partial<Record<keyof OnboardingStep2Values, string>>;

function toUserType(value: string): User["type"] {
  if (value === "BUYER" || value === "SELLER" || value === "BOTH") {
    return value;
  }
  return undefined;
}

export function useWalletOnboardingForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);

  const walletAddress = user?.wallet?.publicKey ?? null;
  const isWalletFirstAccount = walletAddress !== null && !user?.email;

  const [step, setStep] = useState<1 | 2>(1);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const [step1, setStep1] = useState<OnboardingStep1Values>({
    firstName: "",
    lastName: "",
    username: user?.username ?? "",
    type: "BUYER",
    country: "",
    phone: "",
    email: "",
  });
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  const [step2, setStep2] = useState<OnboardingStep2Values>({
    professionalTitle: "",
    bio: "",
  });
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsStep2 = step1.type === "SELLER" || step1.type === "BOTH";
  const totalSteps = needsStep2 ? 2 : 1;

  function handleStep1Change(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const field = name as keyof OnboardingStep1Values;
    setStep1((prev) => ({ ...prev, [field]: value }));
    if (step1Errors[field]) setStep1Errors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleRoleSelect(type: OnboardingAccountType) {
    setStep1((prev) => ({ ...prev, type }));
    if (step1Errors.type) setStep1Errors((prev) => ({ ...prev, type: undefined }));
  }

  function handleStep2Change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const field = name as keyof OnboardingStep2Values;
    setStep2((prev) => ({ ...prev, [field]: value }));
    if (step2Errors[field]) setStep2Errors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function submitAll() {
    if (!token) {
      setSubmitError("Your session has expired. Please connect your wallet again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await updateProfile(token, {
        firstName: step1.firstName.trim(),
        lastName: step1.lastName.trim(),
        username: step1.username.trim(),
        type: step1.type,
        location: step1.country.trim() || undefined,
        phone: step1.phone.trim() || undefined,
        ...(!user?.email && step1.email?.trim() ? { email: step1.email.trim() } : {}),
        professionalTitle: step2.professionalTitle.trim() || undefined,
        bio: step2.bio.trim() || undefined,
      });

      if (user) {
        login(
          {
            ...user,
            firstName: profile.firstName,
            lastName: profile.lastName,
            username: profile.username ?? step1.username,
            type: toUserType(profile.type) ?? step1.type,
          },
          token,
        );
      }

      router.push("/app");
    } catch (error) {
      if (error instanceof ProfileApiError) {
        const code = error.code;
        if (code === "USERNAME_TAKEN") {
          setStep(1);
          setStep1Errors({ username: error.message });
        } else if (code === "EMAIL_ALREADY_EXISTS") {
          setStep(1);
          setStep1Errors({ email: error.message });
        } else if (code === "VALIDATION_ERROR" && error.message.toLowerCase().includes("phone")) {
          setStep(1);
          setStep1Errors({ phone: error.message });
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError("Something went wrong. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = onboardingStep1Schema.safeParse(step1);
    if (!parsed.success) {
      const errs: Step1Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof OnboardingStep1Values;
        if (!errs[field]) errs[field] = issue.message;
      }
      setStep1Errors(errs);
      return;
    }

    if (needsStep2) {
      setStep(2);
    } else {
      void submitAll();
    }
  }

  function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = onboardingStep2Schema.safeParse(step2);
    if (!parsed.success) {
      const errs: Step2Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof OnboardingStep2Values;
        if (!errs[field]) errs[field] = issue.message;
      }
      setStep2Errors(errs);
      return;
    }

    void submitAll();
  }

  return {
    step,
    setStep,
    isWalletModalOpen,
    setIsWalletModalOpen,
    step1,
    step1Errors,
    step2,
    step2Errors,
    submitError,
    isSubmitting,
    walletAddress,
    isWalletFirstAccount,
    needsStep2,
    totalSteps,
    user,
    handleStep1Change,
    handleRoleSelect,
    handleStep2Change,
    handleStep1Submit,
    handleStep2Submit,
  };
}
