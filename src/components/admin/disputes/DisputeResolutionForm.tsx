"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { NEUMORPHIC_INPUT, NEUMORPHIC_INSET } from "@/lib/styles";
import {
  ADMIN_DISPUTE_OUTCOME_CONFIG,
  RESOLUTION_TEMPLATES,
  type AdminDispute,
  type DisputeResolutionOutcome,
} from "@/types/admin.types";

export interface DisputeResolutionFormProps {
  dispute: AdminDispute;
  onSubmit: (outcome: DisputeResolutionOutcome, resolution: string) => Promise<void>;
  onCancel: () => void;
}

export function DisputeResolutionForm({
  dispute,
  onSubmit,
  onCancel,
}: DisputeResolutionFormProps) {
  const [outcome, setOutcome] = useState<DisputeResolutionOutcome>("split");
  const [resolution, setResolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outcomes: DisputeResolutionOutcome[] = ["buyer_wins", "seller_wins", "split", "dismissed"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolution.trim()) {
      setError("Please provide a resolution description.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(outcome, resolution.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve dispute");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dispute summary */}
      <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
        <p className="text-xs text-text-secondary mb-1">Resolving dispute for</p>
        <p className="font-semibold text-text-primary">{dispute.offerTitle}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
          <span>
            Buyer: <span className="text-text-primary">{dispute.buyer.username}</span>
          </span>
          <span>
            Seller: <span className="text-text-primary">{dispute.seller.username}</span>
          </span>
          <span>
            Amount:{" "}
            <span className="font-semibold text-text-primary">
              ${dispute.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      </div>

      {/* Outcome selection */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">Resolution Outcome</p>
        <div className="grid grid-cols-2 gap-2">
          {outcomes.map((o) => {
            const cfg = ADMIN_DISPUTE_OUTCOME_CONFIG[o];
            const isSelected = outcome === o;
            return (
              <button
                key={o}
                type="button"
                onClick={() => setOutcome(o)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  "border-2",
                  isSelected
                    ? cn(
                        "border-primary bg-primary/5 text-primary",
                        "shadow-[inset_2px_2px_4px_rgba(20,154,155,0.1)]"
                      )
                    : "border-transparent bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                )}
              >
                <span
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-all",
                    isSelected ? "border-primary bg-primary" : "border-gray-300"
                  )}
                />
                <span className={isSelected ? "text-primary" : cfg.color}>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick templates */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-2">Quick Templates</p>
        <div className="flex flex-wrap gap-2">
          {RESOLUTION_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setResolution(tpl)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "bg-white shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                "hover:shadow-[1px_1px_2px_#d1d5db,-1px_-1px_2px_#ffffff]",
                "text-text-secondary hover:text-primary transition-all duration-200"
              )}
            >
              Template {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution description */}
      <div>
        <label className="text-sm font-semibold text-text-primary mb-2 block">
          Resolution Description <span className="text-error">*</span>
        </label>
        <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
          <textarea
            value={resolution}
            onChange={(e) => {
              setResolution(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Describe the resolution in detail. Explain the reasoning and any actions taken..."
            rows={5}
            className={cn(
              "w-full p-4 bg-transparent resize-none",
              "text-text-primary placeholder:text-text-secondary/60",
              "outline-none text-sm"
            )}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          {error ? (
            <p className="text-xs text-error flex items-center gap-1">
              <Icon path={ICON_PATHS.alertCircle} size="sm" />
              {error}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-text-secondary">{resolution.length} chars</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-sm",
            "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "text-text-secondary transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !resolution.trim()}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2",
            "bg-primary text-white",
            "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          )}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              Resolving...
            </>
          ) : (
            <>
              <Icon path={ICON_PATHS.check} size="sm" />
              Resolve Dispute
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Status Change Modal content ──────────────────────────────────────────────

export interface StatusChangeFormProps {
  dispute: AdminDispute;
  onSubmit: (newStatus: string) => Promise<void>;
  onCancel: () => void;
}

export function StatusChangeForm({ dispute, onSubmit, onCancel }: StatusChangeFormProps) {
  const [newStatus, setNewStatus] = useState(dispute.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "under_review", label: "Under Review" },
    { value: "closed", label: "Closed" },
  ] as const;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newStatus === dispute.status) {
      onCancel();
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(newStatus);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-text-secondary">
        Change status for dispute <span className="font-medium text-text-primary">#{dispute.id.slice(-6)}</span>
      </p>

      <div>
        <label className="text-sm font-semibold text-text-primary mb-2 block">New Status</label>
        <div className="relative">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
            className={cn(NEUMORPHIC_INPUT, "appearance-none pr-10 cursor-pointer")}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            <Icon path={ICON_PATHS.chevronDown} size="sm" />
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-sm",
            "bg-white shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "text-text-secondary transition-all duration-200"
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || newStatus === dispute.status}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2",
            "bg-primary text-white",
            "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
            "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
            "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          )}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              Updating...
            </>
          ) : (
            "Update Status"
          )}
        </button>
      </div>
    </form>
  );
}
