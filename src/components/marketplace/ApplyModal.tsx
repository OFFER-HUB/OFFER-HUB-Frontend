"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { FormField } from "@/components/ui/FormField";
import { SealedBadge, PoweredBySubRosa } from "@/features/sub-rosa/live/components/SubRosaBadges";

/** Fields a sealed proposal collects, before it is encrypted in the parent. */
export interface SealedApplyValues {
  coverLetter: string;
  timelineDays: number;
  proposedRate?: string;
}

export interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coverLetter: string, proposedRate?: string) => Promise<void>;
  offerTitle: string;
  offerBudget: string;
  /**
   * When true, the offer has a live sealed round: the modal collects a
   * timeline, seals the proposal via `onSealedSubmit`, and shows the Sub Rosa
   * branding. The plaintext never leaves the parent in the clear.
   */
  sealed?: boolean;
  /** Handles a sealed submission (encrypt + commit + record). Required when `sealed`. */
  onSealedSubmit?: (values: SealedApplyValues) => Promise<void>;
  /** Whether a Stellar wallet is connected (a sealed submit needs one signature). */
  sealedWalletConnected?: boolean;
  /** Progress label shown on the submit button while a sealed submit runs. */
  sealedBusyLabel?: string | null;
}

export function ApplyModal({
  isOpen,
  onClose,
  onSubmit,
  offerTitle,
  offerBudget,
  sealed = false,
  onSealedSubmit,
  sealedWalletConnected = true,
  sealedBusyLabel,
}: ApplyModalProps): React.JSX.Element | null {
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [timelineDays, setTimelineDays] = useState('');
  const [errors, setErrors] = useState<{ coverLetter?: string; proposedRate?: string; timelineDays?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (coverLetter.length < 50) {
      newErrors.coverLetter = 'Cover letter must be at least 50 characters';
    }

    if (proposedRate && !/^\d+(\.\d{1,2})?$/.test(proposedRate)) {
      newErrors.proposedRate = 'Invalid rate format';
    }

    if (sealed) {
      const days = Number(timelineDays);
      if (!timelineDays.trim()) {
        newErrors.timelineDays = 'Timeline is required';
      } else if (!Number.isInteger(days) || days <= 0) {
        newErrors.timelineDays = 'Enter a whole number of days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function resetForm() {
    setCoverLetter('');
    setProposedRate('');
    setTimelineDays('');
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    if (sealed && !sealedWalletConnected) return;

    setIsSubmitting(true);
    try {
      if (sealed && onSealedSubmit) {
        await onSealedSubmit({
          coverLetter,
          timelineDays: Number(timelineDays),
          proposedRate: proposedRate || undefined,
        });
      } else {
        await onSubmit(coverLetter, proposedRate || undefined);
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div
        className={cn(
          "relative w-full max-w-2xl animate-scale-in p-6 max-h-[90vh] overflow-y-auto",
          "rounded-3xl bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold text-text-primary">
                {sealed ? 'Apply Privately' : 'Apply to Offer'}
              </h2>
              {sealed && <SealedBadge />}
            </div>
            <p className="text-sm text-text-secondary mt-1">{offerTitle}</p>
            <p className="text-xs text-text-secondary mt-1">Budget: ${offerBudget}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            aria-label="Close"
          >
            <Icon path={ICON_PATHS.close} size="md" />
          </button>
        </div>

        {/* Sealed round notice */}
        {sealed && (
          <div className="mb-5 p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Icon path={ICON_PATHS.lock} size="sm" />
              <span>Your proposal is encrypted until the reveal window</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              This offer collects sealed proposals. Your details are time-lock encrypted in your
              browser and committed on-chain — no one, including the client, can read them until
              proposals close and reveal together. Submitting needs one wallet signature.
            </p>
            <PoweredBySubRosa />
          </div>
        )}

        {/* Wallet warning for sealed submissions */}
        {sealed && !sealedWalletConnected && (
          <div className="mb-5 flex items-start gap-2 p-3 rounded-2xl bg-warning/10 border border-warning/30 text-warning text-xs font-medium">
            <Icon path={ICON_PATHS.alertTriangle} size="sm" className="shrink-0 mt-0.5" />
            <span>Connect your Stellar wallet to seal and submit this proposal.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Cover Letter"
            error={errors.coverLetter}
            hint="Explain why you're the best fit for this project (minimum 50 characters)"
          >
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className={cn(
                "w-full px-4 py-3 rounded-xl resize-none bg-background",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "text-text-primary placeholder-text-secondary/50 focus:outline-none",
                errors.coverLetter && "border-2 border-error"
              )}
              placeholder="I'm interested in this project because..."
            />
            <p className="text-xs text-text-secondary mt-1">
              {coverLetter.length}/50 characters
            </p>
          </FormField>

          {sealed && (
            <FormField
              label="Delivery Timeline"
              error={errors.timelineDays}
              hint="How many days you need to deliver"
            >
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={timelineDays}
                  onChange={(e) => setTimelineDays(e.target.value)}
                  className={cn(
                    "w-full pl-4 pr-16 py-3 rounded-xl bg-background",
                    "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                    "text-text-primary placeholder-text-secondary/50 focus:outline-none",
                    errors.timelineDays && "border-2 border-error"
                  )}
                  placeholder="14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">days</span>
              </div>
            </FormField>
          )}

          <FormField
            label="Proposed Rate (Optional)"
            error={errors.proposedRate}
            hint={
              sealed
                ? "Sealed with your proposal — hidden until reveal"
                : "Your proposed hourly or project rate (USD)"
            }
            optional
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
              <input
                type="text"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                className={cn(
                  "w-full pl-8 pr-4 py-3 rounded-xl bg-background",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary/50 focus:outline-none",
                  errors.proposedRate && "border-2 border-error"
                )}
                placeholder="500.00"
              />
            </div>
          </FormField>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium",
                "text-text-secondary hover:text-text-primary",
                "bg-background hover:bg-gray-100 transition-colors"
              )}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (sealed && !sealedWalletConnected)}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium text-white",
                "bg-primary hover:bg-primary-hover transition-colors",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>{sealed ? sealedBusyLabel || 'Sealing...' : 'Submitting...'}</span>
                </span>
              ) : sealed ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon path={ICON_PATHS.lock} size="sm" />
                  <span>Seal &amp; Submit</span>
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
