"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout, AuthInput, PasswordRequirements } from "@/components/auth";
import { cn } from "@/lib/cn";
import { resetPassword, validateResetToken } from "@/lib/api/password-reset";
import { getPasswordStrength, isPasswordValid } from "@/lib/validation";

type PageState = "loading" | "invalid" | "valid" | "success";

const STRENGTH_STYLES = {
  weak: {
    label: "Weak",
    width: "w-1/3",
    bar: "bg-error",
    text: "text-error",
  },
  medium: {
    label: "Medium",
    width: "w-2/3",
    bar: "bg-warning",
    text: "text-warning",
  },
  strong: {
    label: "Strong",
    width: "w-full",
    bar: "bg-success",
    text: "text-success",
  },
} as const;

function ResetPasswordContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    let isMounted = true;

    async function validate(): Promise<void> {
      if (!token) {
        if (isMounted) setPageState("invalid");
        return;
      }

      try {
        const result = await validateResetToken(token);
        if (!isMounted) return;

        setEmail(result.email);
        setPageState(result.valid ? "valid" : "invalid");
      } catch {
        if (isMounted) setPageState("invalid");
      }
    }

    void validate();

    return () => {
      isMounted = false;
    };
  }, [token]);

  function validateForm(): boolean {
    const nextErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      nextErrors.password = "New password is required";
    } else if (!isPasswordValid(password)) {
      nextErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, and a number";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await resetPassword(token, password);
      setPageState("success");
      window.setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error ? error.message : "Unable to reset password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pageState === "loading") {
    return (
      <AuthLayout>
        <div className="py-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <h1 className="mt-6 text-xl font-bold text-text-primary">Validating reset link</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Please wait while we verify your password reset token.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (pageState === "invalid") {
    return (
      <AuthLayout>
        <div className="py-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <span className="text-2xl text-error">!</span>
          </div>
          <h1 className="mt-6 text-xl font-bold text-text-primary">Reset link expired</h1>
          <p className="mt-2 text-sm text-text-secondary">
            This password reset token is invalid or has already expired.
          </p>
          <Link
            href="/forgot-password"
            className={cn(
              "mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium",
              "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
            )}
          >
            Request a new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (pageState === "success") {
    return (
      <AuthLayout>
        <div className="py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-xl font-bold text-text-primary">Password updated!</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your password was changed successfully. Redirecting you to sign in.
          </p>
          <Link
            href="/login"
            className={cn(
              "mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium",
              "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
            )}
          >
            Go to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-5 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Set a new password</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {email ? `Resetting password for ${email}` : "Choose a new password for your account."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <AuthInput
            label="New password"
            type="password"
            name="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
            }}
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordRequirements password={password} show={password.length > 0} />

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">Strength</span>
              <span className={cn("font-medium", STRENGTH_STYLES[passwordStrength].text)}>
                {STRENGTH_STYLES[passwordStrength].label}
              </span>
            </div>
            <div className="h-2 rounded-full bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  STRENGTH_STYLES[passwordStrength].bar,
                  STRENGTH_STYLES[passwordStrength].width
                )}
              />
            </div>
          </div>
        </div>

        <AuthInput
          label="Confirm password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrors((prev) => ({ ...prev, confirmPassword: undefined, general: undefined }));
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {errors.general ? (
          <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{errors.general}</div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "mt-2 w-full rounded-xl px-6 py-3 font-medium",
            "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "disabled:cursor-not-allowed disabled:opacity-70"
          )}
        >
          {isSubmitting ? "Updating password..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="py-8 text-center">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <h1 className="mt-6 text-xl font-bold text-text-primary">Loading reset page</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Preparing your password reset form.
            </p>
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
