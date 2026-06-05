"use client";

import React, { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD } from "@/lib/styles";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  icon?: string;
  isLoading?: boolean;
}

interface VariantConfig {
  colorClass: string;
  bgTint: string;
  buttonBg: string;
  defaultIcon: string;
}

const VARIANT_CONFIG: Record<NonNullable<ConfirmationModalProps["variant"]>, VariantConfig> = {
  danger: {
    colorClass: "text-error",
    bgTint: "bg-error/10",
    buttonBg: "bg-error",
    defaultIcon: ICON_PATHS.trash,
  },
  warning: {
    colorClass: "text-warning",
    bgTint: "bg-warning/10",
    buttonBg: "bg-warning",
    defaultIcon: ICON_PATHS.alertCircle,
  },
  info: {
    colorClass: "text-primary",
    bgTint: "bg-primary/10",
    buttonBg: "bg-primary",
    defaultIcon: ICON_PATHS.infoCircle,
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon,
  isLoading,
}: ConfirmationModalProps): React.JSX.Element | null {
  const id = useId();
  const titleId = `confirmation-title-${id}`;
  const descId = `confirmation-desc-${id}`;
  const cfg = VARIANT_CONFIG[variant];

  const [internalLoading, setInternalLoading] = useState(false);
  const effectiveLoading = isLoading ?? internalLoading;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleConfirm() {
    try {
      if (isLoading === undefined) setInternalLoading(true);
      await onConfirm();
    } finally {
      if (isLoading === undefined) setInternalLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(NEUMORPHIC_CARD, "relative w-full max-w-md animate-scale-in p-6")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
          aria-label="Close"
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4",
              cfg.bgTint,
              cfg.colorClass
            )}
            aria-hidden
          >
            <Icon path={(icon as string) || cfg.defaultIcon} size="xl" />
          </div>

          <h2 id={titleId} className="text-lg font-bold text-text-primary mb-2">
            {title}
          </h2>
          <div id={descId} className="text-sm text-text-secondary mb-6 break-all [overflow-wrap:anywhere] w-full">
            {message}
          </div>

          <div className="w-full flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium",
                "text-text-secondary hover:text-text-primary",
                "bg-background hover:bg-gray-100 transition-colors"
              )}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={effectiveLoading}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium text-white",
                cfg.buttonBg,
                "disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              {effectiveLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Processing...</span>
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
