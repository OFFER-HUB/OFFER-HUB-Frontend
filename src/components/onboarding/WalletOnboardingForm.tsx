"use client";

import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { cn } from "@/lib/cn";
import { useWalletOnboardingForm } from "@/hooks/useWalletOnboardingForm";
import type { OnboardingAccountType } from "@/types/onboarding.types";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const ROLE_OPTIONS: ReadonlyArray<{ id: OnboardingAccountType; label: string }> = [
  { id: "BUYER",  label: "Client"     },
  { id: "SELLER", label: "Freelancer" },
  { id: "BOTH",   label: "Both"       },
];

export function WalletOnboardingForm() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const {
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
    goToStep1,
  } = useWalletOnboardingForm();

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

          {/* Email/OAuth accounts already chose this at registration, so it's
              locked here (change it later from account settings). A
              wallet-first account never chose one, the backend just
              auto-generated it from the public key, so it stays editable
              until they pick a real one. */}
          <AuthInput
            label="Username"
            type="text"
            name="username"
            value={step1.username}
            onChange={handleStep1Change}
            error={step1Errors.username}
            placeholder="jane_dev"
            autoComplete="username"
            readOnly={!isWalletFirstAccount}
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
              onClick={goToStep1}
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
