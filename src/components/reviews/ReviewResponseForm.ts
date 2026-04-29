"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/Icon";

interface ReviewResponseFormProps {
  reviewId: string;
  onSuccess: (responseText: string) => void;
}

export function ReviewResponseForm({
  reviewId,
  onSuccess,
}: ReviewResponseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = responseText.trim().length >= 5;

  async function handleSubmit() {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseText }),
      });
      if (!res.ok) throw new Error("Failed to submit response.");
      onSuccess(responseText);
      setIsOpen(false);
      setResponseText("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-3 rounded-xl border border-primary/40 px-4 py-1.5
                   text-sm font-medium text-primary
                   hover:bg-primary/10 transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Reply
      </button>
    );
  }

  return (
    <div
      className="mt-4 rounded-xl border border-border bg-secondary/60 p-4
                 shadow-[inset_4px_4px_8px_#0a0f1a,inset_-4px_-4px_8px_#1e2a4a]"
    >
      <p className="mb-3 text-sm font-medium text-text-secondary">
        Your Response
      </p>

      <textarea
        rows={3}
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Write your response to this review…"
        className="w-full rounded-lg bg-[#DEEFE7]/10 border border-border p-3
                   text-sm text-background placeholder:text-text-secondary
                   focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        aria-label="Response to review"
      />

      {error && (
        <div role="alert" className="mt-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => {
            setIsOpen(false);
            setResponseText("");
            setError(null);
          }}
          disabled={isSubmitting}
          className="rounded-xl px-3 py-1.5 text-sm text-text-secondary
                     hover:text-background transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-1.5
                     text-sm font-semibold text-white
                     hover:bg-[#0d7377] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isSubmitting ? "Submitting…" : "Post Response"}
        </button>
      </div>
    </div>
  );
}
