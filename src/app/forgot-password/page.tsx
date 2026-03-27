"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout, AuthInput } from "@/components/auth";
import { cn } from "@/lib/cn";
import { forgotPassword } from "@/lib/api/password-reset";

export default function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email.trim());
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send reset link. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      {isSuccess ? (
        <div className="py-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Check your email</h1>
          <p className="mt-3 text-sm text-text-secondary">
            If an account exists for {email}, a password reset link has been sent.
          </p>
          <Link
            href="/login"
            className={cn(
              "mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium",
              "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
            )}
          >
            Back to login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-bold text-text-primary">Forgot your password?</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              error={error}
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full rounded-xl px-6 py-3 font-medium",
                "bg-primary text-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "disabled:cursor-not-allowed disabled:opacity-70"
              )}
            >
              {isSubmitting ? "Sending link..." : "Send reset link"}
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
