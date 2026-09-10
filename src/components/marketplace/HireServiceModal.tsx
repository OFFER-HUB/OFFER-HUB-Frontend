"use client";

import React, { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import type { MarketplaceService } from "@/lib/api/marketplace";

export interface HireServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requirements: string) => Promise<void>;
  service: MarketplaceService;
}

export function HireServiceModal({
  isOpen,
  onClose,
  onSubmit,
  service,
}: HireServiceModalProps): React.JSX.Element | null {
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const price = parseFloat(service.price);
  const freelancerFullName = [service.user?.firstName, service.user?.lastName].filter(Boolean).join(" ");
  const freelancerDisplayName =
    freelancerFullName || service.user?.username || service.user?.email?.split("@")[0] || "Specialist";
  const freelancerHandle = service.user?.username ? `@${service.user.username}` : null;
  const professionalTitle = service.user?.professionalTitle || null;

  const userInitials = freelancerFullName
    ? freelancerFullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : freelancerDisplayName.slice(0, 2).toUpperCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(requirements);
      setRequirements("");
      onClose();
    } catch (error) {
      console.error("Failed to hire service:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    setRequirements("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative w-full max-w-xl animate-scale-in p-6 sm:p-8 max-h-[92vh] overflow-y-auto",
          "rounded-3xl bg-background",
          "shadow-[12px_12px_32px_rgba(0,0,0,0.18),-8px_-8px_24px_#ffffff]",
          "border border-white/80 text-text-primary"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-black/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                Order Review
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
              Hire Specialist
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Review order terms and provide project instructions for {freelancerDisplayName}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className={cn(
              "p-2 rounded-2xl text-text-secondary hover:text-text-primary",
              "bg-background shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]",
              "hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
              "transition-all duration-200 disabled:opacity-50"
            )}
            aria-label="Close"
          >
            <Icon path={ICON_PATHS.close} size="sm" />
          </button>
        </div>

        {/* Service & Specialist Overview Card */}
        <div
          className={cn(
            "p-5 rounded-2xl mb-6 bg-white/70",
            "shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff]",
            "border border-white/80"
          )}
        >
          {/* Service Title */}
          <h3 className="text-base font-bold text-[#111827] mb-3 leading-snug">
            {service.title}
          </h3>

          {/* Specialist Identity */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-black/5">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-[2px_2px_5px_#cbd5e1]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#111827] truncate">
                {freelancerDisplayName}
              </p>
              <p className="text-[11px] text-text-secondary truncate">
                {professionalTitle ? `${professionalTitle} • ` : ""}
                {freelancerHandle || service.user?.email}
              </p>
            </div>
          </div>

          {/* Key Metrics Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-background shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-0.5">
                Total Price
              </span>
              <span className="text-sm font-extrabold text-primary font-mono">
                ${price.toLocaleString()} USD
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-background shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-0.5">
                Turnaround
              </span>
              <span className="text-xs font-bold text-text-primary">
                {service.deliveryDays} business days
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-background shadow-[2px_2px_5px_#d1d5db,-2px_-2px_5px_#ffffff]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-0.5">
                Protection
              </span>
              <span className="text-xs font-bold text-text-primary">
                Smart Escrow
              </span>
            </div>
          </div>
        </div>

        {/* Hire Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Requirements Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="modal-requirements" className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Project Instructions & Details
              </label>
              <span className="text-[11px] text-text-secondary font-medium">Optional</span>
            </div>

            <textarea
              id="modal-requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              disabled={isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-2xl resize-none text-sm",
                "bg-white/70 shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff]",
                "border border-white focus:outline-none focus:ring-2 focus:ring-primary/30",
                "text-text-primary placeholder-text-secondary/60 leading-relaxed"
              )}
              placeholder="Describe your specific goals, guidelines, preferred style, or reference links for this project..."
            />
            <p className="text-[11px] text-text-secondary mt-1.5 flex items-center gap-1">
              <Icon path={ICON_PATHS.infoCircle} size="sm" className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>You will also be able to upload files and chat directly in the order workspace.</span>
            </p>
          </div>

          {/* Security & Process Notice */}
          <div
            className={cn(
              "p-4 rounded-2xl bg-white/60",
              "border border-white shadow-[2px_2px_6px_#e2e8f0]",
              "flex items-start gap-3 text-xs text-text-secondary leading-relaxed"
            )}
          >
            <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon path={ICON_PATHS.shield} size="sm" />
            </div>
            <div>
              <p className="font-bold text-[#111827] text-xs mb-0.5">
                Escrow Payment Protection
              </p>
              <p className="text-[11px] text-text-secondary">
                Funds remain securely reserved in escrow. Payment is only released to {freelancerDisplayName} after you inspect and approve the completed delivery.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className={cn(
                "w-full sm:w-1/3 py-3.5 px-4 rounded-2xl font-semibold text-xs sm:text-sm",
                "text-text-secondary hover:text-text-primary bg-background",
                "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                "transition-all duration-200 disabled:opacity-50"
              )}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full sm:w-2/3 py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm text-white",
                "bg-primary hover:bg-primary-hover active:bg-primary-hover",
                "shadow-[5px_5px_14px_#cbd5e1,-5px_-5px_14px_#ffffff]",
                "hover:shadow-[7px_7px_18px_#cbd5e1,-7px_-7px_18px_#ffffff]",
                "active:scale-[0.99] transition-all duration-200",
                "flex items-center justify-center gap-2",
                "disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>Initializing Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm Order • ${price.toLocaleString()} USD</span>
                  <Icon path={ICON_PATHS.chevronRight} size="sm" />
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-text-secondary font-medium">
            By confirming, an order workspace will be created under OfferHub terms.
          </p>
        </form>
      </div>
    </div>
  );
}
