"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, PRIMARY_BUTTON, DANGER_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import type { OpenDisputePayload } from "@/lib/api/orders";

export type DisputeReason = OpenDisputePayload["reason"];

const REASON_LABELS: Record<DisputeReason, string> = {
  NOT_DELIVERED: "Work Not Delivered",
  QUALITY_ISSUE: "Quality Issue",
  OTHER: "Other Issue",
};

interface OpenDisputeModalProps {
  isOpen: boolean;
  orderTitle: string;
  onClose: () => void;
  onSubmit: (reason: DisputeReason, description: string) => Promise<void>;
}

export function OpenDisputeModal({
  isOpen,
  orderTitle,
  onClose,
  onSubmit,
}: OpenDisputeModalProps): React.JSX.Element | null {
  const [reason, setReason] = useState<DisputeReason>("QUALITY_ISSUE");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const reset = useCallback((): void => {
    setReason("QUALITY_ISSUE");
    setDescription("");
    setError("");
    setIsSubmitting(false);
    setIsSuccess(false);
    setShowWarning(false);
  }, []);

  const handleClose = useCallback((): void => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!isSuccess) return;

    const timeoutId = window.setTimeout(() => {
      handleClose();
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [handleClose, isSuccess]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    if (!showWarning) {
      setShowWarning(true);
      return;
    }

    if (description.trim().length < 20) {
      setError("Please provide at least 20 characters describing the issue");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit(reason, description.trim());
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to open dispute. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className={cn(NEUMORPHIC_CARD, "relative z-10 w-full max-w-xl animate-scale-in")}>
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          aria-label="Close modal"
        >
          <Icon path={ICON_PATHS.close} size="md" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Icon path={ICON_PATHS.check} size="xl" className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Dispute Opened</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Our support team will review the issue and contact you shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="mb-3 inline-flex rounded-full border border-error/20 bg-error/10 px-3 py-1 text-xs font-semibold text-error">
                Resolution Center
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Open a Dispute</h2>
              <p className="mt-2 text-sm text-text-secondary">
                For order: <span className="font-semibold text-text-primary">{orderTitle}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!showWarning ? (
                <>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-text-primary">
                      Dispute Reason
                    </label>
                    <div className={cn("rounded-2xl overflow-hidden", NEUMORPHIC_INSET)}>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value as DisputeReason)}
                        className="w-full bg-transparent p-4 text-text-primary outline-none appearance-none cursor-pointer"
                      >
                        {Object.entries(REASON_LABELS).map(([val, label]) => (
                          <option key={val} value={val} className="bg-background text-text-primary">
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Detailed Description
                    </label>
                    <div className={cn("rounded-2xl", NEUMORPHIC_INSET)}>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={5}
                        placeholder="Please describe the issue in detail. What happened and why are you opening a dispute?"
                        className="w-full resize-none bg-transparent p-4 text-text-primary outline-none placeholder:text-text-secondary/60"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className={cn("p-5 rounded-2xl border-l-4 border-warning bg-warning/5")}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <Icon path={ICON_PATHS.alertCircle} size="sm" className="text-warning" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary mb-2">
                        Important Warning
                      </h3>
                      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                        Opening a dispute will freeze all funds related to this order. Our
                        arbitration team will review the case which may take up to 72 hours. Are you
                        sure you want to proceed?
                      </p>

                      <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
                        <h4 className="text-sm font-medium text-text-primary mb-1">
                          Your Issue: {REASON_LABELS[reason]}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-2 italic">
                          "{description}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error ? (
                <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{error}</div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={showWarning ? () => setShowWarning(false) : handleClose}
                  className="rounded-xl px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  {showWarning ? "Back to edit" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(showWarning ? DANGER_BUTTON : PRIMARY_BUTTON, "justify-center")}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Processing...</span>
                    </>
                  ) : showWarning ? (
                    <>
                      <Icon path={ICON_PATHS.flag} size="sm" />
                      <span>Confirm & Open Dispute</span>
                    </>
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
