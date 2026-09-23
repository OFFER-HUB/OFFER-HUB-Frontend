import { useState } from "react";
import { onboardingStep1Schema, onboardingStep2Schema, type OnboardingStep1Values, type OnboardingStep2Values } from "@/types/onboarding.types";

export function useWalletOnboardingForm(initialStep1: OnboardingStep1Values, initialStep2: OnboardingStep2Values) {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState(initialStep1);
  const [step2, setStep2] = useState(initialStep2);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateStep1 = () => { const result = onboardingStep1Schema.safeParse(step1); if (!result.success) { setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return false; } setErrors({}); return true; };
  const validateStep2 = () => { const result = onboardingStep2Schema.safeParse(step2); if (!result.success) { setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return false; } setErrors({}); return true; };
  return { step, setStep, step1, setStep1, step2, setStep2, errors, setErrors, validateStep1, validateStep2 };
}
