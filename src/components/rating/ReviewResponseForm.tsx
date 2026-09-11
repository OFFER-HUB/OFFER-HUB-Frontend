"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET, PRIMARY_BUTTON } from "@/lib/styles";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const MIN_RESPONSE_LENGTH = 10;
const MAX_RESPONSE_LENGTH = 1000;

interface ReviewResponseFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function ReviewResponseForm({
  onSubmit,
}: ReviewResponseFormProps): React.JSX.Element {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!isOpen) {
    return <></>;
  }

  function handleFormSubmit(event: React.FormEvent): void {
    event.preventDefault();

    const trimmed = content.trim();

    if (trimmed.length < MIN_RESPONSE_LENGTH) {
      setError(`Response must be at least ${MIN_RESPONSE_LENGTH} characters`);
      return;
    }

    if (trimmed.length > MAX_RESPONSE_LENGTH) {
      setError(`Response cannot exceed ${MAX_RESPONSE_LENGTH} characters`);
      return;
    }

    setError("");
    setShowConfirmModal(true);
  }

  async function handleConfirmSubmit(): Promise<void> {
    const trimmed = content.trim();
    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(trimmed);
      setShowConfirmModal(false);
      setIsOpen(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to submit response. Please try again."
      );
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleFormSubmit} className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon path={ICON_PATHS.chat} size="sm" className="text-primary" />
          <p className="text-sm font-semibold text-text-primary">Respond professionally</p>
        </div>

        <div className={cn("rounded-2xl", NEUMORPHIC_INSET)}>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, MAX_RESPONSE_LENGTH))}
            rows={4}
            placeholder="Thank the reviewer, address their feedback, and keep the response constructive."
            className="w-full resize-none bg-transparent p-4 text-sm text-text-primary outline-none placeholder:text-text-secondary/60"
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <p className={cn(content.trim().length >= MIN_RESPONSE_LENGTH ? "text-success" : "text-text-secondary")}>
            Min {MIN_RESPONSE_LENGTH} characters
          </p>
          <p className="text-text-secondary">{content.length}/{MAX_RESPONSE_LENGTH}</p>
        </div>

        {error ? <div className="rounded-xl bg-error/10 p-3 text-sm text-error">{error}</div> : null}

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className={cn(PRIMARY_BUTTON, "justify-center")}>
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Icon path={ICON_PATHS.send} size="sm" />
                <span>Post response</span>
              </>
            )}
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Post Review Response"
        message="Are you sure you want to submit this response? You can only respond once to this review and it will be visible publicly."
        confirmText="Post response"
        cancelText="Cancel"
        variant="info"
        icon={ICON_PATHS.chat}
        isLoading={isSubmitting}
      />
    </>
  );
}
