"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AuthLayout,
  SocialAuthButtons,
  AuthInput,
  AuthDivider,
  PasswordRequirements,
} from "@/components/auth";
import { cn } from "@/lib/cn";
import type { RegisterFormData, AuthFormErrors } from "@/types/auth.types";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AuthFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Mock registration - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);

    // Redirect to login after success animation
    setTimeout(() => {
      router.push("/login?registered=true");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-8">
          {/* Success Animation */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
              <svg
                className="w-10 h-10 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  className="animate-draw-check"
                />
              </svg>
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
          </div>

          <h2 className="text-xl font-bold text-text-primary mt-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            Account Created!
          </h2>
          <p className="text-sm text-text-secondary mt-2 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            Redirecting you to sign in...
          </p>

          {/* Loading dots */}
          <div className="flex gap-1 mt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <div className="text-center mb-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Create an account
        </h1>
        <p className="text-sm text-text-secondary">
          Join OfferHub and start your journey
        </p>
      </div>

      {/* Social Auth */}
      <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
        <SocialAuthButtons />
      </div>

      {/* Divider */}
      <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
        <AuthDivider />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
          />
        </div>

        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}>
          <AuthInput
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            error={errors.username}
            autoComplete="username"
          />
        </div>

        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder="Create a password"
            error={errors.password}
            autoComplete="new-password"
          />
          <PasswordRequirements
            password={formData.password}
            show={passwordFocused || formData.password.length > 0}
          />
        </div>

        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
          <AuthInput
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        {/* Submit Button */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full px-6 py-3 rounded-xl font-medium mt-4 cursor-pointer",
              "bg-primary text-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
              "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] hover:scale-[1.02]",
              "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] active:scale-[0.98]",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
              "transition-all duration-200"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </div>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-text-secondary mt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.45s", animationFillMode: "forwards" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:text-primary-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
