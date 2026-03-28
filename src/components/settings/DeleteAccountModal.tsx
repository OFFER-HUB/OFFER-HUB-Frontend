"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INPUT, INPUT_ERROR_STYLES } from "@/lib/styles";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the confirmed password once all steps pass. */
  onConfirm: (password: string) => Promise<void>;
  /** Error message from the parent (e.g. wrong password, active orders). */
  serverError?: string | null;
}

const WILL_BE_DELETED = [
  "Your profile, bio, and avatar",
  "All offers and applications",
  "All services and portfolio items",
  "Chat history and messages",
  "Reviews and ratings",
];

const WILL_BE_RETAINED = [
  "Order records (anonymised) for legal compliance",
  "Transaction history required for financial reporting",
];

/** Multi-step account deletion modal — Step 1: warnings, Step 2: password + checkbox. */
export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  serverError,
}: DeleteAccountModalProps): React.JSX.Element | null {
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPassword("");
      setUnderstood(false);
      setPasswordError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Focus the password input when step 2 opens
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => passwordRef.current?.focus(), 50);
    }
  }, [step]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      return;
    }
    if (!understood) return;

    setPasswordError("");
    setIsSubmitting(true);
    try {
      await onConfirm(password);
    } catch {
      // parent surfaces the error via serverError prop
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = password.trim().length > 0 && understood && !isSubmitting;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-desc"
        className={cn(
          "relative z-10 w-full max-w-lg",
          "bg-white rounded-2xl",
          "shadow-[20px_20px_60px_rgba(0,0,0,0.12),-10px_-10px_40px_#ffffff]",
          "animate-scale-in"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0">
              <Icon path={ICON_PATHS.trash} size="md" className="text-error" />
            </div>
            <div>
              <h2
                id="delete-account-title"
                className="text-lg font-bold text-text-primary"
              >
                Delete Account
              </h2>
              <p className="text-xs text-text-secondary">
                Step {step} of 2 — {step === 1 ? "Review warnings" : "Confirm deletion"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "p-1.5 rounded-lg text-text-secondary",
              "hover:text-error hover:bg-error/5",
              "transition-colors duration-150"
            )}
          >
            <Icon path={ICON_PATHS.x} size="md" />
          </button>
        </div>

        {/* ── Step 1: Warnings ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {/* Warning banner */}
            <div
              id="delete-account-desc"
              className={cn(
                "flex gap-3 p-4 rounded-xl",
                "bg-error/5 border border-error/20"
              )}
            >
              <Icon
                path={ICON_PATHS.alertCircle}
                size="md"
                className="text-error flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-error font-medium leading-relaxed">
                This action is <strong>permanent and irreversible.</strong> Once deleted, your
                account cannot be recovered. Please read carefully before continuing.
              </p>
            </div>

            {/* What gets deleted */}
            <div>
              <p className="text-sm font-semibold text-text-primary mb-2">
                The following will be permanently deleted:
              </p>
              <ul className="space-y-1.5">
                {WILL_BE_DELETED.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-error flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What is retained */}
            <div className={cn("p-3 rounded-xl bg-background")}>
              <p className="text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                Retained for legal/compliance reasons:
              </p>
              <ul className="space-y-1">
                {WILL_BE_RETAINED.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Icon path={ICON_PATHS.infoCircle} size="sm" className="flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recovery info */}
            <p className="text-xs text-text-secondary">
              <strong>Recovery period:</strong> There is no recovery period — deletion is
              immediate and permanent upon confirmation.
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium",
                  "bg-background text-text-secondary",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "transition-all duration-200"
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium",
                  "bg-error/10 text-error border border-error/20",
                  "hover:bg-error/20 transition-colors duration-150"
                )}
              >
                I understand, continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Password + checkbox ──────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Server-side error (active orders, balance, etc.) */}
            {serverError && (
              <div className="flex gap-3 p-3 rounded-xl bg-error/5 border border-error/20">
                <Icon
                  path={ICON_PATHS.alertCircle}
                  size="sm"
                  className="text-error flex-shrink-0 mt-0.5"
                />
                <p className="text-sm text-error">{serverError}</p>
              </div>
            )}

            {/* Password field */}
            <div>
              <label
                htmlFor="delete-password"
                className="block text-sm font-medium text-text-primary mb-1.5"
              >
                Confirm your password
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="delete-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className={cn(
                    NEUMORPHIC_INPUT,
                    "pr-10",
                    passwordError && INPUT_ERROR_STYLES,
                    isSubmitting && "opacity-60 cursor-not-allowed"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <Icon path={ICON_PATHS.eye} size="sm" />
                </button>
              </div>
              {passwordError && (
                <p role="alert" className="mt-1 text-xs text-error">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center",
                    "transition-colors duration-150",
                    understood
                      ? "bg-error border-error"
                      : "bg-background border-border-light group-hover:border-error/50",
                    "shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
                  )}
                >
                  {understood && (
                    <Icon path={ICON_PATHS.check} size="sm" className="text-white" />
                  )}
                </div>
              </div>
              <span className="text-sm text-text-secondary leading-relaxed">
                I understand that deleting my account is{" "}
                <strong className="text-text-primary">permanent and cannot be undone</strong>.
                All my data will be lost.
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium",
                  "bg-background text-text-secondary",
                  "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                  "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "transition-all duration-200 disabled:opacity-50"
                )}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold",
                  "transition-all duration-200",
                  canSubmit
                    ? "bg-error text-white shadow-[4px_4px_8px_#fca5a5,-2px_-2px_6px_#ffffff] hover:bg-error/90"
                    : "bg-error/20 text-error/50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Icon path={ICON_PATHS.trash} size="sm" />
                    Delete My Account
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
