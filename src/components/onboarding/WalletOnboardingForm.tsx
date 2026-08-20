"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { cn } from "@/lib/cn";
import { updateProfile } from "@/lib/api/profile";
import { useAuthStore, type User } from "@/stores/auth-store";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  type OnboardingAccountType,
  type OnboardingStep1Values,
  type OnboardingStep2Values,
} from "@/types/onboarding.types";

const ROLE_OPTIONS: ReadonlyArray<{
  id: OnboardingAccountType;
  label: string;
  hint: string;
  icon: React.ReactNode;
}> = [
  {
    id: "BUYER",
    label: "Client",
    hint: "I need to hire",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11h2M8 11H6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M8 3l1 4M16 3l-1 4" />
      </svg>
    ),
  },
  {
    id: "SELLER",
    label: "Freelancer",
    hint: "I offer services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.442 2.798H4.24c-1.472 0-2.441-1.798-1.441-2.798L4.8 15.3" />
      </svg>
    ),
  },
  {
    id: "BOTH",
    label: "Both",
    hint: "I do both",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
];

type Step1Errors = Partial<Record<keyof OnboardingStep1Values, string>>;
type Step2Errors = Partial<Record<keyof OnboardingStep2Values, string>>;

function toUserType(value: string): User["type"] {
  if (value === "BUYER" || value === "SELLER" || value === "BOTH" || value === "ADMIN") {
    return value;
  }
  return undefined;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                active && "bg-primary text-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                done && "bg-primary/20 text-primary",
                !active && !done && "bg-[#F3F4F6] text-text-secondary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              )}
            >
              {done ? (
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : step}
            </div>
            {step < total && (
              <div className={cn("w-8 h-0.5 rounded-full transition-all duration-300", done ? "bg-primary/40" : "bg-gray-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WalletOnboardingForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState<1 | 2>(1);

  const [step1, setStep1] = useState<OnboardingStep1Values>({
    firstName: "",
    lastName: "",
    username: user?.username ?? "",
    type: "BUYER",
    country: "",
    phone: "",
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

  async function submitAll() {
    if (!token) {
      setSubmitError("Authentication token not found. Please log in again.");
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
      setSubmitError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalSteps = needsStep2 ? 2 : 1;

  return (
    <AuthLayout>
      <div
        className="text-center mb-4 opacity-0 animate-fade-in-up"
        style={{ animationFillMode: "forwards" }}
      >
        <h1 className="text-2xl font-bold text-text-primary mb-1">Complete your profile</h1>
        <p className="text-sm text-text-secondary">
          {step === 1 ? "Tell us a bit about yourself" : "Describe what you offer"}
        </p>
      </div>

      {totalSteps > 1 && <StepIndicator current={step} total={totalSteps} />}

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthInput
              label="First name"
              type="text"
              name="firstName"
              value={step1.firstName}
              onChange={handleStep1Change}
              error={step1Errors.firstName}
              placeholder="Jane"
              autoComplete="given-name"
            />
            <AuthInput
              label="Last name"
              type="text"
              name="lastName"
              value={step1.lastName}
              onChange={handleStep1Change}
              error={step1Errors.lastName}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>

          <AuthInput
            label="Username"
            type="text"
            name="username"
            value={step1.username}
            onChange={handleStep1Change}
            error={step1Errors.username}
            placeholder="jane_dev"
            autoComplete="username"
          />

          {/* Role selector */}
          <div>
            <p className="text-sm font-medium text-text-primary mb-2">I want to</p>
            <div className="grid grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const active = step1.type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleRoleSelect(opt.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 px-2 py-4 rounded-2xl cursor-pointer",
                      "outline-none transition-all duration-200",
                      "focus-visible:ring-2 focus-visible:ring-primary/40",
                      active
                        ? [
                            "bg-gradient-to-b from-[#149A9B] to-[#0d7a7b] text-white",
                            "shadow-[4px_4px_10px_#b8c0cc,-2px_-2px_6px_#ffffff]",
                          ]
                        : [
                            "bg-[#F3F4F6] text-text-secondary",
                            "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                            "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:-translate-y-0.5",
                            "active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] active:translate-y-0",
                          ],
                    )}
                  >
                    {/* Active check */}
                    {active && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
                        <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5 text-white">
                          <path fillRule="evenodd" d="M10.22 2.97a.75.75 0 011.06 1.06l-6 6a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06L4.75 8.44l5.47-5.47z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}

                    {/* Icon */}
                    <span className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                      active
                        ? "bg-white/15"
                        : "bg-[#F3F4F6] shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                    )}>
                      {opt.icon}
                    </span>

                    <span className={cn("text-xs font-semibold leading-tight text-center", active ? "text-white" : "text-text-primary")}>
                      {opt.label}
                    </span>
                    <span className={cn("text-[10px] leading-tight text-center", active ? "text-white/70" : "text-text-secondary")}>
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            {step1Errors.type && <p className="mt-1.5 text-xs text-error">{step1Errors.type}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthInput
              label="Country (optional)"
              type="text"
              name="country"
              value={step1.country}
              onChange={handleStep1Change}
              error={step1Errors.country}
              placeholder="Costa Rica"
              autoComplete="country-name"
            />
            <div>
              <label className="text-sm font-medium text-text-primary mb-2 block" htmlFor="onboarding-phone">
                Phone <span className="text-text-secondary font-normal">(optional)</span>
              </label>
              <input
                id="onboarding-phone"
                type="tel"
                name="phone"
                value={step1.phone}
                onChange={handleStep1Change}
                placeholder="+506 8888 8888"
                autoComplete="tel"
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm",
                  "bg-[#F3F4F6] text-text-primary placeholder-text-secondary/50",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30",
                  "transition-all duration-200",
                  step1Errors.phone && "ring-2 ring-error/30",
                )}
              />
              {step1Errors.phone && <p className="mt-1.5 text-xs text-error">{step1Errors.phone}</p>}
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full px-6 py-3 rounded-xl font-medium mt-2 cursor-pointer",
              "bg-primary text-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
              "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
              "transition-all duration-200",
            )}
          >
            {isSubmitting ? "Saving..." : needsStep2 ? "Continue" : "Get started"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-3">
          <AuthInput
            label="Professional title"
            type="text"
            name="professionalTitle"
            value={step2.professionalTitle}
            onChange={handleStep2Change}
            error={step2Errors.professionalTitle}
            placeholder="Full Stack Developer"
            autoComplete="organization-title"
          />

          <div>
            <label
              className="text-sm font-medium text-text-primary mb-2 block"
              htmlFor="onboarding-bio"
            >
              Bio <span className="text-text-secondary font-normal">(optional)</span>
            </label>
            <textarea
              id="onboarding-bio"
              name="bio"
              rows={4}
              value={step2.bio}
              onChange={handleStep2Change}
              placeholder="Describe your skills and the services you offer…"
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm resize-none",
                "bg-[#F3F4F6] text-text-primary placeholder-text-secondary/50",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                "transition-all duration-200",
                step2Errors.bio && "ring-2 ring-error/30",
              )}
            />
            <div className="flex justify-between mt-1">
              {step2Errors.bio ? (
                <p className="text-xs text-error">{step2Errors.bio}</p>
              ) : (
                <p className="text-xs text-text-secondary">Optional. Max 500 characters.</p>
              )}
              <p className="text-xs text-text-secondary ml-auto">{step2.bio.length}/500</p>
            </div>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-error/10 text-error text-sm">{submitError}</div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-6 py-3 rounded-xl font-medium cursor-pointer",
                "text-text-secondary bg-[#F3F4F6]",
                "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                "hover:text-text-primary active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                "transition-all duration-200",
              )}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-6 py-3 rounded-xl font-medium cursor-pointer",
                "bg-primary text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
                "transition-all duration-200",
              )}
            >
              {isSubmitting ? "Saving..." : "Get started"}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
