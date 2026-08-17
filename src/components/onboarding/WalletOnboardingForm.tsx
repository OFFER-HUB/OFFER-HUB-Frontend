"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { cn } from "@/lib/cn";
import { updateProfile } from "@/lib/api/profile";
import { useAuthStore, type User } from "@/stores/auth-store";
import { onboardingSchema, type OnboardingAccountType } from "@/types/onboarding.types";

const ACCOUNT_TYPE_OPTIONS: ReadonlyArray<{
  id: OnboardingAccountType;
  label: string;
  hint: string;
}> = [
  { id: "BUYER", label: "Buyer", hint: "Hire talent" },
  { id: "SELLER", label: "Seller", hint: "Offer services" },
  { id: "BOTH", label: "Both", hint: "Do both" },
];

interface OnboardingFields {
  firstName: string;
  lastName: string;
  username: string;
  type: OnboardingAccountType | "";
  bio: string;
  country: string;
}

type OnboardingFieldErrors = Partial<Record<keyof OnboardingFields, string>>;

const INITIAL_FORM: OnboardingFields = {
  firstName: "",
  lastName: "",
  username: "",
  type: "",
  bio: "",
  country: "",
};

function toUserType(value: string): User["type"] {
  if (value === "BUYER" || value === "SELLER" || value === "BOTH" || value === "ADMIN") {
    return value;
  }
  return undefined;
}

export function WalletOnboardingForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState<OnboardingFields>({
    ...INITIAL_FORM,
    username: user?.username ?? "",
  });
  const [errors, setErrors] = useState<OnboardingFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    const field = name as keyof OnboardingFields;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleTypeSelect(type: OnboardingAccountType) {
    setFormData((prev) => ({ ...prev, type }));
    if (errors.type) {
      setErrors((prev) => ({ ...prev, type: undefined }));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const parsed = onboardingSchema.safeParse(formData);
    if (!parsed.success) {
      const nextErrors: OnboardingFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && nextErrors[field as keyof OnboardingFields] == null) {
          nextErrors[field as keyof OnboardingFields] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    if (!token) {
      setSubmitError("Authentication token not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = await updateProfile(token, {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        username: parsed.data.username,
        type: parsed.data.type,
        bio: parsed.data.bio || undefined,
        location: parsed.data.country || undefined,
      });

      if (user) {
        login(
          {
            ...user,
            firstName: profile.firstName,
            lastName: profile.lastName,
            username: profile.username ?? parsed.data.username,
            type: toUserType(profile.type) ?? parsed.data.type,
          },
          token
        );
      }

      router.push("/app");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div
        className="text-center mb-4 opacity-0 animate-fade-in-up"
        style={{ animationFillMode: "forwards" }}
      >
        <h1 className="text-2xl font-bold text-text-primary mb-1">Complete your profile</h1>
        <p className="text-sm text-text-secondary">
          Tell us a bit about yourself to start using the marketplace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            label="First name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleTextChange}
            error={errors.firstName}
            placeholder="Jane"
            autoComplete="given-name"
          />
          <AuthInput
            label="Last name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleTextChange}
            error={errors.lastName}
            placeholder="Doe"
            autoComplete="family-name"
          />
        </div>

        <AuthInput
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleTextChange}
          error={errors.username}
          placeholder="jane_dev"
          autoComplete="username"
        />

        <div>
          <p className="text-sm font-medium text-text-primary mb-2">I want to</p>
          <div
            className={cn(
              "grid grid-cols-3 gap-2 p-1 rounded-2xl bg-background",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
            )}
          >
            {ACCOUNT_TYPE_OPTIONS.map((option) => {
              const active = formData.type === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleTypeSelect(option.id)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl px-2 py-2.5 cursor-pointer",
                    "transition-all duration-200 outline-none",
                    "focus-visible:ring-2 focus-visible:ring-primary/40",
                    active
                      ? "bg-primary text-white shadow-[2px_2px_6px_#d1d5db]"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <span
                    className={cn("text-[10px]", active ? "text-white/80" : "text-text-secondary")}
                  >
                    {option.hint}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.type && <p className="mt-1.5 text-xs text-error">{errors.type}</p>}
        </div>

        <AuthInput
          label="Country (optional)"
          type="text"
          name="country"
          value={formData.country}
          onChange={handleTextChange}
          error={errors.country}
          placeholder="Costa Rica"
          autoComplete="country-name"
        />

        <div>
          <label
            className="text-sm font-medium text-text-primary mb-2 block"
            htmlFor="onboarding-bio"
          >
            Bio (optional)
          </label>
          <textarea
            id="onboarding-bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleTextChange}
            placeholder="A short introduction for your public profile"
            className={cn(
              "w-full px-4 py-3 rounded-xl text-sm resize-none",
              "bg-background text-text-primary placeholder-text-secondary/50",
              "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              "transition-all duration-200",
              errors.bio && "ring-2 ring-error/30"
            )}
          />
          <div className="flex justify-between mt-1">
            {errors.bio ? (
              <p className="text-xs text-error">{errors.bio}</p>
            ) : (
              <p className="text-xs text-text-secondary">Optional. Max 500 characters.</p>
            )}
            <p className="text-xs text-text-secondary ml-auto">{formData.bio.length}/500</p>
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
            "transition-all duration-200"
          )}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </AuthLayout>
  );
}
