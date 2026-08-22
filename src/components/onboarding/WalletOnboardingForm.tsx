"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { cn } from "@/lib/cn";
import { updateProfile, ProfileApiError } from "@/lib/api/profile";
import { useAuthStore, type User } from "@/stores/auth-store";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  type OnboardingAccountType,
  type OnboardingStep1Values,
  type OnboardingStep2Values,
} from "@/types/onboarding.types";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const ROLE_OPTIONS: ReadonlyArray<{ id: OnboardingAccountType; label: string }> = [
  { id: "BUYER",  label: "Client"     },
  { id: "SELLER", label: "Freelancer" },
  { id: "BOTH",   label: "Both"       },
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
    <div className="flex items-center justify-center gap-2 mb-6 h-10">
      {total < 2 ? null : Array.from({ length: total }, (_, i) => {
        const s = i + 1;
        const done = s < current;
        const active = s === current;
        return (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              active && "bg-primary text-white shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              done && "bg-primary/20 text-primary",
              !active && !done && "bg-[#F3F4F6] text-text-secondary shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
            )}>
              {done ? (
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : s}
            </div>
            {s < total && (
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
  // The account's actual linked wallet (backend truth), not the browser
  // extension's live SWK session (`walletAddress` in the store). That one
  // persists across whatever OfferHub account is logged in, so a brand new
  // account with nothing connected could otherwise show a wallet chip left
  // over from a previous session in the same browser.
  const walletAddress = user?.wallet?.publicKey ?? null;

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

      {walletAddress && (
        <div className="flex justify-center mb-2">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
            "bg-[#F3F4F6] shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
          )}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-mono text-text-secondary">
              {truncateAddress(walletAddress)}
            </span>
          </div>
        </div>
      )}

      <StepIndicator current={step} total={totalSteps} />

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

          {/* Already chosen at registration (typed for email, auto-generated
              for wallet-first). Onboarding collects the rest of the
              profile, not a rename. Change it later from account settings. */}
          <AuthInput
            label="Username"
            type="text"
            name="username"
            value={step1.username}
            onChange={handleStep1Change}
            error={step1Errors.username}
            placeholder="jane_dev"
            autoComplete="username"
            readOnly
          />

          {/* Role selector */}
          <div>
            <p className="text-sm font-medium text-text-primary mb-2">I want to</p>
            <div className={cn(
              "relative flex p-1 rounded-xl bg-[#F3F4F6]",
              "shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]",
            )}>
              <span
                aria-hidden="true"
                className="absolute rounded-lg bg-primary pointer-events-none"
                style={{
                  top: "4px",
                  bottom: "4px",
                  width: "calc((100% - 8px) / 3)",
                  left: `calc(4px + ${ROLE_OPTIONS.findIndex((o) => o.id === step1.type)} * (100% - 8px) / 3)`,
                  transition: "left 220ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              {ROLE_OPTIONS.map((opt) => {
                const active = step1.type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleRoleSelect(opt.id)}
                    className={cn(
                      "relative flex-1 py-2 px-2 rounded-lg text-xs font-semibold z-10",
                      "outline-none transition-colors duration-200 cursor-pointer",
                      "focus-visible:ring-2 focus-visible:ring-primary/40",
                      active ? "text-white" : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {step1Errors.type && <p className="mt-1.5 text-xs text-error">{step1Errors.type}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthInput
              label="Country"
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
                Phone
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

          {!user?.email && (
            <AuthInput
              label="Email (optional)"
              type="email"
              name="email"
              value={step1.email ?? ""}
              onChange={handleStep1Change}
              error={step1Errors.email}
              placeholder="jane@example.com"
              autoComplete="email"
            />
          )}

          {!walletAddress && (
            <div className="flex items-center justify-between gap-3 py-1">
              <p className="text-sm font-medium text-text-primary">
                Connect a wallet{" "}
                <span className="text-xs font-normal text-text-secondary">
                  (Freighter, Lobstr, xBull)
                </span>
              </p>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(true)}
                className={cn(
                  "shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer",
                  "text-emerald-600 bg-[#F3F4F6]",
                  "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
                  "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "transition-all duration-150",
                )}
              >
                Connect wallet
              </button>
            </div>
          )}

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

          <WalletConnectModal
            isOpen={isWalletModalOpen}
            onClose={() => setIsWalletModalOpen(false)}
            onConnected={() => setIsWalletModalOpen(false)}
          />
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
              Bio
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
                <p className="text-xs text-text-secondary">Min 20 characters. Max 500.</p>
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
