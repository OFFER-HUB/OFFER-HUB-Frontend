"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EvidenceUploader } from "@/components/disputes/EvidenceUploader";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
} from "@/lib/styles";
import { DISPUTE_REASONS, MOCK_ELIGIBLE_OFFERS } from "@/data/dispute.data";
import type { DisputeReason } from "@/types/dispute.types";
import type { EvidenceUploadItem } from "@/components/disputes/EvidenceItem";

function NewDisputeForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);

  const [selectedOffer, setSelectedOffer] = useState(() => searchParams.get("offerId") || "");
  const [selectedReason, setSelectedReason] = useState<DisputeReason | "">("");
  const [description, setDescription] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceUploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasPendingEvidence = evidenceItems.some(
    (item) => item.status === "uploading" || item.status === "queued"
  );

  useEffect(() => {
    setMode("client");
  }, [setMode]);

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!selectedOffer) {
      newErrors.offer = "Please select an offer";
    }
    if (!selectedReason) {
      newErrors.reason = "Please select a reason";
    }
    if (!description.trim()) {
      newErrors.description = "Please provide a description";
    } else if (description.trim().length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/app/disputes?created=true");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Link href="/app/disputes" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Open a Dispute</h1>
          <p className="text-text-secondary mt-1">
            Submit a dispute for an offer or contract issue
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto rounded-2xl",
          "bg-white p-4 sm:p-6",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Select Offer
            </h2>
            <div className="space-y-3">
              {MOCK_ELIGIBLE_OFFERS.map((offer) => (
                <label
                  key={offer.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl cursor-pointer",
                    "transition-all duration-200",
                    selectedOffer === offer.id
                      ? "bg-primary/10 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                      : "bg-background hover:bg-background/80"
                  )}
                >
                  <input
                    type="radio"
                    name="offer"
                    value={offer.id}
                    checked={selectedOffer === offer.id}
                    onChange={(e) => setSelectedOffer(e.target.value)}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <span className="text-text-primary font-medium">{offer.title}</span>
                </label>
              ))}
            </div>
            {errors.offer && (
              <p className="text-error text-sm mt-2">{errors.offer}</p>
            )}
          </div>

          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Reason for Dispute
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DISPUTE_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={cn(
                    "flex flex-col p-4 rounded-xl cursor-pointer",
                    "transition-all duration-200",
                    selectedReason === reason.value
                      ? "bg-primary/10 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                      : "bg-background hover:bg-background/80"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value as DisputeReason)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-text-primary font-medium">{reason.label}</span>
                  </div>
                  <p className="text-text-secondary text-sm mt-2 ml-7">
                    {reason.description}
                  </p>
                </label>
              ))}
            </div>
            {errors.reason && (
              <p className="text-error text-sm mt-2">{errors.reason}</p>
            )}
          </div>

          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Describe Your Issue
            </h2>
            <div className={cn("rounded-xl", NEUMORPHIC_INSET)}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide a detailed description of your dispute. Include relevant dates, communications, and any attempts made to resolve the issue directly..."
                rows={6}
                className={cn(
                  "w-full p-4 bg-transparent resize-none",
                  "text-text-primary placeholder:text-text-secondary/60",
                  "outline-none"
                )}
              />
            </div>
            <div className="flex justify-between mt-2">
              {errors.description ? (
                <p className="text-error text-sm">{errors.description}</p>
              ) : (
                <p className="text-text-secondary text-sm">
                  Minimum 50 characters required
                </p>
              )}
              <p className="text-text-secondary text-sm">
                {description.length} characters
              </p>
            </div>
          </div>

          <EvidenceUploader token={token} onChange={setEvidenceItems} />

          <div className="flex items-center justify-end gap-4">
            {hasPendingEvidence && (
              <p className="text-sm text-text-secondary">
                Wait for uploads to complete before submitting.
              </p>
            )}
            <Link
              href="/app/disputes"
              className={cn(
                "px-6 py-3 rounded-xl font-medium",
                "text-text-secondary hover:text-text-primary",
                "transition-colors"
              )}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || hasPendingEvidence}
              className={cn(
                "px-8 py-3 rounded-xl font-semibold",
                "bg-primary text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:bg-primary-hover hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200 cursor-pointer"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Dispute"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingFallback(): React.JSX.Element {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-background animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-48 bg-background rounded animate-pulse" />
          <div className="h-5 w-64 bg-background rounded animate-pulse" />
        </div>
      </div>
      <div className={cn(NEUMORPHIC_CARD, "h-48 animate-pulse")} />
      <div className={cn(NEUMORPHIC_CARD, "h-64 animate-pulse")} />
    </div>
  );
}

export default function NewDisputePage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewDisputeForm />
    </Suspense>
  );
}
