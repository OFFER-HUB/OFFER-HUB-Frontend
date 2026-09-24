"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { FormField } from "@/components/ui/FormField";

export interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coverLetter: string, proposedRate?: string) => Promise<void>;
  offerTitle: string;
  offerBudget: string;
}

export function ApplyModal({
  isOpen,
  onClose,
  onSubmit,
  offerTitle,
  offerBudget,
}: ApplyModalProps): React.JSX.Element | null {
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [errors, setErrors] = useState<{ coverLetter?: string; proposedRate?: string }>({});
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(coverLetter, proposedRate || undefined);
      setCoverLetter('');
      setProposedRate('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setCoverLetter('');
    setProposedRate('');
    setErrors({});
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
            <h2 className="text-2xl font-bold text-text-primary">Apply to Offer</h2>
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

          <FormField
            label="Proposed Rate (Optional)"
            error={errors.proposedRate}
            hint="Your proposed hourly or project rate (USD)"
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
              disabled={isSubmitting}
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
                  <span>Submitting...</span>
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
