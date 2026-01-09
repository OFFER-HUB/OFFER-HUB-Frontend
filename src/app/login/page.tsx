"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AuthLayout,
  SocialAuthButtons,
  AuthInput,
  AuthDivider,
} from "@/components/auth";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginFormData, AuthFormErrors } from "@/types/auth.types";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const setRedirectAfterLogin = useAuthStore((state) => state.setRedirectAfterLogin);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    // Capture redirect parameter
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
      setRedirectAfterLogin(redirect);
    }
  }, [searchParams, setRedirectAfterLogin]);

  const validateForm = (): boolean => {
    const newErrors: AuthFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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

    // Mock login - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock user data - in real implementation this would come from API
    const mockUser = {
      id: "1",
      email: formData.email,
      username: formData.email.split("@")[0],
    };

    login(mockUser);
    setIsLoading(false);
    // Use window.location for full page navigation so middleware can read the cookie
    window.location.href = redirectPath || "/app/dashboard";
  };

  return (
    <AuthLayout>
      {/* Success Message */}
      {showSuccessMessage && (
        <div
          className={cn(
            "mb-4 p-3 rounded-xl",
            "bg-success/10 border border-success/20",
            "animate-scale-in"
          )}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-success font-medium">
              Account created successfully! Please sign in.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-4 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary">
          Sign in to your account to continue
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-primary">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:text-primary-hover transition-colors"
            >
              Forgot?
            </Link>
          </div>
          <AuthInput
            label=""
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        {/* Submit Button */}
        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
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
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </form>

      {/* Register Link */}
      <p className="text-center text-sm text-text-secondary mt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:text-primary-hover transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLayout><div className="flex items-center justify-center py-8"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div></AuthLayout>}>
      <LoginContent />
    </Suspense>
  );
}
