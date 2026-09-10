"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isNewUser } from "@/lib/auth/is-new-user";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import type { LoginFormData, AuthFormErrors } from "@/types/auth.types";

export interface UseLoginFormReturn {
  formData: LoginFormData;
  errors: AuthFormErrors;
  isLoading: boolean;
  showSuccessMessage: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleWalletSignedIn: () => void;
}

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const setRedirectAfterLogin = useAuthStore((state) => state.setRedirectAfterLogin);
  const mode = useModeStore((state) => state.mode);

  const registered = searchParams.get("registered") === "true";
  const redirect = searchParams.get("redirect");

  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(registered);
  const [redirectPath] = useState<string | null>(redirect);

  useEffect(() => {
    if (redirect) setRedirectAfterLogin(redirect);
  }, [redirect, setRedirectAfterLogin]);

  useEffect(() => {
    if (!registered) return;
    const id = window.setTimeout(() => setShowSuccessMessage(false), 5000);
    return () => window.clearTimeout(id);
  }, [registered]);

  function validateForm(): boolean {
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
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AuthFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function goToDashboard(): void {
    const defaultDashboard =
      mode === "client" ? "/app/client/dashboard" : "/app/freelancer/dashboard";
    router.push(redirectPath ?? defaultDashboard);
  }

  function goToDashboardOrOnboarding(): void {
    const user = useAuthStore.getState().user;
    if (user && isNewUser(user)) {
      router.push("/onboarding");
      return;
    }
    goToDashboard();
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.code === "LOGIN_VIA_OAUTH_REQUIRED") {
          const providers = (data.error.details?.providers as string[]) ?? [];
          const providerNames = providers
            .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
            .join(" or ");
          setErrors({
            email: `This account uses ${providerNames} for login. Please use the ${providerNames} button above.`,
          });
        } else {
          setErrors({ email: data.error?.message ?? data.error ?? "Login failed" });
        }
        setIsLoading(false);
        return;
      }

      login(data.user, data.token);
      setIsLoading(false);
      goToDashboardOrOnboarding();
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ email: "Connection error. Please try again." });
      setIsLoading(false);
    }
  }

  function handleWalletSignedIn(): void {
    goToDashboardOrOnboarding();
  }

  return {
    formData,
    errors,
    isLoading,
    showSuccessMessage,
    handleChange,
    handleSubmit,
    handleWalletSignedIn,
  };
}
