"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { FormField } from "@/components/ui/FormField";
import { NEUMORPHIC_INSET } from "@/lib/styles";

export interface ReviewResponseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  reviewId: string;
  isSubmitting?: boolean;
}

export function ReviewResponseForm({
  isOpen,
  onClose,
  onSubmit,
  reviewId,
  isSubmitting = false,
}: ReviewResponseFormProps): React.JSX.Element | null {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function validate(): boolean {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      setError('Response is required');
      return false;
    }
    
    if (trimmedContent.length < 10) {
      setError('Response must be at least 10 characters');
      return false;
    }
    
    if (trimmedContent.length > 500) {
      setError('Response must be less than 500 characters');
      return false;
    }

    setError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(content.trim());
      setContent('');
      setError(null);
      onClose();
    } catch (error) {
      console.error('Failed to submit response:', error);
      setError('Failed to submit response. Please try again.');
    }
  }

  function handleClose() {
    setContent('');
    setError(null);
    onClose();
  }

  return (
    <div className={cn("mt-4 rounded-2xl p-4", NEUMORPHIC_INSET)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon path={ICON_PATHS.chat} size="sm" />
            </div>
            <h4 className="font-semibold text-text-primary">Write a Response</h4>
          </div>
          {isOpen && (
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
              aria-label="Cancel"
            >
              <Icon path={ICON_PATHS.close} size="sm" />
            </button>
          )}
        </div>

        {/* Form */}
        {isOpen && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormField error={error} hint="Respond professionally to the client's feedback">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                disabled={isSubmitting}
                className={cn(
                  "w-full px-3 py-2 rounded-lg resize-none bg-background text-sm",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                  "text-text-primary placeholder-text-secondary/50 focus:outline-none",
                  error && "border-2 border-error"
                )}
                placeholder="Thank you for your feedback. I appreciate..."
              />
              <p className="text-xs text-text-secondary mt-1">
                {content.length}/500 characters
              </p>
            </FormField>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium",
                  "text-text-secondary hover:text-text-primary",
                  "bg-background hover:bg-gray-100 transition-colors",
                  "disabled:opacity-70 disabled:cursor-not-allowed"
                )}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium text-white",
                  "bg-primary hover:bg-primary-hover transition-colors",
                  "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                  "disabled:opacity-70 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  'Submit Response'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Closed state trigger */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => onClose()}
            className="w-full text-left text-sm text-primary hover:text-primary-hover font-medium transition-colors"
          >
            + Write a response
          </button>
        )}
      </div>
    </div>
  );
}
