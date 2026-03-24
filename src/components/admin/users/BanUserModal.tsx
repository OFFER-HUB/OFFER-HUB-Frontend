"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET } from "@/lib/styles";
import type { AdminUser } from "@/types/admin.types";

export interface BanUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  /** Called with userId and reason after validation passes */
  onConfirm: (userId: string, reason: string) => Promise<void>;
}

const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

export function BanUserModal({ isOpen, user, onClose, onConfirm }: BanUserModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !user) return null;

  async function handleConfirm() {
    if (!user) return;

    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      setError(`Reason must be at least ${MIN_REASON_LENGTH} characters.`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(user.id, trimmed);
      onClose();
    } catch {
      setError("Failed to ban user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const charCount = reason.length;
  const isOverLimit = charCount > MAX_REASON_LENGTH;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ban-modal-title"
        className={cn(NEUMORPHIC_CARD, "relative w-full max-w-md animate-scale-in")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-3">
            <Icon path={ICON_PATHS.flag} size="xl" className="text-error" />
          </div>
          <h2 id="ban-modal-title" className="text-lg font-bold text-text-primary">
            Ban User
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            This action will restrict the user&apos;s access to the platform.
          </p>
        </div>

        {/* User info */}
        <div className={cn(NEUMORPHIC_INSET, "flex items-center gap-3 p-3 rounded-xl mb-5")}>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user.username}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
          </div>
        </div>

        {/* Reason textarea */}
        <div className="mb-2">
          <label
            htmlFor="ban-reason"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            Ban reason <span className="text-error">*</span>
          </label>
          <textarea
            id="ban-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Describe why this user is being banned..."
            disabled={isSubmitting}
            className={cn(
              NEUMORPHIC_INSET,
              "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-secondary",
              "outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none",
              "disabled:opacity-50",
              isOverLimit && "ring-2 ring-error/50"
            )}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-text-secondary">
              Minimum {MIN_REASON_LENGTH} characters
            </span>
            <span
              className={cn(
                "text-xs",
                isOverLimit ? "text-error font-semibold" : "text-text-secondary"
              )}
            >
              {charCount}/{MAX_REASON_LENGTH}
            </span>
          </div>
        </div>

        {/* Validation error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-sm mb-4">
            <Icon path={ICON_PATHS.alertCircle} size="sm" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-text-secondary hover:text-text-primary bg-background hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || isOverLimit}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-error disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" className="text-white" />
                Banning...
              </span>
            ) : (
              "Ban User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
