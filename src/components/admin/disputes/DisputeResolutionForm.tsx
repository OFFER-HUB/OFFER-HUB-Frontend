"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INPUT, NEUMORPHIC_INSET } from "@/lib/styles";
import { amountsSumTo, suggestRefundSplit } from "@/lib/disputes/refund-suggestion";
import {
  RESOLUTION_DECISION_CONFIG,
  type AdminDispute,
  type ResolutionDecision,
  type ResolveDisputePayload,
} from "@/types/admin.types";

export interface DisputeResolutionFormProps {
  dispute: AdminDispute;
  onSubmit: (payload: ResolveDisputePayload) => Promise<void>;
  onCancel: () => void;
}

const DECISIONS: ResolutionDecision[] = ["FULL_RELEASE", "FULL_REFUND", "SPLIT"];
const AMOUNT_PATTERN = /^\d+\.\d{2}$/;

/**
 * Builds the `ResolveDisputeDto`. SPLIT amounts start from the proportional
 * suggestion (completed milestones → seller, the rest → buyer) and the admin
 * can override them; the backend rejects a split that doesn't sum to the
 * order amount, so that is validated here too.
 */
export function DisputeResolutionForm({ dispute, onSubmit, onCancel }: DisputeResolutionFormProps) {
  const { order } = dispute;
  const suggestion = suggestRefundSplit(order);
  const [decision, setDecision] = useState<ResolutionDecision>("SPLIT");
  const [releaseAmount, setReleaseAmount] = useState(suggestion.releaseAmount);
  const [refundAmount, setRefundAmount] = useState(suggestion.refundAmount);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitValid =
    AMOUNT_PATTERN.test(releaseAmount) &&
    AMOUNT_PATTERN.test(refundAmount) &&
    amountsSumTo(releaseAmount, refundAmount, order.amount);
  const canSubmit = note.trim().length > 0 && (decision !== "SPLIT" || splitValid);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) {
      setError("A decision note is required — it is stored on the dispute for both parties.");
      return;
    }
    if (decision === "SPLIT" && !splitValid) {
      setError(`Release and refund must be two-decimal amounts that add up to $${order.amount}.`);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        decision,
        note: note.trim(),
        ...(decision === "SPLIT" ? { releaseAmount, refundAmount } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve the dispute.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-text-primary mb-2">Decision</legend>
        {DECISIONS.map((d) => {
          const cfg = RESOLUTION_DECISION_CONFIG[d];
          const selected = decision === d;
          return (
            <label
              key={d}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all",
                selected ? "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]" : NEUMORPHIC_INSET
              )}
            >
              <input
                type="radio"
                name="decision"
                value={d}
                checked={selected}
                onChange={() => setDecision(d)}
                className="mt-1 accent-primary"
              />
              <span className="min-w-0">
                <span className={cn("block text-sm font-semibold", selected ? cfg.color : "text-text-primary")}>{cfg.label}</span>
                <span className="block text-xs text-text-secondary">{cfg.description}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      {decision === "SPLIT" && (
        <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl space-y-3")}>
          <p className="text-xs text-text-secondary">
            Suggested from the order&apos;s milestones: {suggestion.completedMilestones} of {suggestion.totalMilestones} completed →
            seller ${suggestion.releaseAmount}, buyer ${suggestion.refundAmount}. Adjust if the evidence warrants it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="release-amount" className="block text-xs font-semibold text-text-primary mb-1">
                Release to seller ({order.currency})
              </label>
              <input
                id="release-amount"
                inputMode="decimal"
                value={releaseAmount}
                onChange={(e) => setReleaseAmount(e.target.value)}
                className={NEUMORPHIC_INPUT}
              />
            </div>
            <div>
              <label htmlFor="refund-amount" className="block text-xs font-semibold text-text-primary mb-1">
                Refund to buyer ({order.currency})
              </label>
              <input
                id="refund-amount"
                inputMode="decimal"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className={NEUMORPHIC_INPUT}
              />
            </div>
          </div>
          <p className={cn("text-xs", splitValid ? "text-success" : "text-error")}>
            {splitValid ? `Adds up to $${order.amount}.` : `Must add up to the order amount, $${order.amount}.`}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="decision-note" className="block text-sm font-semibold text-text-primary mb-2">
          Decision note <span className="text-error">*</span>
        </label>
        <textarea
          id="decision-note"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why this decision — both parties will see it on the dispute."
          className={cn(NEUMORPHIC_INPUT, "resize-none")}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 text-error text-sm">
          <Icon path={ICON_PATHS.alertCircle} size="sm" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 rounded-xl font-medium text-text-secondary hover:text-text-primary bg-background hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-primary disabled:opacity-60 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              Resolving...
            </>
          ) : (
            "Resolve Dispute"
          )}
        </button>
      </div>
    </form>
  );
}
