"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, NEUMORPHIC_INSET, ACTION_BUTTON_DEFAULT } from "@/lib/styles";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { Toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/auth-store";
import { getMyKyc, generateTosUrl, type KycProfile } from "@/lib/api/kyc";
import { KycForm } from "@/components/kyc/KycForm";

interface KycFormModalProps {
  isOpen: boolean;
  existingProfile: KycProfile | null;
  onClose: () => void;
  onSaved: (profile: KycProfile) => void;
}

function KycFormModal({ isOpen, existingProfile, onClose, onSaved }: KycFormModalProps): React.JSX.Element | null {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    // items-start, not items-center: a flex container that centers a child
    // taller than the viewport makes the child's top overflow unreachable by
    // scroll in every major browser — the KYC form is long enough (especially
    // with the Colombia fields) to hit this. Anchoring to the top and letting
    // `my-8` on the modal itself provide the breathing room keeps the whole
    // thing scrollable.
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <button
        type="button"
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(NEUMORPHIC_CARD, "relative w-full max-w-2xl my-8 outline-none bg-white animate-scale-in")}
      >
        <div className="flex items-start justify-between mb-5">
          <h2 id={titleId} className="text-lg font-bold text-text-primary">
            {existingProfile ? "Update your KYC information" : "Complete your KYC"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ml-3",
              "text-text-secondary bg-white",
              "shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]",
              "hover:text-text-primary",
              "active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "transition-all duration-150"
            )}
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        </div>

        <KycForm existingProfile={existingProfile} onSuccess={onSaved} onCancel={onClose} />
      </div>
    </div>,
    document.body
  );
}

export interface KycStatusCardProps {
  className?: string;
}

/**
 * Shows the freelancer's compliance status before their first payout can
 * register a BlindPay customer: no profile yet -> submitted, ToS pending ->
 * fully complete. See API issue #249 / frontend issue #431.
 */
export function KycStatusCard({ className }: KycStatusCardProps): React.JSX.Element {
  const token = useAuthStore((state) => state.token);

  const [profile, setProfile] = useState<KycProfile | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStartingTos, setIsStartingTos] = useState(false);
  const [tosError, setTosError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    getMyKyc(token)
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Could not load your KYC status.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleSaved(saved: KycProfile) {
    setProfile(saved);
    setIsFormOpen(false);
    setToast({ type: "success", message: "KYC information saved" });
  }

  async function handleAcceptTerms() {
    if (!token) return;
    setTosError(null);
    setIsStartingTos(true);
    try {
      const url = await generateTosUrl(token);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not start terms-of-service acceptance.";
      setTosError(message);
      setToast({ type: "error", message });
    } finally {
      setIsStartingTos(false);
    }
  }

  const isComplete = Boolean(profile?.blindpayTosId);

  return (
    <div className={cn(NEUMORPHIC_CARD, className)}>
      <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Icon path={ICON_PATHS.shield} size="md" className="text-primary" />
          Identity verification (KYC)
        </h2>
        {isComplete && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <Icon path={ICON_PATHS.check} size="sm" />
            Complete
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary mb-5">
        Required before your first payout — BlindPay needs this to settle your USDC as local currency.
      </p>

      {loadError !== null ? (
        <p role="alert" className="text-sm text-error">
          {loadError}
        </p>
      ) : profile === undefined ? (
        <div role="status" className="flex items-center justify-center gap-2.5 py-8 text-sm text-text-secondary">
          <LoadingSpinner size="sm" />
          Loading KYC status...
        </div>
      ) : profile === null ? (
        <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-6 text-center")}>
          <Icon path={ICON_PATHS.shield} size="lg" className="mx-auto mb-2 text-text-secondary" />
          <p className="text-sm font-medium text-text-primary">You haven&apos;t submitted your KYC yet</p>
          <p className="mt-1 mb-4 text-sm text-text-secondary">
            Submit your information so BlindPay can verify your identity.
          </p>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className={cn(ACTION_BUTTON_DEFAULT, "w-auto mx-auto px-4 py-2 text-xs cursor-pointer")}
          >
            <Icon path={ICON_PATHS.file} size="sm" />
            Complete KYC
          </button>
        </div>
      ) : isComplete ? (
        <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap")}>
          <p className="text-sm text-text-primary">Your identity has been verified with BlindPay.</p>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2 text-xs cursor-pointer")}
          >
            Edit information
          </button>
        </div>
      ) : (
        <div className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4 flex flex-col gap-3")}>
          <p className="text-sm text-text-primary">
            Your information is saved. One step left: accept BlindPay&apos;s terms of service — this opens in a new
            tab and brings you back here automatically once you accept.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isStartingTos}
              onClick={handleAcceptTerms}
              className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed")}
            >
              {isStartingTos ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Icon path={ICON_PATHS.externalLink} size="sm" />
              )}
              Accept BlindPay&apos;s terms
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className={cn(ACTION_BUTTON_DEFAULT, "w-auto px-4 py-2 text-xs cursor-pointer")}
            >
              Edit information
            </button>
          </div>
          {tosError && (
            <p role="alert" className="text-xs text-error">
              {tosError}
            </p>
          )}
        </div>
      )}

      <KycFormModal
        isOpen={isFormOpen}
        existingProfile={profile ?? null}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaved}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
