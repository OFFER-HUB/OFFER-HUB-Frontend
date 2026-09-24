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

function toCents(decimal: string): number {
  const parsed = parseFloat(decimal);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * The backend rejects anything but an exact "X.YY" string, but nobody types
 * trailing zeros by habit — typing "250" for $250.00 reads as correct to an
 * admin and there is nothing in the UI telling them the format is what's
 * wrong, so it silently fails the same "doesn't add up" check as a genuine
 * math error. Reformatting on blur fixes it before that check ever runs.
 */
function normalizeAmount(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return value;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return value;
  return parsed.toFixed(2);
}

/**
 * Builds the `ResolveDisputeDto`. SPLIT amounts start from the proportional
 * suggestion (completed milestones → seller, the rest → buyer) and the admin
 * can override them with an interactive slider or text inputs; the backend
 * rejects a split that doesn't sum to the order amount, so that is validated here too.
 */
export function DisputeResolutionForm({ dispute, onSubmit, onCancel }: DisputeResolutionFormProps) {
  const { order } = dispute;
  const totalCents = toCents(order.amount);
  const suggestion = suggestRefundSplit(order);
  const [decision, setDecision] = useState<ResolutionDecision>("SPLIT");
  const [releaseAmount, setReleaseAmount] = useState(suggestion.releaseAmount);
  const [refundAmount, setRefundAmount] = useState(suggestion.refundAmount);

  // Slider represents freelancer (seller/release) percentage: 0% = 100% Client, 100% = 100% Freelancer
  const initialPercent =
    totalCents > 0
      ? Math.min(Math.max(Math.round((toCents(suggestion.releaseAmount) / totalCents) * 100), 0), 100)
      : 0;
  const [sliderPercent, setSliderPercent] = useState<number>(initialPercent);

  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitFormatValid = AMOUNT_PATTERN.test(releaseAmount) && AMOUNT_PATTERN.test(refundAmount);
  const splitSumValid = splitFormatValid && amountsSumTo(releaseAmount, refundAmount, order.amount);
  const splitValid = splitFormatValid && splitSumValid;
  const canSubmit = note.trim().length > 0 && (decision !== "SPLIT" || splitValid);

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newPercent = Math.min(Math.max(Number(e.target.value), 0), 100);
    setSliderPercent(newPercent);
    const sellerCents = Math.round((newPercent / 100) * totalCents);
    const buyerCents = totalCents - sellerCents;
    setReleaseAmount(fromCents(sellerCents));
    setRefundAmount(fromCents(buyerCents));
  }

  function handleReleaseChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setReleaseAmount(val);
    const parsed = parseFloat(val);
    if (Number.isFinite(parsed) && totalCents > 0) {
      const cents = Math.round(parsed * 100);
      const pct = Math.min(Math.max(Math.round((cents / totalCents) * 100), 0), 100);
      setSliderPercent(pct);
    }
  }

  function handleRefundChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setRefundAmount(val);
    const parsed = parseFloat(val);
    if (Number.isFinite(parsed) && totalCents > 0) {
      const cents = Math.round(parsed * 100);
      const pct = Math.min(Math.max(Math.round(((totalCents - cents) / totalCents) * 100), 0), 100);
      setSliderPercent(pct);
    }
  }

  function handleReleaseBlur(e: React.FocusEvent<HTMLInputElement>) {
    const normalized = normalizeAmount(e.target.value);
    setReleaseAmount(normalized);
    const parsed = parseFloat(normalized);
    if (Number.isFinite(parsed) && totalCents > 0) {
      const cents = Math.round(parsed * 100);
      const pct = Math.min(Math.max(Math.round((cents / totalCents) * 100), 0), 100);
      setSliderPercent(pct);
    }
  }

  function handleRefundBlur(e: React.FocusEvent<HTMLInputElement>) {
    const normalized = normalizeAmount(e.target.value);
    setRefundAmount(normalized);
    const parsed = parseFloat(normalized);
    if (Number.isFinite(parsed) && totalCents > 0) {
      const cents = Math.round(parsed * 100);
      const pct = Math.min(Math.max(Math.round(((totalCents - cents) / totalCents) * 100), 0), 100);
      setSliderPercent(pct);
    }
  }

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
      const finalRelease = normalizeAmount(releaseAmount);
      const finalRefund = normalizeAmount(refundAmount);
      await onSubmit({
        decision,
        note: note.trim(),
        ...(decision === "SPLIT" ? { releaseAmount: finalRelease, refundAmount: finalRefund } : {}),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve the dispute.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const clientPercent = 100 - sliderPercent;
  const freelancerPercent = sliderPercent;

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
        <div className={cn(NEUMORPHIC_INSET, "p-4 rounded-xl space-y-4")}>
          <p className="text-xs text-text-secondary">
            Suggested from the order&apos;s milestones: {suggestion.completedMilestones} of {suggestion.totalMilestones} completed →
            seller ${suggestion.releaseAmount}, buyer ${suggestion.refundAmount}. Adjust if the evidence warrants it.
          </p>

          {/* Interactive Split Allocation Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>100% Client (Refund)</span>
              <span className="text-text-primary font-bold">Split Allocation</span>
              <span>100% Freelancer (Release)</span>
            </div>

            <div className="relative py-1">
              <input
                id="split-allocation-slider"
                type="range"
                min={0}
                max={100}
                step={1}
                value={sliderPercent}
                onChange={handleSliderChange}
                aria-label="Split allocation between client and freelancer"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={sliderPercent}
                aria-valuetext={`Client: ${clientPercent}%, Freelancer: ${freelancerPercent}%`}
                className="range-neumorphic w-full"
              />
            </div>

            <div className="text-center text-xs text-text-secondary font-medium">
              Client: ${refundAmount} ({clientPercent}%) · Freelancer: ${releaseAmount} ({freelancerPercent}%)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="release-amount" className="block text-xs font-semibold text-text-primary mb-1">
                Release to seller ({order.currency})
              </label>
              <input
                id="release-amount"
                inputMode="decimal"
                value={releaseAmount}
                onChange={handleReleaseChange}
                onBlur={handleReleaseBlur}
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
                onChange={handleRefundChange}
                onBlur={handleRefundBlur}
                className={NEUMORPHIC_INPUT}
              />
            </div>
          </div>
          <p className={cn("text-xs", splitValid ? "text-success" : "text-error")}>
            {splitValid
              ? `Adds up to $${order.amount}.`
              : !splitFormatValid
                ? "Enter both amounts with two decimal places (e.g. 250.00)."
                : `Must add up to the order amount, $${order.amount}.`}
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
