"use client";

import { useMemo, useState } from "react";
import { changePassword } from "@/lib/api/auth";
import { cn } from "@/lib/cn";
import { getPasswordChecks, getPasswordStrength, isPasswordValid } from "@/lib/validation";
import { clearAuthTokens } from "@/lib/auth-client";
import { NEUMORPHIC_CARD, NEUMORPHIC_INPUT, PRIMARY_BUTTON } from "@/lib/styles";
import { useAuthStore } from "@/stores/auth-store";
import { FormField } from "@/components/ui/FormField";
import { Toast } from "@/components/ui/Toast";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";

const MIN_PASSWORD_LENGTH = 8;

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";

interface FormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutOtherSessions: boolean;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const PASSWORD_VISIBILITY_LABELS: Record<FieldName, string> = {
  currentPassword: "Current password",
  newPassword: "New password",
  confirmPassword: "Confirm password",
};

const STRENGTH_STYLES = {
  weak: {
    label: "Weak",
    bar: "bg-error",
    text: "text-error",
    width: "w-1/3",
  },
  medium: {
    label: "Medium",
    bar: "bg-warning",
    text: "text-warning",
    width: "w-2/3",
  },
  strong: {
    label: "Strong",
    bar: "bg-success",
    text: "text-success",
    width: "w-full",
  },
} as const;

function PasswordInput({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: FieldName;
  value: string;
  onChange: (name: FieldName, value: string) => void;
  error?: string;
}): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} error={error}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={cn(NEUMORPHIC_INPUT, "pr-16")}
          autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          aria-label={`${visible ? "Hide" : "Show"} ${PASSWORD_VISIBILITY_LABELS[name]}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </FormField>
  );
}

export function ChangePasswordForm(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const [form, setForm] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    signOutOtherSessions: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const passwordChecks = useMemo(() => getPasswordChecks(form.newPassword), [form.newPassword]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.newPassword), [form.newPassword]);

  function setField(name: keyof FormState, value: string | boolean): void {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.currentPassword.trim()) {
      nextErrors.currentPassword = "Current password is required";
    }

    if (!form.newPassword) {
      nextErrors.newPassword = "New password is required";
    } else if (!isPasswordValid(form.newPassword)) {
      nextErrors.newPassword =
        "Password must be at least 8 characters and include uppercase, lowercase, and a number";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password";
    } else if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (form.currentPassword && form.currentPassword === form.newPassword) {
      nextErrors.newPassword = "New password must be different from your current password";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSessionExpiry(): Promise<void> {
    await clearAuthTokens();
    await logout();
    window.location.href = "/login?redirect=/app/settings/security";
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (!token) {
      await handleSessionExpiry();
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(token, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        signOutOtherSessions: form.signOutOtherSessions,
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        signOutOtherSessions: false,
      });
      setErrors({});
      setToast({ type: "success", message: "Password updated successfully" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to change password. Please try again.";
      const status =
        error && typeof error === "object" && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined;

      if (status === 401) {
        await handleSessionExpiry();
        return;
      }

      setErrors({ general: message });
      setToast({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSubmitDisabled =
    isSubmitting ||
    !form.currentPassword ||
    !form.newPassword ||
    !form.confirmPassword ||
    !isPasswordValid(form.newPassword) ||
    form.newPassword !== form.confirmPassword;

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-6 text-white shadow-lg shadow-primary/10">
          <h1 className="text-2xl font-bold">Security</h1>
          <p className="mt-1 text-sm text-white/80">
            Update your password and keep your account access secure.
          </p>
        </div>

        <section className={NEUMORPHIC_CARD}>
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon path={ICON_PATHS.lock} size="md" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Change password</h2>
              <p className="text-sm text-text-secondary">
                Use a strong password with uppercase, lowercase, and numbers.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordInput
              label="Current password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={setField}
              error={errors.currentPassword}
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <PasswordInput
                  label="New password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={setField}
                  error={errors.newPassword}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">Password strength</span>
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

              <PasswordInput
                label="Confirm new password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={setField}
                error={errors.confirmPassword}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-2xl p-4",
                  "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                )}
              >
                <p className="mb-3 text-sm font-medium text-text-primary">Requirements</p>
                <div className="space-y-2 text-sm">
                  <p className={cn(passwordChecks.hasMinLength ? "text-success" : "text-text-secondary")}>
                    {passwordChecks.hasMinLength ? "✓" : "○"} {MIN_PASSWORD_LENGTH}+ characters
                  </p>
                  <p className={cn(passwordChecks.hasUppercase ? "text-success" : "text-text-secondary")}>
                    {passwordChecks.hasUppercase ? "✓" : "○"} Uppercase letter
                  </p>
                  <p className={cn(passwordChecks.hasLowercase ? "text-success" : "text-text-secondary")}>
                    {passwordChecks.hasLowercase ? "✓" : "○"} Lowercase letter
                  </p>
                  <p className={cn(passwordChecks.hasNumber ? "text-success" : "text-text-secondary")}>
                    {passwordChecks.hasNumber ? "✓" : "○"} Number
                  </p>
                </div>
              </div>

              <label
                className={cn(
                  "flex cursor-pointer gap-3 rounded-2xl p-4",
                  "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                )}
              >
                <input
                  type="checkbox"
                  checked={form.signOutOtherSessions}
                  onChange={(event) => setField("signOutOtherSessions", event.target.checked)}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">Sign out other sessions</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Recommended after a password update on shared or public devices.
                  </p>
                </div>
              </label>
            </div>

            {errors.general ? (
              <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{errors.general}</div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={cn(PRIMARY_BUTTON, "min-w-[200px] justify-center")}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.lock} size="sm" />
                    <span>Change password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
