"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isNewUser } from "@/lib/auth/is-new-user";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import type { RegisterFormData, AuthFormErrors } from "@/types/auth.types";

export interface UseRegisterFormReturn {
  formData: RegisterFormData;
  errors: AuthFormErrors;
  isLoading: boolean;
  isSuccess: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleWalletSignedIn: () => void;
}

export function useRegisterForm(): UseRegisterFormReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const mode = useModeStore((state) => state.mode);

  const emailParam = searchParams.get("email") ?? "";
  const [formData, setFormData] = useState<RegisterFormData>({
    email: emailParam,
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function validateForm(): boolean {
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
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AuthFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function mapRegistrationErrors(data: {
    error?: { code?: string; message?: string; details?: { providers?: string[]; validationErrors?: string[] } };
  }): AuthFormErrors {
    const newErrors: AuthFormErrors = {};

    if (data.error?.code) {
      if (data.error.code === "EMAIL_REGISTERED_VIA_OAUTH") {
        const providers = data.error.details?.providers ?? [];
        const providerNames = providers
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" or ");
        newErrors.email = `This email is registered via ${providerNames}. Please use the ${providerNames} button above to sign in.`;
      } else if (data.error.code === "EMAIL_ALREADY_EXISTS") {
        newErrors.email = data.error.message ?? "This email is already registered";
      } else if (data.error.code === "USERNAME_TAKEN") {
        newErrors.username = data.error.message ?? "This username is already taken";
      } else if (data.error.code === "VALIDATION_ERROR" && data.error.details?.validationErrors) {
        for (const msg of data.error.details.validationErrors) {
          const lower = msg.toLowerCase();
          if (lower.includes("email")) newErrors.email = msg;
          else if (lower.includes("username")) newErrors.username = msg;
          else if (lower.includes("password")) newErrors.password = msg;
          else newErrors.email = msg;
        }
      } else {
        newErrors.email = data.error.message ?? "Registration failed";
      }
    } else {
      newErrors.email = (data.error as unknown as string) ?? "Registration failed";
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          type: "BOTH",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(mapRegistrationErrors(data));
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Auto-login after successful registration to hydrate store with wallet data
      try {
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          login(loginData.user, loginData.token);
          // Allow Zustand persist to write cookie before navigation
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          console.error("Auto-login failed:", await loginResponse.text());
        }
      } catch (loginError) {
        console.error("Auto-login error:", loginError);
      }

      setIsLoading(false);

      const registeredUser = useAuthStore.getState().user;
      const destination =
        registeredUser && isNewUser(registeredUser)
          ? "/onboarding"
          : mode === "client"
            ? "/app/client/dashboard"
            : "/app/freelancer/dashboard";

      localStorage.setItem("show-onboarding-tour", "true");
      setTimeout(() => {
        window.location.href = destination;
      }, 1500);
    } catch (error) {
      console.error("Register error:", error);
      setErrors({ email: "Connection error. Please try again." });
      setIsLoading(false);
    }
  }

  function handleWalletSignedIn(): void {
    const user = useAuthStore.getState().user;
    if (user && isNewUser(user)) {
      router.push("/onboarding");
      return;
    }
    const defaultDashboard =
      mode === "client" ? "/app/client/dashboard" : "/app/freelancer/dashboard";
    router.push(defaultDashboard);
  }

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    handleChange,
    handleSubmit,
    handleWalletSignedIn,
  };
}
