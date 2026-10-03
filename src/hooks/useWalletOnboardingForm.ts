"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileApiError, updateProfile } from "@/lib/api/profile";
import { useAuthStore, type User } from "@/stores/auth-store";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  type OnboardingAccountType,
  type OnboardingStep1Values,
  type OnboardingStep2Values,
} from "@/types/onboarding.types";

type Step1Errors = Partial<Record<keyof OnboardingStep1Values, string>>;
type Step2Errors = Partial<Record<keyof OnboardingStep2Values, string>>;

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

  function handleStep1Change(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const field = name as keyof OnboardingStep1Values;
    setStep1((previous) => ({ ...previous, [field]: value }));
    if (step1Errors[field]) {
      setStep1Errors((previous) => ({ ...previous, [field]: undefined }));
    }
  }

  function handleRoleSelect(type: OnboardingAccountType) {
    setStep1((previous) => ({ ...previous, type }));
    if (step1Errors.type) {
      setStep1Errors((previous) => ({ ...previous, type: undefined }));
    }
  }

  function handleStep2Change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const field = name as keyof OnboardingStep2Values;
    setStep2((previous) => ({ ...previous, [field]: value }));
    if (step2Errors[field]) {
      setStep2Errors((previous) => ({ ...previous, [field]: undefined }));
    }
  }

  async function submitAll() {
    if (!token) {
      setSubmitError("Your session has expired. Please connect your wallet again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
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
        if (error.code === "USERNAME_TAKEN") {
          setStep(1);
          setStep1Errors({ username: error.message });
        } else if (error.code === "EMAIL_ALREADY_EXISTS") {
          setStep(1);
          setStep1Errors({ email: error.message });
        } else if (
          error.code === "VALIDATION_ERROR" &&
          error.message.toLowerCase().includes("phone")
        ) {
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

  function handleStep1Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = onboardingStep1Schema.safeParse(step1);
    if (!parsed.success) {
      const errors: Step1Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof OnboardingStep1Values;
        if (!errors[field]) errors[field] = issue.message;
      }
      setStep1Errors(errors);
      return;
    }

    setStep1Errors({});
    if (needsStep2) {
      setStep(2);
    } else {
      void submitAll();
    }
  }

  function handleStep2Submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = onboardingStep2Schema.safeParse(step2);
    if (!parsed.success) {
      const errors: Step2Errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof OnboardingStep2Values;
        if (!errors[field]) errors[field] = issue.message;
      }
      setStep2Errors(errors);
      return;
    }

    setStep2Errors({});
    void submitAll();
  }

  return {
    user,
    step,
    step1,
    step1Errors,
    step2,
    step2Errors,
    submitError,
    isSubmitting,
    needsStep2,
    walletAddress,
    isWalletFirstAccount,
    handleStep1Change,
    handleRoleSelect,
    handleStep2Change,
    handleStep1Submit,
    handleStep2Submit,
    goToStep1: () => setStep(1),
  };
}
